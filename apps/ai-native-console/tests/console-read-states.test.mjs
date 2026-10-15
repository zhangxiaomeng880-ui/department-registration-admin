import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as guards from '../public/read-guards.mjs';

// Deterministic DOM/transport harness: execute the actual frontend module,
// without dependencies, a server, or any staging/production connection.
class Element {
 constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attrs={};this.listeners={};this.hidden=false;this.disabled=false;this._text='';this._value='';this.className='';this.open=false;this.parentNode=null;this.classList={toggle:()=>{}};}
 set textContent(value){this._text=String(value);this.children=[];}
 get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
 set value(value){this._value=String(value);}
 get value(){return this._value||(this.tagName==='SELECT'?this.children[0]?.value||'':'');}
 append(...nodes){for(const node of nodes){node.parentNode=this;this.children.push(node);}}
 replaceChildren(...nodes){for(const node of this.children)node.parentNode=null;this.children=[];this._text='';this.append(...nodes);if(this.tagName==='SELECT')this._value='';}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this);this.parentNode=null;}
 setAttribute(name,value){this.attrs[name]=String(value);}
 removeAttribute(name){delete this.attrs[name];}
 addEventListener(name,handler){(this.listeners[name]??=[]).push(handler);}
 async emit(name,props={}){for(const handler of this.listeners[name]||[])await handler({target:this,preventDefault(){},...props});}
 reset(){} showModal(){this.open=true;} close(){this.open=false;}
}
const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
const source=(await readFile(new URL('../public/app.js',import.meta.url),'utf8')).replace(/^import .*?;\n/,'').replace(/void bootstrap\(\);\s*$/,'');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const response=(data,status=200)=>({ok:status>=200&&status<300,status,json:async()=>status>=200&&status<300?{data}:{error:data}});
const flush=async()=>{for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));};
const project={id:'p1',projectKey:'PROJ-1',name:'Project one',projectType:'AIGC_CONTENT',workflowTemplateId:'template1'};
const plan=(workItems=[])=>({project:{id:'p1'},milestones:[],iterations:[],dependencies:[],workItems});
const workItem={id:'wi1',itemKey:'TASK-1',title:'Governance item',itemType:'TASK',stageKey:'AIGC_00_INIT'};
const assets={assets:[{id:'a1',assetKey:'ASSET-1',displayName:'Asset one',assetType:'IMAGE'}],versions:[{id:'v1',assetId:'a1',versionNo:1,state:'CURRENT',contentLocator:{provider:'S3_COMPATIBLE',objectKey:'local-fixture'}}]};
const all=(root,predicate)=>[...root.children.flatMap(node=>[...(predicate(node)?[node]:[]),...all(node,predicate)])];
function harness(path='/projects'){
 const elements=new Map(),selectors={'.tab[data-panel]':[],'.filter':[],'[data-global]':[]};
 for(const tag of html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi)){
  const attrs=Object.fromEntries([...tag[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(x=>[x[1],x[2]]));
  const node=new Element(tag[1]);node.className=attrs.class||'';node.hidden=/\bhidden\b/.test(tag[2]);
  for(const [key,value] of Object.entries(attrs)){if(key.startsWith('data-'))node.dataset[key.slice(5)]=value;else node[key]=value;}
  if(attrs.id)elements.set(attrs.id,node);
  if(attrs['data-panel'])selectors['.tab[data-panel]'].push(node);
  if(attrs['data-global'])selectors['[data-global]'].push(node);
  if(node.className.split(' ').includes('filter'))selectors['.filter'].push(node);
 }
 let currentURL=new URL(path,'http://console.test');const stack=[currentURL.pathname];let index=0;
 const location={get pathname(){return currentURL.pathname;},get origin(){return currentURL.origin;},get href(){return currentURL.href;},set href(value){currentURL=new URL(value,currentURL);}};
 const events={};const calls=[];
 const history={pushState(_a,_b,url){currentURL=new URL(url,currentURL);stack.splice(++index);stack.push(currentURL.pathname);},replaceState(_a,_b,url){currentURL=new URL(url,currentURL);stack[index]=currentURL.pathname;}};
 const context=vm.createContext({...guards,URL,console,location,history,
  document:{getElementById:id=>{assert.ok(elements.has(id),'Unknown DOM id: '+id);return elements.get(id);},createElement:tag=>new Element(tag),querySelectorAll:selector=>selectors[selector]||[],addEventListener(){}},
  window:{addEventListener:(name,handler)=>events[name]=handler},
  fetch:(path,options)=>{const pending=deferred();calls.push({path,options,...pending});return pending.promise;}
 });
 vm.runInContext(source+'\nglobalThis.app={state,req,bootstrap,clearSession,loadCatalogs,loadProjects,renderRoute,renderCatalog,navigate,renderCapability,loadKnowledgeBinding,loadAssetModule,parseRoute};',context);
 const app=context.app;app.state.authenticated=true;app.state.sessionEpoch=1;app.state.workspaceRead={status:'ready'};app.state.projectRead={status:'ready'};
 app.state.workspaceId='w1';app.state.workspaces=[{id:'w1'}];app.state.projects=[{...project}];elements.get('workspace').hidden=false;elements.get('login').hidden=true;
 return {app,calls,$:id=>elements.get(id),location,history,events,
  take(suffix){const call=calls.find(x=>!x.taken&&x.path.includes(suffix));assert.ok(call,'Expected request '+suffix+'; got '+calls.map(x=>x.path));call.taken=true;return call;},
  async back(){assert.ok(index>0);currentURL=new URL(stack[--index],currentURL);await events.popstate();},
  async forward(){assert.ok(index<stack.length-1);currentURL=new URL(stack[++index],currentURL);await events.popstate();}
 };
}

for(const [name,status,body,expected] of [['forbidden',403,'DENIED','403'],['missing',404,'MISSING','404'],['upstream',503,'UNAVAILABLE','UNAVAILABLE']]){
 test('project list '+name+' stays Error through renderRoute, never false Empty',async()=>{
  const h=harness();const job=h.app.loadProjects();assert.equal(h.$('projectList').dataset.readState,'loading');
  h.take('/projects?').resolve(response(body,status));await job;
  assert.equal(h.$('projectList').dataset.readState,'error');assert.match(h.$('projectList').textContent,new RegExp(expected));
  await h.app.renderRoute();assert.equal(h.$('projectList').dataset.readState,'error');assert.doesNotMatch(h.$('projectList').textContent,/没有真实项目/);assert.equal(h.$('refresh').disabled,false);
 });
}
test('network, invalid JSON, contract mismatch and incomplete pagination are distinct list errors',async()=>{
 for(const [finish,expected] of [
  [call=>call.reject(new TypeError('offline')),/网络连接失败/],
  [call=>call.resolve({ok:true,status:200,json:async()=>{throw SyntaxError();}}),/JSON/],
  [call=>call.resolve(response({items:[],total:'0'})),/响应格式/],
  [call=>call.resolve(response({items:[],total:2})),/PROJECT_LIST_INCOMPLETE/]
 ]){
  const h=harness(),job=h.app.loadProjects();finish(h.take('/projects?'));await job;
  assert.equal(h.$('projectList').dataset.readState,'error');assert.match(h.$('projectList').textContent,expected);
 }
 const h=harness(),job=h.app.loadProjects();h.take('/projects?').resolve(response({items:[],total:0}));await job;
 assert.equal(h.$('projectList').dataset.readState,'empty');assert.match(h.$('projectList').textContent,/没有真实项目/);
});
test('obsolete project-list finally cannot unlock newer refresh, and obsolete 401 cannot expire it',async()=>{
 const h=harness();const old=h.app.loadProjects(),a=h.take('/projects?');const newer=h.app.loadProjects(),b=h.take('/projects?');
 a.resolve(response('UNAUTHENTICATED',401));await old;assert.equal(h.app.state.authenticated,true);assert.equal(h.$('refresh').disabled,true);
 b.resolve(response({items:[project],total:1}));await newer;assert.equal(h.$('refresh').disabled,false);assert.match(h.$('projectList').textContent,/Project one/);
});
test('workspace and session changes discard old success, errors and auth redirects',async()=>{
 const h=harness();const old=h.app.loadProjects(),a=h.take('/projects?');h.app.state.workspaceId='w2';
 const newer=h.app.loadProjects(),b=h.take('/projects?');b.resolve(response({items:[{...project,id:'p2',name:'Project two'}],total:1,workspaceId:'w2'}));await newer;
 a.resolve(response('UNAUTHENTICATED',401));await old;assert.equal(h.app.state.authenticated,true);assert.match(h.$('projectList').textContent,/Project two/);
 const c=h.app.loadProjects(),stale=h.take('/projects?');h.app.clearSession();stale.resolve(response({items:[project],total:1}));await c;
 assert.equal(h.$('workspace').hidden,true);assert.equal(h.app.state.projects.length,0);assert.equal(h.$('projectList').textContent,'');
});
test('current non-JSON 401 expires session and removes private rows',async()=>{
 const h=harness();h.$('detailRows').append(new Element());const job=h.app.loadProjects();
 h.take('/projects?').resolve({ok:false,status:401,json:async()=>{throw SyntaxError();}});await job;
 assert.equal(h.app.state.authenticated,false);assert.equal(h.$('workspace').hidden,true);assert.equal(h.$('detailRows').children.length,0);assert.match(h.$('loginError').textContent,/登录已失效/);
});
test('workspace and preset catalog callbacks require current session and route',async()=>{
 const h=harness();h.app.state.workspaceRead={status:'idle'};const old=h.app.loadCatalogs(),a=h.take('/workspaces');
 h.app.clearSession();a.resolve(response([{id:'w-old'}]));await old;assert.equal(h.app.state.workspaces.length,0);assert.equal(h.calls.length,1);
 const z=harness();z.app.state.writesEnabled=true;
 const open=z.$('newProject').emit('click'),preset=z.take('/domain-presets');
 assert.equal(z.$('createDialog').open,true);assert.match(z.$('createError').textContent,/正在读取/);
 await z.app.navigate('/projects');preset.resolve(response('EXPIRED',401));await open;
 assert.equal(z.app.state.authenticated,true);assert.equal(z.app.state.presets.length,0);
});
test('capability success, failure and 401 from an old route cannot change a newer view',async()=>{
 for(const result of [response([{name:'OLD CAPABILITY'}]),response('EXPIRED',401),response('DENIED',403)]){
  const h=harness('/capabilities'),old=h.app.renderRoute();const call=h.take('/capabilities');
  await h.app.navigate('/projects');const before=h.$('capabilityRows').textContent;call.resolve(result);await old;
  assert.equal(h.$('capabilityRows').textContent,before);assert.equal(h.app.state.authenticated,true);assert.equal(h.$('catalogScreen').hidden,false);
 }
});
test('WorkItems include itemType TASK, retain legacy deep links, and leave Runtime Task/Run unknown',async()=>{
 const h=harness('/projects/p1/tasks');const list=h.app.renderRoute();h.take('/governance').resolve(response(plan([workItem])));await list;
 assert.match(h.$('taskRows').textContent,/WorkItem ID/);assert.equal(all(h.$('taskRows'),x=>x.tagName==='A')[0].href,'/projects/p1/tasks/wi1');
 const detail=h.app.navigate('/projects/p1/tasks/wi1');h.take('/governance').resolve(response(plan([workItem])));await detail;
 assert.equal(h.$('detailCategory').textContent,'WorkItem 详情');assert.match(h.$('detailRows').textContent,/Runtime Task \/ Run 关联未知/);assert.match(h.$('detailRows').textContent,/itemType=TASK 仍表示 WorkItem/);
 const data=h.app.navigate('/projects/p1/data');h.take('/governance').resolve(response({workItems:[workItem],milestones:[],risks:[]}));h.take('/lifecycle').resolve(response({stages:[]}));await data;
 assert.match(h.$('dataRows').textContent,/WorkItem 总数1/);assert.match(h.$('dataRows').textContent,/Runtime Task 总数未知/);assert.doesNotMatch(h.$('dataRows').textContent,/Runtime Task 总数0/);
});
test('detail switches clear title/meta/rows before fetch and distinguish Not Found from forbidden',async()=>{
 const h=harness('/projects/p1/tasks/wi1');const first=h.app.renderRoute();h.take('/governance').resolve(response(plan([workItem])));await first;
 const next=h.app.navigate('/projects/p1/tasks/missing');assert.equal(h.$('detailTitle').textContent,'读取中');assert.equal(h.$('detailMeta').textContent,'');assert.doesNotMatch(h.$('detailRows').textContent,/Governance item/);
 h.take('/governance').resolve(response('DENIED',403));await next;assert.equal(h.$('detailTitle').textContent,'详情暂不可用');assert.match(h.$('detailRows').textContent,/403/);
 const absent=h.app.renderRoute();h.take('/governance').resolve(response(plan()));await absent;assert.equal(h.$('detailRows').dataset.readState,'not-found');
});
test('stage check is pending before lifecycle, unavailable on failure, and evaluates only returned evidence',async()=>{
 const h=harness('/projects/p1/stages');const job=h.app.renderRoute();assert.match(h.$('aigcStageCheckResult').textContent,/尚未核验/);assert.doesNotMatch(h.$('aigcStageCheckResult').textContent,/未通过|结构通过/);
 h.take('/lifecycle').resolve(response('UNAVAILABLE',503));await job;assert.match(h.$('aigcStageCheckResult').textContent,/尚未核验/);assert.doesNotMatch(h.$('aigcStageCheckResult').textContent,/未通过/);
 const retry=h.app.renderRoute();h.take('/lifecycle').resolve(response({project:{id:'p1',workflowTemplateId:'template1'},template:{id:'template1',templateKey:'STANDARD:AIGC_CONTENT_STANDARD',version:'2.4'},stages:[]}));await flush();
 assert.match(h.$('aigcStageCheckResult').textContent,/当前真实阶段 0\/15/);h.take('/stage-transitions').resolve(response([]));await retry;
});
test('stale project failure and finally cannot alter newer project loading state',async()=>{
 const h=harness('/projects/p1/tasks');const old=h.app.renderRoute(),a=h.take('/governance');const newer=h.app.renderRoute(),b=h.take('/governance');
 a.resolve(response('EXPIRED',401));await old;assert.equal(h.app.state.authenticated,true);assert.equal(h.$('taskRows').dataset.readState,'loading');assert.equal(h.$('taskRows').attrs['aria-busy'],'true');
 b.resolve(response(plan([workItem])));await newer;assert.match(h.$('taskRows').textContent,/Governance item/);assert.equal(h.$('taskRows').attrs['aria-busy'],'false');
});
test('download authorization retries, prevents duplicate in-flight requests, and keeps a single link',async()=>{
 const h=harness('/projects/p1/assets/a1');const detail=h.app.renderRoute();h.take('/aigc-asset-system').resolve(response(assets));await detail;
 const button=all(h.$('detailRows'),x=>x.tagName==='BUTTON')[0];const first=button.emit('click'),call=h.take('/access');await button.emit('click');assert.equal(h.calls.filter(x=>x.path.endsWith('/access')).length,1);assert.equal(button.disabled,true);
 call.resolve(response('DENIED',403));await first;assert.equal(button.disabled,false);assert.equal(all(h.$('detailRows'),x=>x.tagName==='A').length,0);
 const url='/api/runtime/projects/p1/assets/a1/versions/v1';
 for(let i=0;i<2;i++){
  const retry=button.emit('click');assert.equal(all(h.$('detailRows'),x=>x.tagName==='A').length,0);
  h.take('/access').resolve(response({access:'READY',versionId:'v1',contentPath:url+'/content'}));await retry;
  const links=all(h.$('detailRows'),x=>x.tagName==='A');assert.equal(links.length,1);assert.equal(links[0].href,url+'/content');assert.equal(button.disabled,false);
 }
});
test('late download success/error/auth/finally after leaving detail is discarded',async()=>{
 for(const result of [response({access:'READY',versionId:'v1',contentPath:'/api/runtime/projects/p1/assets/a1/versions/v1/content'}),response('DENIED',403),response('EXPIRED',401)]){
  const h=harness('/projects/p1/assets/a1'),detail=h.app.renderRoute();h.take('/aigc-asset-system').resolve(response(assets));await detail;
  const root=h.$('detailRows'),button=all(root,x=>x.tagName==='BUTTON')[0],click=button.emit('click'),call=h.take('/access');
  await h.app.navigate('/projects');call.resolve(result);await click;
  assert.equal(root.children.length,0);assert.equal(button.disabled,true,'stale finally must not mutate detached control');assert.equal(h.app.state.authenticated,true);
 }
});
test('legacy task deep-link refresh, Back and Forward preserve addressable route semantics',async()=>{
 const h=harness('/projects/p1/tasks/wi1');let job=h.app.renderRoute();h.take('/governance').resolve(response(plan([workItem])));await job;
 await h.app.navigate('/projects');job=h.back();h.take('/governance').resolve(response(plan([workItem])));await job;
 assert.equal(h.location.pathname,'/projects/p1/tasks/wi1');assert.equal(h.$('detailTitle').textContent,'Governance item');
 await h.forward();assert.equal(h.location.pathname,'/projects');assert.equal(h.$('detailTitle').textContent,'');
 assert.equal(h.app.parseRoute('/projects/p1/tasks/wi1').kind,'tasks');assert.equal(h.app.parseRoute('/projects/p1/tasks').tab,'tasks');
});

test('current transport aborts remain neutral cancellation rather than network/business failures',async()=>{
 const h=harness(),job=h.app.loadProjects(),error=Error('aborted');error.name='AbortError';
 h.take('/projects?').reject(error);await job;
 assert.equal(h.$('projectList').dataset.readState,'idle');assert.match(h.$('projectList').textContent,/已取消/);assert.doesNotMatch(h.$('projectList').textContent,/网络连接失败|没有真实项目/);assert.equal(h.$('refresh').disabled,false);
 const z=harness('/projects/p1/stages'),stages=z.app.renderRoute();z.take('/lifecycle').reject(error);await stages;
 assert.equal(z.$('stageTable').dataset.readState,'idle');assert.match(z.$('aigcStageCheckResult').textContent,/尚未核验/);
});
test('optional preset dialog shows read errors explicitly and can retry',async()=>{
 const h=harness();h.app.state.writesEnabled=true;
 let job=h.$('newProject').emit('click');h.take('/domain-presets').resolve(response('DENIED',403));await job;
 assert.match(h.$('createError').textContent,/工作流预设不可用.*403/);assert.equal(h.$('createPreset').disabled,false);
 h.$('createDialog').close();job=h.$('newProject').emit('click');h.take('/domain-presets').resolve(response([]));await job;
 assert.equal(h.$('createError').textContent,'');assert.equal(h.app.state.presetRead.status,'ready');
});

const openCreate=async h=>{
 h.app.state.writesEnabled=true;const opening=h.$('newProject').emit('click');h.take('/domain-presets').resolve(response([]));await opening;
 h.$('createKey').value='NEW-PROJECT';h.$('createName').value='New project';h.$('createType').value='AIGC_CONTENT';
};
test('create POST duplicate clicks are blocked; Close/reopen isolates stale success/error/auth/finally',async()=>{
 for(const result of [response({id:'created-old'}),response('DENIED',403),response('EXPIRED',401)]){
  const h=harness();await openCreate(h);
  const first=h.$('createForm').emit('submit'),old=h.take('/api/runtime/projects');await h.$('createForm').emit('submit');
  assert.equal(h.calls.filter(x=>x.options.method==='POST').length,1);assert.equal(h.$('createSubmit').disabled,true);
  await h.$('closeDialog').emit('click');assert.match(h.$('notice').textContent,/不会取消服务器操作/);
  await openCreate(h);h.$('createName').value='Newer project';const newer=h.$('createForm').emit('submit'),latest=h.take('/api/runtime/projects');
  old.resolve(result);await first;
  assert.equal(h.$('createDialog').open,true);assert.equal(h.$('createSubmit').disabled,true);assert.equal(h.$('createName').value,'Newer project');assert.equal(h.$('createError').textContent,'');assert.equal(h.location.pathname,'/projects');assert.equal(h.app.state.authenticated,true);
  assert.equal(h.calls.filter(x=>x.path.includes('/projects?')).length,0,'stale success cannot navigate or refetch');
  latest.resolve(response('NEWER_FAILURE',503));await newer;assert.equal(h.$('createSubmit').disabled,false);assert.match(h.$('createError').textContent,/NEWER_FAILURE/);
 }
});
test('account POST duplicate clicks and stale Close/reopen callbacks cannot alter the new form',async()=>{
 for(const result of [response({ok:true}),response('DENIED',403),response('EXPIRED',401)]){
  const h=harness();await h.$('accountSettings').emit('click');h.$('newPassword').value='replacement-password';h.$('confirmPassword').value='replacement-password';
  const first=h.$('accountForm').emit('submit'),old=h.take('/auth/change-password');await h.$('accountForm').emit('submit');assert.equal(h.calls.length,1);
  await h.$('closeAccount').emit('click');await h.$('accountSettings').emit('click');const newer=h.$('accountForm').emit('submit'),latest=h.take('/auth/change-password');
  old.resolve(result);await first;assert.equal(h.$('accountDialog').open,true);assert.equal(h.$('accountSubmit').disabled,true);assert.equal(h.$('accountError').textContent,'');assert.equal(h.app.state.authenticated,true);
  latest.resolve(response('NEWER_FAILURE',503));await newer;assert.equal(h.$('accountSubmit').disabled,false);assert.match(h.$('accountError').textContent,/结果尚未确认/);
 }
});
test('detail error offers a guarded explicit read retry',async()=>{
 const h=harness('/projects/p1/tasks/wi1'),first=h.app.renderRoute();h.take('/governance').resolve(response('UNAVAILABLE',503));await first;
 const retry=all(h.$('detailRows'),x=>x.tagName==='BUTTON')[0];assert.equal(retry.textContent,'重新读取');const again=retry.emit('click');
 h.take('/governance').resolve(response(plan([workItem])));await again;assert.equal(h.$('detailTitle').textContent,'Governance item');
 await h.app.navigate('/projects');const count=h.calls.length;await retry.emit('click');assert.equal(h.calls.length,count,'detached retry is inert');
});
test('login submission immediately clears the password input and drops superseded response',async()=>{
 const h=harness();h.app.clearSession();h.$('password').value='local-fixture-secret';const login=h.$('loginForm').emit('submit'),call=h.take('/auth/login');
 assert.equal(h.$('password').value,'');assert.equal(h.$('workspace').hidden,true);
 h.app.clearSession();call.resolve(response({ok:true}));await login;assert.equal(h.calls.length,1);assert.equal(h.app.state.authenticated,false);
});
test('BFCache pagehide removes identity and download evidence; persisted pageshow rechecks session',async()=>{
 const h=harness('/projects/p1/assets/a1'),detail=h.app.renderRoute();h.take('/aigc-asset-system').resolve(response(assets));await detail;
 const button=all(h.$('detailRows'),x=>x.tagName==='BUTTON')[0],authorization=button.emit('click'),call=h.take('/access');
 h.events.pagehide();assert.equal(h.app.state.authenticated,false);assert.equal(h.$('workspace').hidden,true);assert.equal(h.$('detailRows').children.length,0);assert.equal(h.$('newProject').disabled,true);
 call.resolve(response({access:'READY',versionId:'v1',contentPath:'/api/runtime/projects/p1/assets/a1/versions/v1/content'}));await authorization;assert.equal(h.$('detailRows').children.length,0);
 h.events.pageshow({persisted:true});const session=h.take('/auth/session');assert.equal(h.$('workspace').hidden,true);session.resolve(response({authenticated:false}));await flush();assert.equal(h.app.state.authenticated,false);
});

test('native dialog Escape/close warns that accepted POST is not cancelled and never replays it',async()=>{
 for(const name of ['create','account']){
  const h=harness();if(name==='create')await openCreate(h);else await h.$('accountSettings').emit('click');
  const job=h.$(name+'Form').emit('submit');const call=h.take(name==='create'?'/api/runtime/projects':'/auth/change-password');
  h.$(name+'Dialog').close();await h.$(name+'Dialog').emit('close');
  assert.match(h.$('notice').textContent,/不会取消服务器操作/);assert.match(h.$('notice').textContent,/先核实结果/);
  call.resolve(response({id:'late-created',ok:true}));await job;
  assert.equal(h.$(name+'Dialog').open,false);assert.equal(h.calls.filter(x=>x.options.method==='POST').length,1);assert.equal(h.location.pathname,'/projects');
 }
});

test('stage evidence distinguishes missing contract fields, explicit null binding and real structural mismatches',async()=>{
 const template={id:'template1',templateKey:'STANDARD:AIGC_CONTENT_STANDARD',version:'2.4'};
 for(const lifecycle of [{stages:[]},{project:{id:'p1'},template,stages:[]},{project:{id:'p1',workflowTemplateId:'template1'},template:{id:'template1'},stages:[]},{project:{id:'p1',workflowTemplateId:'template1'},template,stages:[{}]}]){
  const h=harness('/projects/p1/stages'),job=h.app.renderRoute();h.take('/lifecycle').resolve(response(lifecycle));await job;
  assert.match(h.$('aigcStageCheckResult').textContent,/尚未核验.*响应格式/);assert.doesNotMatch(h.$('aigcStageCheckResult').textContent,/未通过/);assert.equal(h.calls.length,1);
 }
 const missing=harness('/projects/p1/stages');delete missing.app.state.projects[0].workflowTemplateId;
 let job=missing.app.renderRoute();missing.take('/lifecycle').resolve(response({project:{id:'p1',workflowTemplateId:'template1'},template,stages:[]}));await job;assert.match(missing.$('aigcStageCheckResult').textContent,/尚未核验/);
 const unbound=harness('/projects/p1/stages');unbound.app.state.projects[0].workflowTemplateId=null;
 job=unbound.app.renderRoute();unbound.take('/lifecycle').resolve(response({project:{id:'p1',workflowTemplateId:null},template:null,stages:[]}));await flush();unbound.take('/stage-transitions').resolve(response([]));await job;
 assert.match(unbound.$('aigcStageCheckResult').textContent,/未绑定：服务端明确/);assert.doesNotMatch(unbound.$('aigcStageCheckResult').textContent,/未通过/);
 const mismatch=harness('/projects/p1/stages');job=mismatch.app.renderRoute();mismatch.take('/lifecycle').resolve(response({project:{id:'p1',workflowTemplateId:'template1'},template:{...template,version:'2.3'},stages:[]}));await flush();mismatch.take('/stage-transitions').resolve(response([]));await job;
 assert.match(mismatch.$('aigcStageCheckResult').textContent,/未通过.*身份或版本/);
});

test('current create POST network, 5xx, invalid JSON and malformed success remain unconfirmed, with no replay',async()=>{
 for(const finish of [call=>call.reject(new TypeError('offline')),call=>call.resolve(response('UNAVAILABLE',503)),call=>call.resolve({ok:true,status:200,json:async()=>{throw SyntaxError();}}),call=>call.resolve(response({id:{invalid:true}}))]){
  const h=harness();await openCreate(h);const job=h.$('createForm').emit('submit');finish(h.take('/api/runtime/projects'));await job;
  assert.match(h.$('createError').textContent,/结果尚未确认.*先核实.*不会自动重试/);assert.equal(h.$('createDialog').open,true);assert.equal(h.$('createSubmit').disabled,false);assert.equal(h.calls.filter(x=>x.options.method==='POST').length,1);
 }
});
test('incorrect current password is a field error rather than revoking an otherwise valid session',async()=>{
 const h=harness();await h.$('accountSettings').emit('click');const job=h.$('accountForm').emit('submit');h.take('/auth/change-password').resolve(response('CURRENT_PASSWORD_INVALID',401));await job;
 assert.equal(h.app.state.authenticated,true);assert.equal(h.$('accountError').textContent,'当前密码不正确。');assert.equal(h.$('accountSubmit').disabled,false);
});

test('asset domain nonce and parent finally preserve the newer loading state and discard stale 401',async()=>{
 const h=harness('/projects/p1/assets'),route=h.app.renderRoute();h.take('/lifecycle').resolve(response({stages:[]}));await flush();
 const old=h.take('/aigc-asset-system');h.$('domainSelect').value='aigc-review';const latest=h.app.loadAssetModule('p1','aigc-review'),call=h.take('/aigc-review');
 old.resolve(response('EXPIRED',401));await route;assert.equal(h.app.state.authenticated,true);assert.equal(h.$('modules').dataset.readState,'loading');assert.equal(h.$('modules').attrs['aria-busy'],'true');
 call.resolve(response({projectId:'p1',review:'current'}));await latest;assert.match(h.$('modules').textContent,/current/);assert.equal(h.$('modules').dataset.readState,'ready');
});
test('knowledge callbacks honor project, workspace, session and nonce including returning to the same project',async()=>{
 const h=harness('/knowledge');h.$('knowledgeProject').value='p1';const first=h.app.loadKnowledgeBinding('p1'),a=h.take('/knowledge-bindings');
 h.$('knowledgeProject').value='p2';const middle=h.app.loadKnowledgeBinding('p2'),b=h.take('/knowledge-bindings');
 h.$('knowledgeProject').value='p1';const last=h.app.loadKnowledgeBinding('p1'),c=h.take('/knowledge-bindings');
 c.resolve(response([{bindingKey:'CURRENT',sourceKey:'current-source'}]));await last;
 a.resolve(response([{bindingKey:'OLD'}]));b.resolve(response('EXPIRED',401));await Promise.all([first,middle]);
 assert.match(h.$('knowledgeRows').textContent,/CURRENT/);assert.doesNotMatch(h.$('knowledgeRows').textContent,/OLD/);assert.equal(h.app.state.authenticated,true);
 const next=h.app.loadKnowledgeBinding('p1'),old=h.take('/knowledge-bindings');h.app.state.workspaceId='w2';old.resolve(response('DENIED',403));await next;assert.doesNotMatch(h.$('knowledgeRows').textContent,/DENIED/);
});
test('exact AIGC structure passes only structure; duplicate keys and wrong order fail on returned evidence',async()=>{
 const keys=['AIGC_00_INIT','AIGC_01_DISCOVERY','AIGC_02_PLAN','AIGC_03_SCRIPT','AIGC_04_BREAKDOWN','AIGC_05_FORMAT','AIGC_06_ASSET','AIGC_07_IMAGE','AIGC_08_VIDEO_AUDIO','AIGC_09_EDIT','AIGC_10_MASTER','AIGC_11_DERIVATION','AIGC_12_PUBLISH','AIGC_13_PERFORMANCE','AIGC_14_REVIEW'];
 for(const variant of ['exact','duplicate','wrong-order']){
  const h=harness('/projects/p1/stages'),stages=keys.map((stageKey,i)=>({id:'stage-'+i,stageKey,sequenceNo:i+1}));
  if(variant==='duplicate')stages[1].stageKey=stages[0].stageKey;
  if(variant==='wrong-order')[stages[0].sequenceNo,stages[1].sequenceNo]=[2,1];
  const job=h.app.renderRoute();h.take('/lifecycle').resolve(response({project:{id:'p1',workflowTemplateId:'template1'},template:{id:'template1',templateKey:'STANDARD:AIGC_CONTENT_STANDARD',version:'2.4'},stages}));await flush();h.take('/stage-transitions').resolve(response([]));await job;
  assert.match(h.$('aigcStageCheckResult').textContent,variant==='exact'?/结构通过.*不代表全部 Gate 已执行/:/未通过.*Key、顺序或序号/);
 }
});
