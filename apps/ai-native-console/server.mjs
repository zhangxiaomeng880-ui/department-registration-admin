import http from 'node:http';
import { randomBytes, createHash, timingSafeEqual } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root=dirname(fileURLToPath(import.meta.url));
const MIME={'/':'text/html; charset=utf-8','/index.html':'text/html; charset=utf-8','/app.js':'text/javascript; charset=utf-8','/style.css':'text/css; charset=utf-8'};
const ASSETS={'/':'index.html','/index.html':'index.html','/app.js':'app.js','/style.css':'style.css'};
const sessions=new Map(), failed=new Map();
const headers={
  'cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer',
  'x-frame-options':'DENY','content-security-policy':"default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self'; object-src 'none'; base-uri 'none'; frame-ancestors 'none'"
};
const error=(code,status=400)=>Object.assign(new Error(code),{status,code});
const json=(res,status,data,extra={})=>{res.writeHead(status,{...headers,'content-type':'application/json; charset=utf-8',...extra});res.end(JSON.stringify(data));};
const equals=(a,b)=>{const x=createHash('sha256').update(a).digest(),y=createHash('sha256').update(b).digest();return timingSafeEqual(x,y);};
const readJson=async req=>{
  const chunks=[];let size=0;
  for await(const chunk of req){size+=chunk.length;if(size>16384)throw error('REQUEST_TOO_LARGE',413);chunks.push(chunk);}
  try{return JSON.parse(Buffer.concat(chunks).toString('utf8')||'{}');}catch{throw error('INVALID_JSON');}
};
const cookies=req=>Object.fromEntries((req.headers.cookie||'').split(';').map(s=>s.trim().split('=').slice(0,2)).filter(x=>x.length===2));
const sameOrigin=req=>{
  const origin=req.headers.origin;const host=req.headers['x-forwarded-host']||req.headers.host;
  if(!origin||!host)return false;
  try{return new URL(origin).host===String(host).split(',')[0].trim()&&['https:','http:'].includes(new URL(origin).protocol);}catch{return false;}
};
const allowed=(method,path)=>{
  if(method==='GET'){
    if(['/api/runtime/workspaces','/api/runtime/project-types','/api/runtime/project-subtypes','/api/runtime/domain-presets','/api/runtime/aigc-modules','/api/runtime/aigc-ui-labels','/api/runtime/projects'].includes(path))return true;
    if(/^\/api\/runtime\/projects\/[a-zA-Z0-9-]{1,64}\/(audit-events|lifecycle|governance|stage-transitions|aigc-foundation|aigc-script-domain|aigc-breakdown|aigc-format-strategy|aigc-asset-system|aigc-generation-image|aigc-video-audio-production|aigc-edit-timeline|aigc-mastering|aigc-distribution-package|aigc-release-publishing|aigc-performance|aigc-review|product-domain|product-delivery-domain|product-engineering-domain|product-quality-domain|product-outcome|product-review)$/.test(path))return true;
    if(/^\/api\/runtime\/workspaces\/[a-zA-Z0-9-]{1,64}\/(audit-evidence|global-search)$/.test(path))return true;
  }
  return method==='POST'&&path==='/api/runtime/projects';
};
export const createConsoleServer=({env=process.env,fetchImpl=fetch}={})=>{
  if(!env.CONSOLE_ADMIN_PASSWORD||!env.RUNTIME_API_TOKEN||!env.RUNTIME_API_BASE_URL)throw error('CONSOLE_CONFIGURATION_REQUIRED',503);
  if(!/^https:\/\//.test(env.RUNTIME_API_BASE_URL)&&!(env.CONSOLE_ALLOW_HTTP_LOCAL==='true'&&/^http:\/\/localhost(:\d+)?$/.test(env.RUNTIME_API_BASE_URL)))throw error('INVALID_RUNTIME_BASE_URL',503);
  const base=env.RUNTIME_API_BASE_URL.replace(/\/$/,'');
  const secure=env.NODE_ENV==='production' ? '; Secure' : '';
  const sess=req=>{const id=cookies(req).ain_session;const s=id&&sessions.get(id);if(!s||s.exp<Date.now()){if(id)sessions.delete(id);return null;}return s;};
  return http.createServer(async(req,res)=>{
    try{
      const url=new URL(req.url,'http://internal.local'),path=url.pathname;
      if(req.method==='GET'&&path==='/healthz')return json(res,200,{status:'ok',mode:'STAGING_CONSOLE',runtimeConfigured:true});
      if(req.method==='GET'&&path==='/auth/session')return json(res,200,{authenticated:!!sess(req),writesEnabled:env.CONSOLE_ALLOW_WRITES==='true',environment:'STAGING'});
      if(req.method==='POST'){
        if(!sameOrigin(req))throw error('ORIGIN_MISMATCH',403);
        if(req.headers['content-type']?.split(';')[0]!=='application/json')throw error('JSON_CONTENT_TYPE_REQUIRED',415);
      }
      if(req.method==='POST'&&path==='/auth/login'){
        const ip=String(req.headers['x-forwarded-for']||req.socket.remoteAddress||'unknown').split(',')[0].trim();
        const f=failed.get(ip)||{count:0,until:0};
        if(f.count>=5&&Date.now()<f.until)throw error('LOGIN_RATE_LIMITED',429);
        const body=await readJson(req);
        if(!equals(String(body.password||''),String(env.CONSOLE_ADMIN_PASSWORD))){
          failed.set(ip,{count:f.count+1,until:Date.now()+900000});throw error('INVALID_CREDENTIALS',401);
        }
        failed.delete(ip);
        const sid=randomBytes(32).toString('hex');
        sessions.set(sid,{exp:Date.now()+8*3600*1000});
        return json(res,200,{authenticated:true},{'set-cookie':`ain_session=${sid}; Path=/; HttpOnly; SameSite=Strict; Max-Age=28800${secure}`});
      }
      if(req.method==='POST'&&path==='/auth/logout'){
        const sid=cookies(req).ain_session;if(sid)sessions.delete(sid);
        return json(res,200,{authenticated:false},{'set-cookie':`ain_session=; Path=/; HttpOnly; SameSite=Strict; Max-Age=0${secure}`});
      }
      if(path.startsWith('/api/')){
        if(!sess(req))throw error('CONSOLE_UNAUTHORIZED',401);
        if(!allowed(req.method,path))throw error('API_ROUTE_NOT_ALLOWED',403);
        if(req.method!=='GET'&&env.CONSOLE_ALLOW_WRITES!=='true')throw error('STAGING_WRITES_DISABLED',403);
        const body=req.method==='POST'?await readJson(req):null;
        if(req.method==='POST'&&(!body.workspaceId||!body.projectKey||!body.name||!['AIGC_CONTENT','PRODUCT_DEVELOPMENT'].includes(body.projectType)))throw error('INVALID_PROJECT_INPUT');
        const controller=new AbortController();
        const timeout=setTimeout(()=>controller.abort(),15000);
        try{
          const result=await fetchImpl(base+path+url.search,{
            method:req.method,headers:{
              'authorization':'Bearer '+env.RUNTIME_API_TOKEN,
              'accept':'application/json',...(body?{'content-type':'application/json'}:{})
            },...(body?{body:JSON.stringify(body)}:{}),signal:controller.signal
          });
          const raw=(await result.text()).slice(0,1048576);
          let payload;try{payload=JSON.parse(raw);}catch{payload={error:'RUNTIME_NON_JSON_RESPONSE'};}
          return json(res,result.status,payload);
        }finally{clearTimeout(timeout);}
      }
      if(req.method==='GET'&&ASSETS[path]){
        const bytes=await readFile(join(root,'public',ASSETS[path]));
        res.writeHead(200,{...headers,'content-type':MIME[path]});return res.end(bytes);
      }
      throw error('NOT_FOUND',404);
    }catch(e){return json(res,e.status||502,{error:e.code||'UPSTREAM_UNAVAILABLE'});}
  });
};
if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
  try{
    createConsoleServer().listen(Number(process.env.PORT||3000),'0.0.0.0',()=>console.log('AI Native Console listening'));
  }catch(e){console.error(e.code||'STARTUP_FAILED');process.exitCode=1;}
}
