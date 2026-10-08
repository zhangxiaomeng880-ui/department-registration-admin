import test from 'node:test';
import assert from 'node:assert/strict';
import { createConsoleServer } from '../server.mjs';
const env={CONSOLE_ADMIN_PASSWORD:'test-password',RUNTIME_API_TOKEN:'staging-secret',RUNTIME_API_BASE_URL:'https://runtime.example.test',CONSOLE_ALLOW_WRITES:'true'};
const start=async(fetchImpl)=>{
 const server=createConsoleServer({env,fetchImpl});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 return {server,url,close:()=>new Promise(r=>server.close(r))};
};
const fakeResponse=(body,status=200)=>({status,text:async()=>JSON.stringify(body)});
test('unauthorized browser cannot access Runtime proxy or arbitrary routes',async()=>{
 const a=await start(async()=>fakeResponse({data:[]}));
 try{
  const r=await fetch(a.url+'/api/runtime/workspaces');assert.equal(r.status,401);
  const x=await fetch(a.url+'/api/runtime/plans');assert.equal(x.status,401);
 }finally{await a.close();}
});
test('login + real GET + create project proxy; Runtime token never exposed in response',async()=>{
 const observed=[];
 const a=await start(async(u,o)=>{observed.push({u,method:o.method,auth:o.headers.authorization,body:o.body});
   if(o.method==='POST')return fakeResponse({data:{id:'project-real-uuid',name:'真实项目'}},201);
   return fakeResponse({data:{workspaceId:'w1',total:0,items:[]}});});
 try{
  const login=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:a.url,'content-type':'application/json'},body:JSON.stringify({password:'test-password'})});
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const get=await fetch(a.url+'/api/runtime/projects?workspaceId=w1',{headers:{cookie}});
  assert.equal(get.status,200);assert.equal((await get.json()).data.total,0);
  const create=await fetch(a.url+'/api/runtime/projects',{method:'POST',headers:{origin:a.url,cookie,'content-type':'application/json'},body:JSON.stringify({workspaceId:'w1',projectKey:'REAL_01',name:'真实项目',projectType:'AIGC_CONTENT'})});
  assert.equal(create.status,201);assert.equal((await create.json()).data.id,'project-real-uuid');
  assert.equal(observed.length,2);assert.equal(observed[0].auth,'Bearer staging-secret');
  assert.equal(observed[1].method,'POST');
  assert.ok(!JSON.stringify(observed).includes('browser-secret'));
  assert.equal((await(await fetch(a.url+'/api/runtime/credits',{headers:{cookie}})).json()).error,'API_ROUTE_NOT_ALLOWED');
 }finally{await a.close();}
});
test('cross-origin writes and direct front-end token use are rejected',async()=>{
 const a=await start(async()=>fakeResponse({data:[]}));
 try{
  const x=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:'https://evil.invalid','content-type':'application/json'},body:'{}'});
  assert.equal(x.status,403);
  const page=await(await fetch(a.url+'/app.js')).text();
  assert.ok(!page.includes('staging-secret'));
  assert.ok(!page.includes('mockData'));
  assert.ok(!page.includes('localStorage'));
 }finally{await a.close();}
});
test('missing configuration fails closed at startup',()=>{
 assert.throws(()=>createConsoleServer({env:{}}),/CONSOLE_CONFIGURATION_REQUIRED/);
});

test('primary audit endpoint is allowlisted and a production token never reaches browser',async()=>{
 const calls=[];
 const a=await start(async(u,o)=>{
   calls.push({u,auth:o.headers.authorization});
   return fakeResponse({data:{source:'AUDIT_LOGS_PRIMARY',items:[{eventType:'PROJECT_CREATED',id:'42'}]}});
 });
 try{
  const login=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:a.url,'content-type':'application/json'},body:JSON.stringify({password:'test-password'})});
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const result=await fetch(a.url+'/api/runtime/projects/12345678-1234-4234-8234-123456789abc/audit-events?limit=10',{headers:{cookie}});
  assert.equal(result.status,200);
  assert.equal((await result.json()).data.source,'AUDIT_LOGS_PRIMARY');
  assert.equal(calls.length,1);
  assert.ok(calls[0].u.includes('/audit-events?limit=10'));
  assert.equal(calls[0].auth,'Bearer staging-secret');
  assert.equal((await fetch(a.url+'/api/runtime/tenants',{headers:{cookie}})).status,403);
 }finally{await a.close();}
});
test('staging login throttling rejects the sixth bad password',async()=>{
 const a=await start(async()=>fakeResponse({data:[]}));
 try{
  for(let i=0;i<5;i++){
   const r=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:a.url,'content-type':'application/json'},body:JSON.stringify({password:'bad-'+i})});
   assert.equal(r.status,401);
  }
  const blocked=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:a.url,'content-type':'application/json'},body:JSON.stringify({password:'test-password'})});
  assert.equal(blocked.status,429);
 }finally{await a.close();}
});
