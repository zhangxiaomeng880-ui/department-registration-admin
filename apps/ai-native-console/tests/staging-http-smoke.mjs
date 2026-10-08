import assert from 'node:assert/strict';
const consoleUrl=process.env.CONSOLE_URL;
const runtimeUrl=process.env.RUNTIME_URL;
const check=async(url,expected,verify)=>{
 const controller=new AbortController();
 const timeout=setTimeout(()=>controller.abort(),25000);
 try{
  const response=await fetch(url,{signal:controller.signal,redirect:'error',headers:{accept:'application/json'}});
  const raw=await response.text();
  console.log(JSON.stringify({endpoint:new URL(url).pathname,status:response.status,host:new URL(url).host,bodyPreview:raw.slice(0,230)}));
  assert.equal(response.status,expected,'Unexpected HTTP status for '+url);
  const body=JSON.parse(raw);
  if(verify)verify(body);
  return body;
 }finally{clearTimeout(timeout);}
};
assert.ok(consoleUrl?.startsWith('https://')&&runtimeUrl?.startsWith('https://'));
await check(consoleUrl+'/healthz',200,x=>{
 assert.equal(x.status,'ok');assert.equal(x.mode,'STAGING_CONSOLE');
});
await check(consoleUrl+'/auth/session',200,x=>{
 assert.equal(x.authenticated,false);assert.equal(x.writesEnabled,false);
 assert.equal(x.mode,null);assert.equal(x.sharedLoginEnabled,true);
});
await check(consoleUrl+'/api/runtime/workspaces',401,x=>assert.equal(x.error,'CONSOLE_UNAUTHORIZED'));
await check(runtimeUrl+'/ready',200,x=>{
 assert.ok(['ready','degraded'].includes(x.status));
 assert.equal(x.components?.database?.ready,true);
 assert.equal(x.components?.runtimeAuth?.required,true);
});
await check(runtimeUrl+'/api/runtime/projects?workspaceId=00000000-0000-4000-8000-000000000102',401,x=>{
 assert.equal(x.error,'RUNTIME_UNAUTHORIZED');
});
await check(runtimeUrl+'/api/runtime/me',401,x=>assert.equal(x.error,'RUNTIME_UNAUTHORIZED'));
await check(consoleUrl+'/healthz/runtime',404,x=>assert.equal(x.error,'NOT_FOUND'));

const accessPath='/api/runtime/projects/11111111-1111-4111-8111-111111111111/assets/22222222-2222-4222-8222-222222222222/versions/33333333-3333-4333-8333-333333333333/access';
await check(consoleUrl+accessPath,401,x=>assert.equal(x.error,'CONSOLE_UNAUTHORIZED'));
await check(runtimeUrl+accessPath,401,x=>assert.equal(x.error,'RUNTIME_UNAUTHORIZED'));
await check(consoleUrl+accessPath.replace('/access','/content'),401,x=>assert.equal(x.error,'CONSOLE_UNAUTHORIZED'));
console.log('M31_STAGING_HTTP_SMOKE_PASS all=10; scoped identity endpoint auth enforced; temporary probe disabled; browser write NOT TESTED');
