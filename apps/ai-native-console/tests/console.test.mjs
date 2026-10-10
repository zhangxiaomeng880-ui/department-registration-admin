import test from 'node:test';
import assert from 'node:assert/strict';
import { createConsoleServer } from '../server.mjs';
const env={CONSOLE_ADMIN_PASSWORD:'test-password',RUNTIME_API_TOKEN:'staging-secret',RUNTIME_API_BASE_URL:'https://runtime.example.test',CONSOLE_ALLOW_WRITES:'true',CONSOLE_ALLOW_SHARED_ADMIN_LOGIN:'true'};
const scoped='rtk_123456789abc_'+ 'X'.repeat(43);
const start=async(fetchImpl)=>{
 const server=createConsoleServer({env,fetchImpl});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const url='http://127.0.0.1:'+server.address().port;
 return {server,url,close:()=>new Promise(r=>server.close(r))};
};
const fakeResponse=(body,status=200)=>({status,ok:status>=200&&status<300,text:async()=>JSON.stringify(body),json:async()=>body});
test('unauthorized browser cannot access Runtime proxy or arbitrary routes',async()=>{
 const a=await start(async()=>fakeResponse({data:[]}));
 try{
  const r=await fetch(a.url+'/api/runtime/workspaces');assert.equal(r.status,401);
  const x=await fetch(a.url+'/api/runtime/plans');assert.equal(x.status,401);
 }finally{await a.close();}
});
test('per-user scoped credential delegates GET and write to Runtime, never uses admin token',async()=>{
 const observed=[];
 const a=await start(async(u,o)=>{
   observed.push({u,method:o.method,auth:o.headers.authorization,body:o.body});
   if(u.endsWith('/me'))return fakeResponse({data:{principalType:'SCOPED',platformAdmin:false,identityId:'operator-001',permissions:['workspace:read','project:read','project:write']}});
   if(u.endsWith('/workspaces'))return fakeResponse({data:[{id:'w1'}]});
   if(o.method==='POST')return fakeResponse({data:{id:'project-real-uuid',name:'真实项目'}},201);
   return fakeResponse({data:{workspaceId:'w1',total:0,items:[]}});
 });
 try{
  const login=await fetch(a.url+'/auth/login',{
   method:'POST',headers:{origin:a.url,'content-type':'application/json'},
   body:JSON.stringify({credential:scoped})
  });
  assert.equal(login.status,200);
  assert.equal((await login.json()).mode,'scoped');
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const session=await(await fetch(a.url+'/auth/session',{headers:{cookie}})).json();
  assert.equal(session.writesEnabled,true);
  const get=await fetch(a.url+'/api/runtime/projects?workspaceId=w1',{headers:{cookie}});
  assert.equal(get.status,200);assert.equal((await get.json()).data.total,0);
  const create=await fetch(a.url+'/api/runtime/projects',{
   method:'POST',headers:{origin:a.url,cookie,'content-type':'application/json'},
   body:JSON.stringify({workspaceId:'w1',projectKey:'REAL_01',name:'真实项目',projectType:'AIGC_CONTENT'})
  });
  assert.equal(create.status,201);
  assert.equal((await create.json()).data.id,'project-real-uuid');
  assert.equal(observed.length,4);
  assert.ok(observed.every(x=>x.auth==='Bearer '+scoped));
  assert.ok(!JSON.stringify(await(await fetch(a.url+'/auth/session',{headers:{cookie}})).json()).includes(scoped));
  assert.equal((await fetch(a.url+'/api/runtime/credits',{headers:{cookie}})).status,403);
 }finally{await a.close();}
});
test('shared staging access remains read-only even when global writes are enabled',async()=>{
 const calls=[];
 const a=await start(async(u,o)=>{calls.push({u,auth:o.headers.authorization});return fakeResponse({data:[]});});
 try{
  const login=await fetch(a.url+'/auth/login',{
   method:'POST',headers:{origin:a.url,'content-type':'application/json'},
   body:JSON.stringify({password:'test-password'})
  });
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const session=await(await fetch(a.url+'/auth/session',{headers:{cookie}})).json();
  assert.equal(session.mode,'staging-shared-readonly');
  assert.equal(session.writesEnabled,false);
  assert.equal((await fetch(a.url+'/api/runtime/workspaces',{headers:{cookie}})).status,200);
  assert.equal((await fetch(a.url+'/api/runtime/projects',{
   method:'POST',headers:{origin:a.url,cookie,'content-type':'application/json'},
   body:JSON.stringify({workspaceId:'w1',projectKey:'ABC',name:'Unsafe',projectType:'AIGC_CONTENT'})
  })).status,403);
  assert.equal(calls.length,1,'Unsafe write must be denied before upstream');
  assert.equal(calls[0].auth,'Bearer staging-secret');
 }finally{await a.close();}
});
test('scoped credential revocation invalidates the browser session on next Runtime request',async()=>{
 let revoke=false;
 const a=await start(async(u)=>{
  if(revoke)return fakeResponse({error:'RUNTIME_CREDENTIAL_INACTIVE'},401);
  if(u.endsWith('/me'))return fakeResponse({data:{principalType:'SCOPED',platformAdmin:false,identityId:'viewer-001',permissions:['workspace:read','project:read']}});
  return fakeResponse({data:[{id:'w1'}]});
 });
 try{
  const login=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:a.url,'content-type':'application/json'},body:JSON.stringify({credential:scoped})});
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  revoke=true;
  assert.equal((await fetch(a.url+'/api/runtime/workspaces',{headers:{cookie}})).status,401);
  const info=await(await fetch(a.url+'/auth/session',{headers:{cookie}})).json();
  assert.equal(info.authenticated,false);
 }finally{await a.close();}
});
test('scoped login never grants access to a platform admin bearer token',async()=>{
 const a=await start(async()=>fakeResponse({data:[{id:'w1'}]}));
 try{
  const r=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:a.url,'content-type':'application/json'},body:JSON.stringify({credential:'staging-secret'})});
  assert.equal(r.status,401);
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

test('read-only staging diagnostic proves server credential + real contract shape without leaking any IDs',async()=>{
 const paths=[];
 const response=async(url)=>{
  const p=new URL(url).pathname;paths.push(p);
  if(p==='/api/runtime/workspaces')return fakeResponse({data:[{id:'workspace1'}]});
  if(p==='/api/runtime/projects')return fakeResponse({data:{workspaceId:'workspace1',total:1,items:[{id:'project1'}]}});
  if(p==='/api/runtime/projects/project1/lifecycle')return fakeResponse({data:{stages:[{stageKey:'AIGC_00_INIT'}]}});
  if(p==='/api/runtime/projects/project1/audit-events')return fakeResponse({data:{source:'AUDIT_LOGS_PRIMARY',items:[]}});
  return fakeResponse({error:'NOT_FOUND'},404);
 };
 const s=createConsoleServer({env:{...env,CONSOLE_RUNTIME_PROBE_ENABLED:'true'},fetchImpl:response});
 await new Promise(r=>s.listen(0,'127.0.0.1',r));
 const url='http://127.0.0.1:'+s.address().port;
 try{
  const r=await fetch(url+'/healthz/runtime');
  assert.equal(r.status,200);
  const body=await r.json();
  assert.equal(body.status,'ready');
  assert.deepEqual(body.checks,{authorizedWorkspaces:'PASS',projectList:'PASS',lifecycle:'PASS',primaryAudit:'PASS'});
  assert.equal(paths.length,4);
  assert.ok(!JSON.stringify(body).includes('workspace1'));
  assert.ok(!JSON.stringify(body).includes('project1'));
  assert.ok(!JSON.stringify(body).includes('staging-secret'));
 }finally{await new Promise(resolve=>s.close(resolve));}
});
test('staging diagnostic fails closed on invalid Runtime auth',async()=>{
 const s=createConsoleServer({
   env:{...env,CONSOLE_RUNTIME_PROBE_ENABLED:'true'},
   fetchImpl:async()=>fakeResponse({error:'RUNTIME_UNAUTHORIZED'},401)
 });
 await new Promise(r=>s.listen(0,'127.0.0.1',r));
 try{
  const r=await fetch('http://127.0.0.1:'+s.address().port+'/healthz/runtime');
  assert.equal(r.status,503);
  const body=await r.json();
  assert.equal(body.error,'UPSTREAM_HTTP_401');
  assert.equal(body.checks.projectList,'BLOCKED');
 }finally{await new Promise(resolve=>s.close(resolve));}
});

test('read-only Runtime viewer cannot create a project even if server global writes are enabled',async()=>{
 const calls=[];
 const a=await start(async(u,o)=>{
  calls.push({url:u,method:o.method});
  if(u.endsWith('/me'))return fakeResponse({data:{principalType:'SCOPED',platformAdmin:false,identityId:'viewer-001',permissions:['workspace:read','project:read']}});
  return fakeResponse({data:[{id:'w1'}]});
 });
 try{
  const login=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:a.url,'content-type':'application/json'},body:JSON.stringify({credential:scoped})});
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const s=await(await fetch(a.url+'/auth/session',{headers:{cookie}})).json();
  assert.equal(s.mode,'scoped');assert.equal(s.writesEnabled,false);
  const attempt=await fetch(a.url+'/api/runtime/projects',{method:'POST',headers:{origin:a.url,cookie,'content-type':'application/json'},body:JSON.stringify({workspaceId:'w1',projectKey:'X1',name:'should fail',projectType:'AIGC_CONTENT'})});
  assert.equal(attempt.status,403);
  assert.equal(calls.length,2,'No mutation should reach Runtime without project:write');
 }finally{await a.close();}
});
test('scoped login rejects credentials missing project:read even when Runtime workspaces are available',async()=>{
 const a=await start(async(u)=>{
  if(u.endsWith('/me'))return fakeResponse({data:{principalType:'SCOPED',platformAdmin:false,identityId:'viewer-002',permissions:['workspace:read']}});
  return fakeResponse({data:[{id:'w1'}]});
 });
 try{
  const login=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:a.url,'content-type':'application/json'},body:JSON.stringify({credential:scoped})});
  assert.equal(login.status,403);
  assert.equal((await login.json()).error,'SCOPED_READER_PERMISSIONS_REQUIRED');
 }finally{await a.close();}
});

test('file access is personal-scope only; exact binary route never leaks Runtime credential or provider URL',async()=>{
 const projectId='11111111-1111-4111-8111-111111111111';
 const assetId='22222222-2222-4222-8222-222222222222';
 const versionId='33333333-3333-4333-8333-333333333333';
 const path='/api/runtime/projects/'+projectId+'/assets/'+assetId+'/versions/'+versionId;
 const file=new TextEncoder().encode('%PDF-1.7\nfixture data');
 const calls=[];
 const a=await start(async(u,o)=>{
  calls.push({url:u,credential:o.headers.authorization});
  if(u.endsWith('/me'))return fakeResponse({data:{
   principalType:'SCOPED',platformAdmin:false,identityId:'user-with-read',
   permissions:['workspace:read','project:read']
  }});
  if(u.endsWith('/workspaces'))return fakeResponse({data:[{id:'workspaceA'}]});
  if(u.endsWith('/access'))return new Response(JSON.stringify({data:{
   access:'READY',versionId,contentPath:path+'/content',mimeType:'application/pdf',sizeBytes:file.byteLength
  }}),{status:200,headers:{'content-type':'application/json'}});
  if(u.endsWith('/content'))return new Response(file,{status:200,headers:{
   'content-type':'application/pdf','content-length':String(file.byteLength)
  }});
  throw Error('Unexpected URL '+u);
 });
 try{
  const shared=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:a.url,'content-type':'application/json'},body:JSON.stringify({password:'test-password'})});
  assert.equal(shared.status,200);
  const sharedCookie=shared.headers.get('set-cookie').split(';')[0];
  assert.equal((await fetch(a.url+path+'/access',{headers:{cookie:sharedCookie}})).status,403);
  assert.equal((await fetch(a.url+path+'/content',{headers:{cookie:sharedCookie}})).status,403);
  assert.equal(calls.length,0,'shared platform token cannot request private file routes');
  const login=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:a.url,'content-type':'application/json'},body:JSON.stringify({credential:scoped})});
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const grant=await fetch(a.url+path+'/access',{headers:{cookie}});
  assert.equal(grant.status,200);
  assert.equal((await grant.json()).data.access,'READY');
  const download=await fetch(a.url+path+'/content',{headers:{cookie}});
  assert.equal(download.status,200);
  assert.equal(download.headers.get('content-type'),'application/pdf');
  assert.equal(download.headers.get('content-disposition'),'attachment; filename="authorized-asset"');
  assert.deepEqual(new Uint8Array(await download.arrayBuffer()),file);
  assert.ok(calls.every(x=>x.credential==='Bearer '+scoped));
  assert.ok(!JSON.stringify({response:download.headers,logins:calls.map(x=>x.url)}).includes('staging-secret'));
 }finally{await a.close();}
});

test('Runtime permission denial preserves scoped login and subsequent authorized reads',async()=>{
 const a=await start(async u=>{
  if(u.endsWith('/me'))return fakeResponse({data:{principalType:'SCOPED',platformAdmin:false,identityId:'operator',permissions:['workspace:read','project:read']}});
  if(u.endsWith('/lifecycle'))return fakeResponse({error:'PERMISSION_DENIED'},403);
  return fakeResponse({data:[{id:'w1'}]});
 });
 try{
  const login=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:a.url,'content-type':'application/json'},body:JSON.stringify({credential:scoped})});
  assert.equal(login.status,200);
  const cookie=login.headers.get('set-cookie').split(';')[0];
  const denied=await fetch(a.url+'/api/runtime/projects/p1/lifecycle',{headers:{cookie}});
  assert.equal(denied.status,403);
  assert.equal((await denied.json()).error,'PERMISSION_DENIED');
  assert.equal((await(await fetch(a.url+'/auth/session',{headers:{cookie}})).json()).authenticated,true);
  assert.equal((await fetch(a.url+'/api/runtime/workspaces',{headers:{cookie}})).status,200);
 }finally{await a.close();}
});
