import test from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,writeFile,readdir,rm} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join} from 'node:path';
import {createSessionStore} from '../session-store.mjs';
import {createConsoleServer} from '../server.mjs';

test('encrypted personal sessions survive restart, reject tampering and key changes, expire and delete durably',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'console-session-'));
 const env={CONSOLE_SESSION_DIR:directory,CONSOLE_SESSION_KEY:'ab'.repeat(32)};
 const id='12'.repeat(32),session={mode:'scoped',credential:'private-runtime-token',permissions:['project:read'],exp:Date.now()+10000};
 try{
  await createSessionStore(env).set(id,session);
  const bytes=await readFile(join(directory,id+'.session'));
  assert.ok(!bytes.includes(Buffer.from(session.credential)));
  const restarted=createSessionStore(env);
  assert.deepEqual(await restarted.get(id),session);
  assert.equal(await restarted.get('../unsafe'),null);
  assert.equal(await createSessionStore({...env,CONSOLE_SESSION_KEY:'cd'.repeat(32)}).get(id),null);
  const modified=Buffer.from(bytes);modified[modified.length-1]^=1;
  await writeFile(join(directory,id+'.session'),modified);
  assert.equal(await restarted.get(id),null);
  await restarted.set(id,{...session,exp:Date.now()-1});
  assert.equal(await restarted.get(id),null);
  assert.deepEqual(await readdir(directory),[]);
  await restarted.set(id,session);await createSessionStore(env).delete(id);
  assert.equal(await restarted.get(id),null);
  await restarted.set(id,{...session,mode:'staging-credential-admin'});
  assert.deepEqual(await readdir(directory),[],'Admin session must remain in memory only');
 }finally{await rm(directory,{recursive:true,force:true});}
});

test('console restart accepts an existing opaque cookie; logout and Runtime revocation invalidate it across instances',async()=>{
 const directory=await mkdtemp(join(tmpdir(),'console-restart-'));
 const env={RUNTIME_API_BASE_URL:'https://runtime.example.test',CONSOLE_SESSION_DIR:directory,CONSOLE_SESSION_KEY:'ef'.repeat(32)};
 const credential='rtk_123456789abc_'+'X'.repeat(43);let revoked=false;
 const fetchImpl=async url=>{
  const status=revoked?401:200;
  const body=revoked?{error:'REVOKED'}:{data:url.endsWith('/me')?{principalType:'SCOPED',platformAdmin:false,identityId:'test',permissions:['workspace:read','project:read']}:[{id:'w1'}]};
  return {status,ok:status===200,json:async()=>body,text:async()=>JSON.stringify(body)};
 };
 const start=async()=>{const server=createConsoleServer({env,fetchImpl});await new Promise(r=>server.listen(0,'127.0.0.1',r));return {server,url:'http://127.0.0.1:'+server.address().port};};
 const close=server=>new Promise(r=>server.close(r));
 let a,b;
 try{
  a=await start();
  const login=await fetch(a.url+'/auth/login',{method:'POST',headers:{origin:a.url,'content-type':'application/json'},body:JSON.stringify({credential})});
  assert.equal(login.status,200);const cookie=login.headers.get('set-cookie').split(';')[0];
  await close(a.server);a=null;b=await start();
  assert.equal((await(await fetch(b.url+'/auth/session',{headers:{cookie}})).json()).authenticated,true);
  assert.equal((await fetch(b.url+'/api/runtime/workspaces',{headers:{cookie}})).status,200);
  revoked=true;
  assert.equal((await fetch(b.url+'/api/runtime/workspaces',{headers:{cookie}})).status,401);
  assert.equal((await(await fetch(b.url+'/auth/session',{headers:{cookie}})).json()).authenticated,false);
  revoked=false;
  const again=await fetch(b.url+'/auth/login',{method:'POST',headers:{origin:b.url,'content-type':'application/json'},body:JSON.stringify({credential})});
  const nextCookie=again.headers.get('set-cookie').split(';')[0];
  assert.equal((await fetch(b.url+'/auth/logout',{method:'POST',headers:{origin:b.url,cookie:nextCookie,'content-type':'application/json'},body:'{}'})).status,200);
  await close(b.server);b=await start();
  assert.equal((await(await fetch(b.url+'/auth/session',{headers:{cookie:nextCookie}})).json()).authenticated,false);
 }finally{if(a)await close(a.server);if(b)await close(b.server);await rm(directory,{recursive:true,force:true});}
});
