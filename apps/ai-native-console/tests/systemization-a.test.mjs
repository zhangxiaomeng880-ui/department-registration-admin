import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';
import * as guards from '../public/read-guards.mjs';

// Unit evidence only: run the real frontend module against a deterministic DOM
// and transport seam. Mock statuses do not verify server authorization, a real
// browser, or database read-only behavior. No server or network is contacted.
class Element {
 constructor(tag='div') {
  this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.attrs={};this.listeners={};this.hidden=false;this.disabled=false;this._text='';this._value='';this.className='';this.open=false;this.parentNode=null;
  this.classList={toggle:(name,on)=>{const names=new Set(this.className.split(/\s+/).filter(Boolean));if(on??!names.has(name))names.add(name);else names.delete(name);this.className=[...names].join(' ');}};
 }
 set textContent(value){for(const child of this.children)child.parentNode=null;this._text=String(value);this.children=[];}
 get textContent(){return this._text+this.children.map(x=>x.textContent).join('');}
 set innerHTML(_){throw Error('Unsafe innerHTML not supported by acceptance harness');}
 // Reflect href like DOM attributes so removeAttribute cannot falsely pass.
 set href(value){this.attrs.href=String(value);}
 get href(){return this.attrs.href??'';}
 set value(value){this._value=String(value);}
 get value(){return this._value||(this.tagName==='SELECT'?this.children[0]?.value||'':'');}
 append(...nodes){for(let node of nodes){if(typeof node==='string'){const text=new Element('#text');text.textContent=node;node=text;}node.parentNode=this;this.children.push(node);}}
 replaceChildren(...nodes){for(const node of this.children)node.parentNode=null;this.children=[];this._text='';this.append(...nodes);if(this.tagName==='SELECT')this._value='';}
 remove(){if(this.parentNode)this.parentNode.children=this.parentNode.children.filter(x=>x!==this);this.parentNode=null;}
 setAttribute(name,value){this.attrs[name]=String(value);}
 getAttribute(name){return this.attrs[name]??null;}
 removeAttribute(name){delete this.attrs[name];}
 addEventListener(name,handler){(this.listeners[name]??=[]).push(handler);}
 async emit(name,props={}){for(const handler of this.listeners[name]||[])await handler({target:this,preventDefault(){},...props});}
 reset(){} showModal(){this.open=true;} close(){this.open=false;}
}
const html=await readFile(new URL('../public/index.html',import.meta.url),'utf8');
const source=(await readFile(new URL('../public/app.js',import.meta.url),'utf8')).replace(/^import .*?;\n/,'').replace(/void bootstrap\(\);\s*$/,'');
const css=await readFile(new URL('../public/style.css',import.meta.url),'utf8');
const deferred=()=>{let resolve,reject;const promise=new Promise((a,b)=>{resolve=a;reject=b;});return {promise,resolve,reject};};
const response=(data,status=200)=>({ok:status>=200&&status<300,status,json:async()=>status>=200&&status<300?{data}:{error:data}});
const flush=async()=>{for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve));};
const project=(id='p1',extra={})=>({id,projectKey:'KEY-'+id,name:'Project '+id,projectType:'AIGC_CONTENT',workflowTemplateId:'template1',status:'ACTIVE',currentStageKey:'AIGC_00_INIT',currentWorkflowVersion:'2.4',...extra});
const stage=(id='si1',extra={})=>({id,stageKey:'AIGC_00_INIT',displayName:'Stage '+id,sequenceNo:1,status:'READY',agentCapabilityKey:null,gatePolicyKey:null,lastGateResultId:null,blockedReason:null,startedAt:null,completedAt:null,...extra});
const lifecycle=(id='p1',extra={})=>({project:project(id),template:{id:'template1',templateKey:'STANDARD:AIGC_CONTENT_STANDARD',version:'2.4'},stages:[stage()],...extra});
const item=(id='wi1',extra={})=>({id,itemKey:'TASK-'+id,itemType:'TASK',title:'WorkItem '+id,status:'OPEN',priority:'P1',milestoneId:null,iterationId:null,stageKey:'AIGC_00_INIT',...extra});
const governance=(id='p1',extra={})=>({project:{...project(id),health:null},milestones:[],iterations:[],workItems:[item()],dependencies:[],blockers:[],decisions:[],risks:[],...extra});
const event=(id='ev1',extra={})=>({id,projectId:'p1',projectStageInstanceId:'si1',targetStageInstanceId:null,transitionType:'ADVANCE',fromStageKey:'AIGC_00_INIT',toStageKey:'AIGC_01_DISCOVERY',attemptNo:1,actorKey:'fixture-principal',createdAt:'2026-10-01T10:00:00Z',decision:{status:'SECRET_DECISION'},evidence:{note:'SECRET_EVIDENCE'},runId:'registered-run',taskId:null,gateResultId:'registered-gate',checkpointId:null,...extra});
const all=(root,predicate)=>root.children.flatMap(node=>[...(predicate(node)?[node]:[]),...all(node,predicate)]);
function harness(path='/projects/p1/stages') {
 const elements=new Map(),selectors={'.tab[data-panel]':[],'.filter':[],'[data-global]':[]};
 for(const tag of html.matchAll(/<([a-z][a-z0-9-]*)\b([^>]*)>/gi)){
  const attrs=Object.fromEntries([...tag[2].matchAll(/([\w-]+)="([^"]*)"/g)].map(x=>[x[1],x[2]]));
  const node=new Element(tag[1]);node.className=attrs.class||'';node.hidden=/\bhidden\b/.test(tag[2]);
  for(const [key,value] of Object.entries(attrs)){node.attrs[key]=value;if(key.startsWith('data-'))node.dataset[key.slice(5)]=value;else node[key]=value;}
  if(attrs.id)elements.set(attrs.id,node);
  if(attrs['data-panel'])selectors['.tab[data-panel]'].push(node);
  if(attrs['data-global'])selectors['[data-global]'].push(node);
  if(node.className.split(' ').includes('filter'))selectors['.filter'].push(node);
 }
 let currentURL=new URL(path,'http://console.test');const stack=[currentURL.pathname];let index=0;
 const location={get pathname(){return currentURL.pathname;},get origin(){return currentURL.origin;},get href(){return currentURL.href;},set href(value){currentURL=new URL(value,currentURL);}};
 const events={},calls=[];
 const history={pushState(_a,_b,url){currentURL=new URL(url,currentURL);stack.splice(++index);stack.push(currentURL.pathname);},replaceState(_a,_b,url){currentURL=new URL(url,currentURL);stack[index]=currentURL.pathname;}};
 const context=vm.createContext({...guards,URL,console,location,history,
  document:{getElementById:id=>{assert.ok(elements.has(id),'Unknown DOM id: '+id);return elements.get(id);},createElement:tag=>new Element(tag),querySelectorAll:selector=>selectors[selector]||[],addEventListener(){}},
  window:{addEventListener:(name,handler)=>events[name]=handler},
  fetch:(path,options)=>{const pending=deferred();calls.push({path,options,...pending});return pending.promise;}
 });
 vm.runInContext(source+'\nglobalThis.app={state,req,clearSession,loadProjects,renderRoute,navigate,parseRoute,loadTransitions,refreshProject};',context);
 const app=context.app;app.state.authenticated=true;app.state.sessionEpoch=1;app.state.workspaceRead={status:'ready'};app.state.projectRead={status:'ready'};
 app.state.workspaceId='w1';app.state.workspaces=[{id:'w1'}];app.state.projects=[project(),project('p2')];elements.get('workspace').hidden=false;elements.get('login').hidden=true;
 return {app,calls,elements,context,$:id=>{assert.ok(elements.has(id),'Unknown DOM id: '+id);return elements.get(id);},location,history,events,
  take(suffix){const call=calls.find(x=>!x.taken&&x.path.includes(suffix));assert.ok(call,'Expected request '+suffix+'; got '+calls.map(x=>x.path));call.taken=true;return call;},
  pending(suffix){return calls.filter(x=>!x.taken&&x.path.includes(suffix));},
  async back(){assert.ok(index>0);currentURL=new URL(stack[--index],currentURL);await events.popstate();},
  async forward(){assert.ok(index<stack.length-1);currentURL=new URL(stack[++index],currentURL);await events.popstate();}
 };
}
const privateText=h=>[...h.elements.values()].map(x=>x.textContent).join('\n');
const readonly=h=>assert.ok(h.calls.every(x=>(x.options.method||'GET')==='GET'),'A paths must use GET only');
const noOldEvidence=h=>assert.doesNotMatch(h.$('transitions').textContent,/SECRET_DECISION|SECRET_EVIDENCE|EV_OLD_SECRET|registered-run|registered-gate/);
const retryButton=h=>{const button=all(h.$('transitions'),x=>x.tagName==='BUTTON'&&/重新读取/.test(x.textContent))[0];assert.ok(button,'Evidence needs a dedicated explicit retry');return button;};
async function openStages(h,l=lifecycle(),changes=[event()]) {
 const job=h.app.renderRoute();h.take('/lifecycle').resolve(response(l));await flush();
 if(h.pending('/stage-transitions').length)h.take('/stage-transitions').resolve(response(changes));
 await job;return h;
}
async function openOverview(h,g=governance(),l=lifecycle()){
 const job=h.app.renderRoute();h.take('/governance').resolve(response(g));h.take('/lifecycle').resolve(response(l));await job;return h;
}
async function openPlan(h,g=governance()){
 const job=h.app.renderRoute();h.take('/governance').resolve(response(g));await job;return h;
}

// All 31 acceptance IDs are mapped in reports/systemization-a-acceptance.json.
// A0-01 is a separate explicit integrity command under reports, not a
// mandatory product test that depends on a sibling frozen workspace.

test('A0-02 refresh fetches directory before current page and updates header and source fields',async()=>{
 const h=harness('/projects/p1/overview');await openOverview(h);const before=h.calls.length;
 const job=h.$('refreshProject').emit('click');const catalog=h.take('/projects?');
 assert.equal(h.calls.length,before+1,'Refresh must start with existing directory GET');
 const fresh=project('p1',{name:'REFRESHED PROJECT',status:'PAUSED',currentStageKey:'AIGC_02_PLAN'});
 catalog.resolve(response({items:[fresh],total:1,workspaceId:'w1'}));await flush();
 h.take('/governance').resolve(response(governance('p1',{project:{...fresh,health:'RED'}})));
 h.take('/lifecycle').resolve(response(lifecycle('p1',{project:fresh})));await job;
 assert.match(h.$('projectTitle').textContent,/REFRESHED PROJECT/);assert.match(h.$('projectStatus').textContent,/PAUSED/);
 assert.match(privateText(h),/AIGC_02_PLAN/);readonly(h);
});

test('A0-03 refreshed directory failure, 403 and current 401 clear old current-project data',async()=>{
 for(const failure of ['network',403,401]){
  const h=harness('/projects/p1/overview');await openOverview(h,governance('p1',{project:project('p1',{name:'OLD_GOVERNANCE_SECRET'})}),lifecycle('p1',{stages:[stage('si1',{blockedReason:'OLD_STAGE_SECRET'})]}));
  assert.equal(h.$('overviewPlanLink').getAttribute('href'),'/projects/p1/tasks');assert.equal(h.$('overviewStagesLink').getAttribute('href'),'/projects/p1/stages');
  const job=h.$('refreshProject').emit('click');const call=h.take('/projects?');
  if(failure==='network')call.reject(new TypeError('offline'));else call.resolve(response('DENIED',failure));await job;
  assert.doesNotMatch(privateText(h),/OLD_GOVERNANCE_SECRET|OLD_STAGE_SECRET/);
  for(const id of ['overviewPlanLink','overviewStagesLink']){assert.equal(h.$(id).getAttribute('href'),null);assert.equal(h.$(id).href,'');}
  assert.equal(h.calls.filter(x=>x.path.includes('/governance')).length,1,'Failed catalog must not refetch object data');
  if(failure===401){assert.equal(h.app.state.authenticated,false);assert.equal(h.$('workspace').hidden,true);}
  else {assert.equal(h.$('projectScreen').hidden,true);assert.match(h.$('projectList').textContent,failure===403?/403/:/网络连接失败/);}
 }
});

test('A0-04 overview collections missing or null are local contract errors, empty is not failure',async()=>{
 const fields={milestones:'milestones',blockers:'governanceBlockers',decisions:'governanceDecisions'};
 for(const [field,root] of Object.entries(fields))for(const variant of ['missing','null','empty']){
  const h=harness('/projects/p1/overview'),g=governance();if(variant==='missing')delete g[field];else g[field]=variant==='null'?null:[];
  await openOverview(h,g);
  assert.equal(h.$('lifecycleSummary').dataset.readState,'ready');assert.equal(h.$('lifecycleStage').textContent,'AIGC_00_INIT');assert.equal(h.$('workflowVersion').textContent,'2.4');
  if(variant==='empty'){assert.doesNotMatch(h.$(root).textContent,/响应格式|CONTRACT/);assert.notEqual(h.$(root).dataset.readState,'error');}
  else{assert.match(h.$(root).textContent,/响应格式|CONTRACT/);assert.equal(h.$(root).dataset.readState,'error');}
 }
});

test('A0-04 plan required arrays and object identity reject missing, null and invalid string fields',async()=>{
 for(const field of ['workItems','milestones','iterations','dependencies'])for(const value of [undefined,null]){
  const h=harness('/projects/p1/tasks'),g=governance();if(value===undefined)delete g[field];else g[field]=value;await openPlan(h,g);
  assert.match(h.$('taskRows').textContent,/响应格式|CONTRACT/);assert.doesNotMatch(h.$('taskRows').textContent,/没有服务端 WorkItem/);
 }
 for(const malformed of [governance('p2'),governance('p1',{workItems:[item('wi1',{milestoneId:{bad:true}})]}),governance('p1',{iterations:[{id:7,name:'invalid'}]})]){
  const h=harness('/projects/p1/tasks');await openPlan(h,malformed);assert.match(h.$('taskRows').textContent,/响应格式|CONTRACT/);
 }
});

test('A0-05 directory old success/error/401/finally cannot alter the new workspace/session',async()=>{
 for(const variant of ['success','403','401','network']){
  const h=harness('/projects');const first=h.app.loadProjects(),old=h.take('/projects?');
  h.app.state.workspaceId='w2';h.app.state.sessionEpoch++;const next=h.app.loadProjects(),current=h.take('/projects?');
  if(variant==='network')old.reject(new TypeError('offline'));else old.resolve(variant==='success'?response({items:[project('old',{name:'OLD_DIRECTORY_SECRET'})],total:1}):response('OLD_FAILURE',Number(variant)));
  await first;assert.equal(h.$('refresh').disabled,true);assert.equal(h.app.state.authenticated,true);
  assert.doesNotMatch(privateText(h),/OLD_DIRECTORY_SECRET|OLD_FAILURE/);
  current.resolve(response({items:[project('p2')],total:1,workspaceId:'w2'}));await next;
  assert.match(h.$('projectList').textContent,/Project p2/);assert.equal(h.$('refresh').disabled,false);
 }
});

test('A0-06 overview reports source mismatch and governance failure without erasing lifecycle',async()=>{
 const h=harness('/projects/p1/overview');await openOverview(h,governance('p1',{project:project('p1',{currentStageKey:'G_STAGE'})}),lifecycle('p1',{project:project('p1',{currentStageKey:'L_STAGE'})}));
 assert.match(h.$('governanceStage').textContent,/G_STAGE/);assert.match(h.$('lifecycleStage').textContent,/L_STAGE/);assert.match(h.$('sourceComparison').textContent,/不一致/);
 const job=h.app.renderRoute();h.take('/governance').resolve(response('GOVERNANCE_UNAVAILABLE',500));h.take('/lifecycle').resolve(response(lifecycle()));await job;
 assert.match(h.$('governanceSummary').textContent,/读取失败|GOVERNANCE_UNAVAILABLE/);assert.equal(h.$('lifecycleSummary').dataset.readState,'ready');assert.equal(h.$('lifecycleStage').textContent,'AIGC_00_INIT');assert.equal(h.$('workflowVersion').textContent,'2.4');
 assert.doesNotMatch(privateText(h),/G_STAGE|L_STAGE/);
});

test('A1-01 governance blockers and lifecycle blocked reasons remain independent in either direction',async()=>{
 for(const side of ['governance','stage']){
  const h=harness('/projects/p1/overview');const g=governance('p1',{blockers:side==='governance'?[{id:'b1',blockingObjectType:'WORK_ITEM',blockingObjectId:'wi1',reason:'GOVERNANCE_BLOCK_ONLY',status:'RESOLVED',resumeCondition:null}]:[]});
  const l=lifecycle('p1',{stages:[stage('si1',{blockedReason:side==='stage'?'STAGE_BLOCK_ONLY':null})]});await openOverview(h,g,l);
  if(side==='governance'){assert.match(h.$('governanceBlockers').textContent,/GOVERNANCE_BLOCK_ONLY/);assert.doesNotMatch(h.$('stageBlockers').textContent,/GOVERNANCE_BLOCK_ONLY/);}
  else{assert.match(h.$('stageBlockers').textContent,/STAGE_BLOCK_ONLY/);assert.doesNotMatch(h.$('governanceBlockers').textContent,/STAGE_BLOCK_ONLY/);}
 }
});

test('A1-02 health is governance-only, progress zero is real, invalid progress stays unknown',async()=>{
 for(const health of [null,'RED','UNRECOGNIZED_HEALTH']){
  const h=harness('/projects/p1/overview');await openOverview(h,governance('p1',{project:project('p1',{health}),milestones:[0,35,100,-1,101,'35',null,Infinity].map((progressPercent,i)=>({id:'m'+i,displayName:'Milestone '+i,managementStatus:'PLANNED',workflowStatus:'NOT_STARTED',progressPercent,plannedStart:null,plannedEnd:null}))}));
  assert.match(h.$('governanceHealth').textContent,health===null?/未知/:new RegExp(health));
  if(health==='UNRECOGNIZED_HEALTH')assert.match(h.$('governanceHealth').textContent,/未识别/);
  const rows=h.$('milestones').children;assert.match(rows[0].textContent,/0%/);assert.match(rows[1].textContent,/35%/);assert.match(rows[2].textContent,/100%/);
  for(const row of rows.slice(3))assert.match(row.textContent,/未知/);
  assert.doesNotMatch(privateText(h),/总体进度|项目进度\s*\d+%/);
 }
});

test('A1-03 original blocker and decision statuses survive, no invented pending count or recovery action',async()=>{
 const h=harness('/projects/p1/overview');await openOverview(h,governance('p1',{blockers:['RESOLVED','UNKNOWN_STATE'].map((status,i)=>({id:'b'+i,blockingObjectType:'RUN',blockingObjectId:'same-id',reason:'Reason '+i,status,resumeCondition:null})),decisions:['APPROVED','REJECTED','ODD_STATE'].map((status,i)=>({id:'d'+i,title:'Decision '+i,status}))}));
 for(const status of ['RESOLVED','UNKNOWN_STATE'])assert.match(h.$('governanceBlockers').textContent,new RegExp(status));
 for(const status of ['APPROVED','REJECTED','ODD_STATE'])assert.match(h.$('governanceDecisions').textContent,new RegExp(status));
 assert.doesNotMatch(privateText(h),/待处理\s*[235]|自动恢复|立即审批/);assert.equal(all(h.$('governanceBlockers'),x=>x.tagName==='A').length,0);
});

test('A1-04 static supplement only: native overview links and focus-visible CSS exist; browser acceptance BLOCKED',async()=>{
 const h=harness('/projects/p1/overview');await openOverview(h);
 assert.equal(h.$('overviewPlanLink').tagName,'A');assert.equal(h.$('overviewPlanLink').href,'/projects/p1/tasks');assert.equal(h.$('overviewStagesLink').href,'/projects/p1/stages');
 assert.match(css,/:focus-visible/);assert.doesNotMatch(html,/\/projects\/[^" ]+\/(plan|execution)/);
});

test('A2-01 plan formal milestone/iteration matching distinguishes null and unresolved target IDs',async()=>{
 const h=harness('/projects/p1/tasks');await openPlan(h,governance('p1',{milestones:[{id:'m1',displayName:'FORMAL_MILESTONE'}],iterations:[{id:'i1',name:'FORMAL_ITERATION',sequenceNo:1}],workItems:[item('matched',{milestoneId:'m1',iterationId:'i1'}),item('unregistered'),item('missing',{milestoneId:'missing-m',iterationId:'missing-i'})]}));
 const body=h.$('taskRows').textContent;assert.match(body,/FORMAL_MILESTONE/);assert.match(body,/FORMAL_ITERATION/);assert.match(body,/未登记/);assert.match(body,/未确认|不可确认/);assert.match(body,/missing-m/);assert.match(body,/missing-i/);
 for(const a of all(h.$('taskRows'),x=>x.tagName==='A'))assert.ok(a.href.startsWith('/projects/p1/'),'Must never link to another project');
});

test('A2-02 dependency links require exact object type plus same-project returned ID',async()=>{
 const h=harness('/projects/p1/tasks');await openPlan(h,governance('p1',{workItems:[item('same-id')],milestones:[{id:'same-id',displayName:'MILESTONE_COLLISION'}],iterations:[{id:'same-id',name:'ITERATION_COLLISION',sequenceNo:1}],dependencies:[
  {id:'dep-work',sourceType:'WORK_ITEM',sourceId:'same-id',targetType:'WORK_ITEM',targetId:'same-id',dependencyType:'FINISH_START',status:'ACTIVE',criticalPath:false},
  {id:'dep-milestone',sourceType:'MILESTONE',sourceId:'same-id',targetType:'ITERATION',targetId:'same-id',dependencyType:'FINISH_START',status:'ACTIVE',criticalPath:false},
  {id:'dep-unknown',sourceType:'RUN',sourceId:'same-id',targetType:'TASK',targetId:'same-id',dependencyType:'FINISH_START',status:'ACTIVE',criticalPath:false},
  {id:'dep-missing',sourceType:'WORK_ITEM',sourceId:'not-returned',targetType:'MYSTERY',targetId:'same-id',dependencyType:'FINISH_START',status:'ACTIVE',criticalPath:false}
 ]}));
 const root=h.$('planDependencies'),links=all(root,x=>x.tagName==='A');assert.equal(links.filter(x=>x.href==='/projects/p1/tasks/same-id').length,2,'Only the two WORK_ITEM endpoints may link as WorkItem');
 assert.match(root.textContent,/MILESTONE_COLLISION/);assert.match(root.textContent,/ITERATION_COLLISION/);assert.match(root.textContent,/RUN/);assert.match(root.textContent,/TASK/);assert.match(root.textContent,/not-returned/);
 assert.ok(links.every(x=>!x.href.includes('/runs/')&&!x.href.includes('not-returned')));
});

test('A2-03 TASK and stageKey keep WorkItem identity and unknown runtime relationship',async()=>{
 const h=harness('/projects/p1/tasks/wi1');await openPlan(h);
 assert.equal(h.$('detailCategory').textContent,'WorkItem 详情');assert.match(h.$('detailRows').textContent,/itemType=TASK 仍表示 WorkItem/);
 assert.match(h.$('detailRows').textContent,/Runtime Task \/ Run 关联未知/);assert.doesNotMatch(h.$('detailRows').textContent,/Run 总数0|Runtime Task 总数0/);
 assert.ok(all(h.$('detailRows'),x=>x.tagName==='A').every(x=>!x.href.includes('/runs/')));readonly(h);
});

test('A2-04 list detail return direct refresh and missing detail preserve context without stale rows',async()=>{
 const g=governance('p1',{workItems:[item('wi1',{milestoneId:'m1'})],milestones:[{id:'m1',displayName:'DETAIL_MILESTONE'}]});const h=harness('/projects/p1/tasks');await openPlan(h,g);
 let job=h.app.navigate('/projects/p1/tasks/wi1');h.take('/governance').resolve(response(g));await job;
 assert.equal(h.$('detailBack').href,'/projects/p1/tasks');assert.match(h.$('detailRows').textContent,/DETAIL_MILESTONE/);
 job=h.app.renderRoute();h.take('/governance').resolve(response(g));await job;assert.match(h.$('detailRows').textContent,/DETAIL_MILESTONE/);
 job=h.app.navigate('/projects/p1/tasks/missing');assert.doesNotMatch(h.$('detailRows').textContent,/DETAIL_MILESTONE/);h.take('/governance').resolve(response(g));await job;
 assert.equal(h.$('detailRows').dataset.readState,'not-found');assert.match(h.$('detailRows').textContent,/未返回|未找到/);
 job=h.app.navigate('/projects/p1/tasks');h.take('/governance').resolve(response({...g,workItems:[]}));await job;assert.match(h.$('taskRows').textContent,/没有|暂无/);assert.notEqual(h.$('taskRows').dataset.readState,'not-found');
});

test('A3-01 lifecycle survives evidence forbidden, server failure and true empty separately',async()=>{
 const h=harness();
 for(const status of [403,500,200]){
  const job=h.app.renderRoute();h.take('/lifecycle').resolve(response(lifecycle()));await flush();
  h.take('/stage-transitions').resolve(response(status===200?[]:'EVIDENCE_FAILURE',status));await job;
  assert.match(h.$('stageTable').textContent,/Stage si1/);assert.notEqual(h.$('stageTable').dataset.readState,'error');
  assert.match(h.$('transitions').textContent,status===403?/403|无权/:status===500?/读取失败/:/没有|暂无|未返回|无返回/);
  if(status!==200)assert.doesNotMatch(h.$('transitions').textContent,/暂无.*记录|没有.*记录/);
 }
 readonly(h);
});

test('A3-02 evidence exact instance attribution never falls back to duplicate stage keys',async()=>{
 const h=harness();await openStages(h,lifecycle('p1',{stages:[stage('si1',{displayName:'INSTANCE_ONE'}),stage('si2',{displayName:'INSTANCE_TWO',sequenceNo:2})]}),[
  event('EXACT_ONE'),event('EXACT_TWO',{projectStageInstanceId:'si2'}),event('MISSING_INSTANCE',{projectStageInstanceId:null}),event('WRONG_INSTANCE',{projectStageInstanceId:'absent'}),event('WRONG_TARGET',{targetStageInstanceId:'absent'})
 ]);
 const root=h.$('transitions');assert.match(root.textContent,/EXACT_ONE/);assert.match(root.textContent,/EXACT_TWO/);assert.match(root.textContent,/归属待确认/);
 const groups=all(root,x=>x.dataset.stageInstanceId!==undefined);
 const one=groups.find(x=>x.dataset.stageInstanceId==='si1'),two=groups.find(x=>x.dataset.stageInstanceId==='si2');
 assert.ok(one&&two,'Exact instance groups expose their natural stage instance identity');
 assert.match(one.textContent,/EXACT_ONE/);assert.doesNotMatch(one.textContent,/EXACT_TWO|MISSING_INSTANCE|WRONG_INSTANCE|WRONG_TARGET/);
 assert.match(two.textContent,/EXACT_TWO/);assert.doesNotMatch(two.textContent,/EXACT_ONE|MISSING_INSTANCE|WRONG_INSTANCE|WRONG_TARGET/);
 const unconfirmed=groups.find(x=>x.dataset.attribution==='unconfirmed');assert.ok(unconfirmed);assert.match(unconfirmed.textContent,/MISSING_INSTANCE/);assert.match(unconfirmed.textContent,/WRONG_INSTANCE/);assert.match(unconfirmed.textContent,/WRONG_TARGET/);
 assert.ok(all(root,x=>x.tagName==='A').every(x=>!x.href.includes('/runs/')));
});

test('A3-03 nested evidence uses native details and inert safe text, null remains incomplete',async()=>{
 const h=harness(),payload='<img src="https://invalid.test/leak" onerror="globalThis.injected=true"><script>globalThis.injected=true</script>';
 await openStages(h,lifecycle(),[event('rich',{decision:{nested:{status:payload}},evidence:{items:[{url:'https://invalid.test/never-open',text:payload}]}}),event('none',{decision:null,evidence:null,createdAt:'not-a-date'})]);
 const root=h.$('transitions');assert.match(root.textContent,/<img src=/);assert.match(root.textContent,/<script>/);assert.match(root.textContent,/未返回|无可展示/);
 assert.ok(all(root,x=>x.tagName==='DETAILS').length>0);assert.ok(all(root,x=>x.tagName==='SUMMARY').length>0);
 assert.equal(all(root,x=>['SCRIPT','IMG','IFRAME'].includes(x.tagName)).length,0);assert.equal(h.context.injected,undefined);
 assert.ok(h.calls.every(x=>x.path.startsWith('/api/runtime/projects/p1/')));assert.ok(all(root,x=>x.tagName==='A').every(x=>!x.href.startsWith('https://invalid.test')));assert.match(root.textContent,/时间未知/);readonly(h);
});

test('A3-04 stage Agent and Gate keys remain configuration and references without execution claims',async()=>{
 const h=harness();await openStages(h,lifecycle('p1',{stages:[stage('si1',{agentCapabilityKey:'configured-agent',gatePolicyKey:'configured-policy',lastGateResultId:'gate-ref-only',startedAt:null,completedAt:null})]}),[]);
 assert.match(h.$('stageTable').textContent,/阶段Agent配置|阶段 Agent 配置/);assert.match(h.$('stageTable').textContent,/configured-agent/);assert.match(h.$('stageTable').textContent,/Gate.*引用|Gate 结果引用/);
 assert.match(h.$('stageTable').textContent,/gate-ref-only/);assert.doesNotMatch(h.$('stageTable').textContent,/正在运行|Gate.*通过/);
 assert.equal(all(h.$('stageTable'),x=>x.tagName==='BUTTON'||x.tagName==='A').length,0);
});

test('A3-05 missing binding, explicit unbound, exact fifteen and wrong keys retain structure-only meaning',async()=>{
 const keys=['AIGC_00_INIT','AIGC_01_DISCOVERY','AIGC_02_PLAN','AIGC_03_SCRIPT','AIGC_04_BREAKDOWN','AIGC_05_FORMAT','AIGC_06_ASSET','AIGC_07_IMAGE','AIGC_08_VIDEO_AUDIO','AIGC_09_EDIT','AIGC_10_MASTER','AIGC_11_DERIVATION','AIGC_12_PUBLISH','AIGC_13_PERFORMANCE','AIGC_14_REVIEW'];
 for(const variant of ['missing','unbound','exact','duplicate','order']){
  const h=harness();let l=lifecycle('p1',{stages:keys.map((stageKey,i)=>stage('si'+i,{stageKey,sequenceNo:i+1}))});
  if(variant==='missing')delete l.project.workflowTemplateId;
  if(variant==='unbound'){h.app.state.projects[0].workflowTemplateId=null;l=lifecycle('p1',{project:project('p1',{workflowTemplateId:null}),template:null,stages:[]});}
  if(variant==='duplicate')l.stages[1].stageKey=l.stages[0].stageKey;
  if(variant==='order')[l.stages[0].sequenceNo,l.stages[1].sequenceNo]=[2,1];
  await openStages(h,l,[]);assert.match(h.$('aigcStageCheckResult').textContent,variant==='missing'?/尚未核验/:variant==='unbound'?/未绑定/:variant==='exact'?/结构通过.*不代表全部 Gate/:/未通过/);
 }
});

test('A3-06 limit 50 is bounded ascending returned evidence, never latest or complete history',async()=>{
 // The seam returns the first 50 from a >50 fixture as the documented existing
 // query does; this proves request/label behavior, not backend SQL ordering.
 const fixture=Array.from({length:57},(_,i)=>event('ev-'+i,{createdAt:new Date(Date.UTC(2026,0,1,0,i)).toISOString()}));
 const h=harness();await openStages(h,lifecycle(),fixture.slice(0,50));
 const call=h.calls.find(x=>x.path.includes('/stage-transitions'));assert.equal(new URL(call.path,'http://console.test').searchParams.get('limit'),'50');
 const combined=html+'\n'+h.$('transitions').textContent;assert.match(combined,/升序/);assert.match(combined,/截断|不代表全量|并非全量|非全量/);assert.doesNotMatch(combined,/最近\s*50|全部历史|完整历史/);
 assert.match(h.$('transitions').textContent,/ev-49/);assert.doesNotMatch(h.$('transitions').textContent,/ev-50/);
});

test('A3-07 mock dual permission then project-only 403 clears old evidence DOM and keeps stages',async()=>{
 const h=harness();await openStages(h,lifecycle(),[event('EV_OLD_SECRET')]);assert.match(h.$('transitions').textContent,/SECRET_DECISION/);
 const oldDetails=all(h.$('transitions'),x=>x.tagName==='DETAILS');for(const node of oldDetails)node.open=true;
 const job=h.app.loadTransitions('p1');noOldEvidence(h);assert.match(h.$('stageTable').textContent,/Stage si1/);
 h.take('/stage-transitions').resolve(response('RUN_READ_FORBIDDEN',403));await job;
 assert.match(h.$('transitions').textContent,/403/);noOldEvidence(h);assert.equal(all(h.$('transitions'),x=>x.tagName==='DETAILS'||x.tagName==='A').length,0);
 for(const node of oldDetails){let root=node;while(root.parentNode)root=root.parentNode;assert.notEqual(root,h.$('transitions'),'Old details must be detached from the protected DOM, not hidden');assert.equal([...h.elements.values()].includes(root),false);}
 assert.match(h.$('stageTable').textContent,/Stage si1/);assert.equal(h.app.state.authenticated,true);assert.equal(h.$('projectScreen').hidden,false);
});

test('A3-08 mock run-only and neither lifecycle denial cannot cause evidence bypass or reconstruct stages',async()=>{
 for(const principal of ['run-only','neither']){
  const h=harness();const job=h.app.renderRoute();h.take('/lifecycle').resolve(response('PROJECT_READ_FORBIDDEN',403));await job;
  assert.match(h.$('stageTable').textContent,/403/);assert.doesNotMatch(h.$('stageTable').textContent,/Stage si1/);assert.equal(h.calls.filter(x=>x.path.includes('/stage-transitions')).length,0,principal+' must not fetch evidence after denied lifecycle');
  await h.app.loadTransitions('p1');assert.equal(h.calls.length,1,'Calling the evidence seam without an authorized subject is inert');
  assert.doesNotMatch(h.$('transitions').textContent,/SECRET/);
 }
 const h=harness();h.app.state.projects=[];await h.app.renderRoute();assert.equal(h.calls.length,0);assert.equal(h.$('catalogScreen').hidden,false);assert.match(h.$('notice').textContent,/无权|不存在/);
 // Independent API permission outcomes deliberately are not fabricated as proof:
 // run-only events 200 vs neither 403 requires the real scoped principal / V line.
});

test('A3-09 current evidence 401 globally clears every protected area; old session 401 is inert',async()=>{
 const h=harness('/projects/p1/overview');await openOverview(h,governance('p1',{project:project('p1',{health:'RED'}),blockers:[{id:'b1',blockingObjectType:'WORK_ITEM',blockingObjectId:'wi1',reason:'OVERVIEW_SECRET',status:'OPEN',resumeCondition:null}]}));
 let job=h.app.navigate('/projects/p1/tasks');h.take('/governance').resolve(response(governance('p1',{dependencies:[{id:'d1',sourceType:'RUN',sourceId:'PLAN_SECRET',targetType:'TASK',targetId:'PLAN_SECRET',dependencyType:'RELATES',status:'ACTIVE',criticalPath:false}]})));await job;
 job=h.app.navigate('/projects/p1/stages');h.take('/lifecycle').resolve(response(lifecycle()));await flush();h.take('/stage-transitions').resolve(response([event('EV_OLD_SECRET')]));await job;
 job=h.app.loadTransitions('p1');h.take('/stage-transitions').resolve({ok:false,status:401,json:async()=>{throw SyntaxError();}});await job;
 assert.equal(h.app.state.authenticated,false);assert.equal(h.$('workspace').hidden,true);assert.doesNotMatch(privateText(h),/OVERVIEW_SECRET|PLAN_SECRET|SECRET_DECISION|SECRET_EVIDENCE|Stage si1/);
 for(const id of ['governanceSummary','lifecycleSummary','governanceBlockers','stageBlockers','governanceDecisions','planDependencies','stageTable','transitions','taskRows','milestones'])assert.equal(h.$(id).textContent,'',id+' clearSession must remove protected DOM');
 const z=harness();await openStages(z);const first=z.app.loadTransitions('p1'),old=z.take('/stage-transitions');z.app.clearSession();z.app.state.authenticated=true;z.app.state.workspaceId='w1';z.app.state.workspaces=[{id:'w1'}];z.app.state.projects=[project()];z.app.state.workspaceRead={status:'ready'};z.app.state.projectRead={status:'ready'};z.$('workspace').hidden=false;z.$('login').hidden=true;
 await openStages(z,lifecycle(),[event('NEW_SESSION_EVENT',{decision:null,evidence:null})]);const snapshot=z.$('transitions').textContent;old.resolve(response('OLD_UNAUTHENTICATED',401));await first;
 assert.equal(z.app.state.authenticated,true);assert.equal(z.$('transitions').textContent,snapshot);assert.match(z.$('transitions').textContent,/NEW_SESSION_EVENT/);
});

test('A3-10 evidence read outcomes clear old details: 403, network, 500, JSON, contract, empty, cancellation',async()=>{
 const outcomes=[
  ['403',call=>call.resolve(response('DENIED',403)),/403/],
  ['network',call=>call.reject(new TypeError('offline')), /网络连接失败/],
  ['500',call=>call.resolve(response('SERVER_FAILED',500)),/读取失败/],
  ['json',call=>call.resolve({ok:true,status:200,json:async()=>{throw SyntaxError();}}),/JSON/],
  ['contract',call=>call.resolve(response({items:[{id:'bad',projectId:'p2'}]})),/响应格式/],
  ['empty',call=>call.resolve(response([])),/暂无|没有|未返回|无返回/],
  ['abort',call=>{const error=Error('aborted');error.name='AbortError';call.reject(error);},/已取消/]
 ];
 for(const [name,finish,expected] of outcomes){
  const h=harness();await openStages(h,lifecycle(),[event('EV_OLD_SECRET')]);const job=h.app.loadTransitions('p1');noOldEvidence(h);finish(h.take('/stage-transitions'));await job;
  assert.match(h.$('transitions').textContent,expected,name);noOldEvidence(h);assert.equal(all(h.$('transitions'),x=>x.tagName==='DETAILS').length,0);assert.match(h.$('stageTable').textContent,/Stage si1/);
  if(!['empty','abort'].includes(name)){assert.doesNotMatch(h.$('transitions').textContent,/暂无.*记录|没有.*记录/);assert.notEqual(h.$('transitions').dataset.readState,'empty');}
  if(name==='empty')assert.equal(h.$('transitions').dataset.readState,'empty');if(name==='abort')assert.equal(h.$('transitions').dataset.readState,'idle');
  assert.equal(h.$('transitions').attrs['aria-busy'],'false');readonly(h);
 }
});

test('A3-11 a single evidence retry requests only current events and obsolete retry controls are inert',async()=>{
 const h=harness();const first=h.app.renderRoute();h.take('/lifecycle').resolve(response(lifecycle()));await flush();h.take('/stage-transitions').resolve(response('DENIED',403));await first;
 const button=retryButton(h),before=h.calls.length,body=h.$('stageTable').textContent;const job=button.emit('click');
 assert.equal(h.calls.length,before+1);assert.equal(h.calls.at(-1).path,'/api/runtime/projects/p1/stage-transitions?limit=50');assert.equal(h.$('stageTable').textContent,body);assert.equal(h.$('stageTable').attrs['aria-busy'],'false');
 await button.emit('click');assert.equal(h.calls.length,before+1,'The detached same-nonce retry cannot duplicate the request');
 h.take('/stage-transitions').resolve(response([]));await job;
 const next=h.app.navigate('/projects/p2/stages');h.take('/projects/p2/lifecycle').resolve(response(lifecycle('p2')));await flush();h.take('/projects/p2/stage-transitions').resolve(response([]));await next;
 const count=h.calls.length;await button.emit('click');assert.equal(h.calls.length,count,'Old-project retry must not request old scope');readonly(h);
});

test('A3-12 frontend mock scope rejection and owner label do not grant permissions (real authorization BLOCKED)',async()=>{
 const h=harness();await openStages(h);h.app.state.owner=true;
 const next=h.app.navigate('/projects/p2/stages');h.take('/projects/p2/lifecycle').resolve(response('OUT_OF_SCOPE',403));await next;
 assert.match(h.$('stageTable').textContent,/403/);assert.equal(h.calls.filter(x=>x.path.includes('/projects/p2/stage-transitions')).length,0);assert.doesNotMatch(h.$('stageTable').textContent,/Stage si1/);noOldEvidence(h);
 assert.ok(h.calls.every(x=>x.options.credentials==='same-origin'));assert.ok(h.calls.every(x=>!('authorization' in x.options.headers)));readonly(h);
 // No front-end mock can attest resolveProjectScope/assertAccess or the existing
 // platformAdmin exception. Both remain separately BLOCKED in the 31-ID report.
});

test('A4-01 all legacy project routes direct-load, refresh, Back and Forward retain object semantics',async()=>{
 for(const path of ['/projects/p1/overview','/projects/p1/tasks','/projects/p1/tasks/wi1','/projects/p1/stages']){
  const h=harness(path);const settle=async job=>{await flush();if(h.pending('/governance').length)h.take('/governance').resolve(response(governance()));if(h.pending('/lifecycle').length)h.take('/lifecycle').resolve(response(lifecycle()));await flush();if(h.pending('/stage-transitions').length)h.take('/stage-transitions').resolve(response([]));await job;};
  await settle(h.app.renderRoute());assert.equal(h.location.pathname,path);await settle(h.app.renderRoute());
  await h.app.navigate('/projects');await settle(h.back());assert.equal(h.location.pathname,path);await h.forward();assert.equal(h.location.pathname,'/projects');readonly(h);
 }
});

test('A4-02 static/VM supplement only: overview-plan-detail-stages path remains GET-only; browser path BLOCKED',async()=>{
 const h=harness('/projects/p1/overview');await openOverview(h);
 let job=h.app.navigate(h.$('overviewPlanLink').href);h.take('/governance').resolve(response(governance()));await job;
 const link=all(h.$('taskRows'),x=>x.tagName==='A'&&x.href.endsWith('/tasks/wi1'))[0];assert.ok(link);
 job=h.app.navigate(link.href);h.take('/governance').resolve(response(governance()));await job;assert.equal(h.$('detailTitle').textContent,'WorkItem wi1');
 job=h.app.navigate(h.$('detailBack').href);h.take('/governance').resolve(response(governance()));await job;
 job=h.app.navigate('/projects/p1/stages');h.take('/lifecycle').resolve(response(lifecycle()));await flush();h.take('/stage-transitions').resolve(response([event()]));await job;
 assert.ok(all(h.$('transitions'),x=>x.tagName==='DETAILS').length>0);readonly(h);
});

test('A4-04 old evidence success/403/401/error/finally cannot change new project or busy state',async()=>{
 for(const result of ['success','403','401','network']){
  const h=harness();await openStages(h);const first=h.app.loadTransitions('p1'),old=h.take('/stage-transitions');
  const next=h.app.navigate('/projects/p2/stages');h.take('/projects/p2/lifecycle').resolve(response(lifecycle('p2',{stages:[stage('si2',{displayName:'NEW_PROJECT_STAGE'})]})));await flush();const current=h.take('/projects/p2/stage-transitions');
  const before=h.$('transitions').textContent,body=h.$('stageTable').textContent;
  if(result==='network')old.reject(new TypeError('offline'));else old.resolve(result==='success'?response([event('OLD_SUCCESS_SECRET')]):response('OLD_FAILURE',Number(result)));await first;
  assert.equal(h.$('transitions').textContent,before);assert.equal(h.$('transitions').attrs['aria-busy'],'true');assert.equal(h.$('stageTable').textContent,body);assert.equal(h.app.state.authenticated,true);
  current.resolve(response([event('NEW_PROJECT_EVENT',{projectId:'p2',projectStageInstanceId:'si2',decision:null,evidence:null})]));await next;
  assert.match(h.$('transitions').textContent,/NEW_PROJECT_EVENT/);assert.doesNotMatch(h.$('transitions').textContent,/OLD_SUCCESS_SECRET|OLD_FAILURE/);assert.match(h.$('stageTable').textContent,/NEW_PROJECT_STAGE/);
 }
});

test('A4-04 same-scope nonce prevents old success reviving evidence after newer 403',async()=>{
 const h=harness();await openStages(h);const first=h.app.loadTransitions('p1'),old=h.take('/stage-transitions');
 const next=h.app.loadTransitions('p1'),current=h.take('/stage-transitions');current.resolve(response('CURRENT_FORBIDDEN',403));await next;
 const before=h.$('transitions').textContent,button=retryButton(h);old.resolve(response([event('OLD_SUCCESS_SECRET')]));await first;
 assert.equal(h.$('transitions').textContent,before);assert.equal(retryButton(h),button);assert.equal(h.$('transitions').attrs['aria-busy'],'false');assert.doesNotMatch(h.$('transitions').textContent,/OLD_SUCCESS_SECRET/);assert.match(h.$('stageTable').textContent,/Stage si1/);
});

test('A4-04 session/workspace/route invalidation discards each old success/error/finally without resurrecting evidence',async()=>{
 for(const scope of ['session','workspace','route'])for(const outcome of ['success','403','401','network']){
  const h=harness();await openStages(h);const first=h.app.loadTransitions('p1'),old=h.take('/stage-transitions');
  if(scope==='session')h.app.state.sessionEpoch++;if(scope==='workspace')h.app.state.workspaceId='w2';
  if(scope==='route')await h.app.navigate('/projects');
  else await openStages(h,lifecycle(),[event('CURRENT_SCOPE_EVENT',{decision:null,evidence:null})]);
  const before=h.$('transitions').textContent,body=h.$('stageTable').textContent,busy=h.$('transitions').attrs['aria-busy'];
  if(outcome==='network')old.reject(new TypeError('offline'));else old.resolve(outcome==='success'?response([event('OLD_SCOPE_SECRET')]):response('OLD_SCOPE_ERROR',Number(outcome)));await first;
  assert.equal(h.$('transitions').textContent,before,scope+' '+outcome);assert.equal(h.$('stageTable').textContent,body);assert.equal(h.$('transitions').attrs['aria-busy'],busy);assert.equal(h.app.state.authenticated,true);
 }
});

test('A4-05 mock-only network recovery clears failed evidence then recovers via explicit read (real Network BLOCKED)',async()=>{
 const h=harness();await openStages(h);let job=h.app.loadTransitions('p1');h.take('/stage-transitions').reject(new TypeError('offline'));await job;
 noOldEvidence(h);const button=retryButton(h);job=button.emit('click');h.take('/stage-transitions').resolve(response([event('RECOVERED_EVENT',{decision:null,evidence:null})]));await job;
 assert.match(h.$('transitions').textContent,/RECOVERED_EVENT/);assert.doesNotMatch(h.$('transitions').textContent,/网络连接失败/);readonly(h);
});

test('A0-04 new governance fields reject invalid types locally while optional missing values stay unknown',async()=>{
 for(const bad of [
  {project:project('p1',{health:{invalid:true}})},
  {project:project('p1',{status:[]})},
  {blockers:[{id:'b1',reason:{invalid:true},status:'OPEN'}]},
  {decisions:[{id:'d1',title:'Valid title',status:7}]},
  {milestones:[{id:'m1',displayName:7,progressPercent:0}]}
 ]){
  const h=harness('/projects/p1/overview');await openOverview(h,governance('p1',bad));
  const root=bad.project?'governanceSummary':bad.blockers?'governanceBlockers':bad.decisions?'governanceDecisions':'milestones';
  assert.match(h.$(root).textContent,/响应格式/);assert.equal(h.$('lifecycleStage').textContent,'AIGC_00_INIT');assert.doesNotMatch(privateText(h),/\[object Object\]/);
 }
 const h=harness('/projects/p1/overview');await openOverview(h,governance('p1',{project:{id:'p1'},milestones:[{id:'m1',progressPercent:undefined}]}));
 assert.equal(h.$('governanceHealth').textContent,'未知');assert.match(h.$('milestones').textContent,/里程碑进度未知/);assert.doesNotMatch(h.$('milestones').textContent,/0%/);
});

test('A0-04 plan collections accept empty arrays but reject cross-project records and invalid numeric metadata',async()=>{
 const h=harness('/projects/p1/tasks');await openPlan(h,governance('p1',{workItems:[],milestones:[],iterations:[],dependencies:[]}));
 assert.equal(h.$('taskRows').dataset.readState,'empty');assert.equal(h.$('planDependencies').dataset.readState,'empty');
 for(const bad of [
  {workItems:[item('wi1',{projectId:'p2'})]},
  {milestones:[{id:'m1',projectId:'p2'}]},
  {iterations:[{id:'i1',sequenceNo:'1'}]},
  {dependencies:[{id:'d1',sourceType:'WORK_ITEM',sourceId:'wi1',targetType:'WORK_ITEM',targetId:'wi1',criticalPath:'true'}]}
 ]){
  const z=harness('/projects/p1/tasks');await openPlan(z,governance('p1',bad));assert.match(z.$('taskRows').textContent,/响应格式/);assert.match(z.$('planDependencies').textContent,/响应格式/);
 }
});

test('A0-04 lifecycle mandatory array and display-field types fail closed before evidence request',async()=>{
 for(const bad of [
  lifecycle('p2'),{project:project(),template:null},lifecycle('p1',{stages:null}),
  lifecycle('p1',{stages:[stage('si1',{id:null})]}),
  lifecycle('p1',{stages:[stage('si1',{sequenceNo:'1'})]}),
  lifecycle('p1',{stages:[stage('si1',{agentCapabilityKey:{bad:true}})]}),
  lifecycle('p1',{stages:[stage('si1',{blockedReason:[]})]}),
  lifecycle('p1',{stages:[stage('si1',{startedAt:7})]}),
  lifecycle('p1',{stages:[stage(),stage()]})
 ]){
  const h=harness();await openStages(h,bad,[]);assert.match(h.$('stageTable').textContent,/响应格式/);assert.equal(h.calls.filter(x=>x.path.includes('/stage-transitions')).length,0);assert.doesNotMatch(h.$('stageTable').textContent,/\[object Object\]|Stage si1/);
 }
});

test('A3-10 malformed transitions cannot preserve old evidence or accept cross-project/duplicate identity',async()=>{
 for(const bad of [null,{},[null],[event('x',{projectId:'p2'})],[event('x'),event('x')],[event('x',{projectId:null})],[event('x',{attemptNo:'1'})],[event('x',{attemptNo:-1})],[event('x',{projectStageInstanceId:{bad:true}})],[event('x',{actorKey:[]})]]){
  const h=harness();await openStages(h);const job=h.app.loadTransitions('p1');h.take('/stage-transitions').resolve(response(bad));await job;
  assert.match(h.$('transitions').textContent,/响应格式/);noOldEvidence(h);assert.match(h.$('stageTable').textContent,/Stage si1/);assert.equal(h.$('transitions').attrs['aria-busy'],'false');
 }
});

test('A3-09 current overview 401 clears the session even if another source returns late success',async()=>{
 for(const authSource of ['governance','lifecycle']){
  const h=harness('/projects/p1/overview');const job=h.app.renderRoute(),g=h.take('/governance'),l=h.take('/lifecycle');
  assert.equal(h.$('overviewPlanLink').getAttribute('href'),'/projects/p1/tasks');assert.equal(h.$('overviewStagesLink').getAttribute('href'),'/projects/p1/stages');
  (authSource==='governance'?g:l).resolve(response('CURRENT_EXPIRED',401));await flush();assert.equal(h.app.state.authenticated,false);
  (authSource==='governance'?l:g).resolve(response(authSource==='governance'?lifecycle('p1',{stages:[stage('si1',{blockedReason:'LATE_SECRET'})]}):governance('p1',{decisions:[{id:'d1',title:'LATE_SECRET',status:'OPEN'}]})));await job;
  assert.doesNotMatch(privateText(h),/LATE_SECRET/);assert.equal(h.$('workspace').hidden,true);
  for(const id of ['overviewPlanLink','overviewStagesLink']){assert.equal(h.$(id).getAttribute('href'),null);assert.equal(h.$(id).href,'');}assert.equal(h.$('sourceComparison').textContent,'');
 }
});

test('A4-04 old evidence errors/finally cannot alter newer same-scope loading or success',async()=>{
 for(const result of ['403','401','network']){
  const h=harness();await openStages(h);const first=h.app.loadTransitions('p1'),old=h.take('/stage-transitions');const newer=h.app.loadTransitions('p1'),current=h.take('/stage-transitions');
  if(result==='network')old.reject(new TypeError('offline'));else old.resolve(response('OLD_SAME_SCOPE_FAILURE',Number(result)));await first;
  assert.equal(h.$('transitions').attrs['aria-busy'],'true');assert.equal(all(h.$('transitions'),x=>x.tagName==='BUTTON').length,0);assert.equal(h.app.state.authenticated,true);
  current.resolve(response([event('CURRENT_SAME_SCOPE',{decision:null,evidence:null})]));await newer;assert.match(h.$('transitions').textContent,/CURRENT_SAME_SCOPE/);assert.doesNotMatch(h.$('transitions').textContent,/OLD_SAME_SCOPE_FAILURE/);assert.equal(all(h.$('transitions'),x=>x.tagName==='BUTTON').length,1);
 }
});

test('A3-11 evidence retry cannot cross workspace/session or target an unauthorized project',async()=>{
 for(const scope of ['workspace','session']){
  const h=harness();await openStages(h);const button=retryButton(h),count=h.calls.length;
  if(scope==='workspace')h.app.state.workspaceId='w2';else h.app.state.sessionEpoch++;
  await button.emit('click');await h.app.loadTransitions('p2');assert.equal(h.calls.length,count);
 }
});

test('A0-05 governance health styling resets when switching to a loading/failed project',async()=>{
 const h=harness('/projects/p1/overview');await openOverview(h,governance('p1',{project:project('p1',{health:'RED'})}));assert.equal(h.$('governanceHealth').dataset.health,'RED');
 const job=h.app.navigate('/projects/p2/overview');assert.equal(h.$('governanceHealth').dataset.health,'unknown');assert.doesNotMatch(h.$('governanceHealth').textContent,/RED/);
 h.take('/projects/p2/governance').resolve(response('GOVERNANCE_FAILED',500));h.take('/projects/p2/lifecycle').resolve(response(lifecycle('p2')));await job;
 assert.equal(h.$('governanceHealth').dataset.health,'unknown');assert.doesNotMatch(h.$('governanceHealth').textContent,/RED/);assert.match(h.$('governanceSummary').textContent,/GOVERNANCE_FAILED/);
 h.app.clearSession();assert.equal(h.$('governanceHealth').dataset.health,'unknown');assert.equal(h.$('governanceHealth').textContent,'');
});

test('A2-01 missing/undefined/empty assignment is unknown, only explicit null is unregistered',async()=>{
 for(const variant of ['missing','undefined','empty','null','unresolved']){
  const work=item('wi1');for(const key of ['milestoneId','iterationId']){if(variant==='missing')delete work[key];else work[key]=variant==='undefined'?undefined:variant==='empty'?'':variant==='null'?null:'not-returned';}
  for(const path of ['/projects/p1/tasks','/projects/p1/tasks/wi1']){
   const h=harness(path);await openPlan(h,governance('p1',{workItems:[work]}));const text=h.$(path.endsWith('/wi1')?'detailRows':'taskRows').textContent;
   if(variant==='null'){assert.match(text,/未登记里程碑归属/);assert.match(text,/未登记迭代归属/);}
   else if(variant==='unresolved'){assert.match(text,/目标不可确认/);assert.match(text,/not-returned/);}
   else{assert.match(text,/里程碑归属未知/);assert.match(text,/迭代归属未知/);assert.doesNotMatch(text,/未登记里程碑归属|未登记迭代归属/);}
  }
 }
});

test('A2-02 unknown prototype-like dependency types remain inert text, never treated as registry keys',async()=>{
 const h=harness('/projects/p1/tasks');await openPlan(h,governance('p1',{dependencies:[{id:'proto-dep',sourceType:'__proto__',sourceId:'wi1',targetType:'constructor',targetId:'wi1',dependencyType:'RELATED',status:'UNKNOWN',criticalPath:false}]}));
 const root=h.$('planDependencies');assert.match(root.textContent,/__proto__/);assert.match(root.textContent,/constructor/);assert.doesNotMatch(root.textContent,/读取失败/);assert.equal(all(root,x=>x.tagName==='A').length,0);
});

test('A3-02 a real stage ID named unconfirmed cannot collide with the unattributed evidence bucket',async()=>{
 const h=harness();await openStages(h,lifecycle('p1',{stages:[stage('unconfirmed')]}),[event('REAL_INSTANCE_EVENT',{projectStageInstanceId:'unconfirmed'}),event('UNATTRIBUTED_EVENT',{projectStageInstanceId:null})]);
 const groups=all(h.$('transitions'),x=>x.dataset.attribution!==undefined);
 const confirmed=groups.find(x=>x.dataset.attribution==='confirmed'),unknown=groups.find(x=>x.dataset.attribution==='unconfirmed');assert.ok(confirmed&&unknown);
 assert.equal(confirmed.dataset.stageInstanceId,'unconfirmed');assert.match(confirmed.textContent,/REAL_INSTANCE_EVENT/);assert.doesNotMatch(confirmed.textContent,/UNATTRIBUTED_EVENT/);
 assert.equal(unknown.dataset.stageInstanceId,'');assert.match(unknown.textContent,/UNATTRIBUTED_EVENT/);assert.doesNotMatch(unknown.textContent,/REAL_INSTANCE_EVENT/);
});


// The transplanted browser runner must fail closed if any required case is
// missing, duplicated, skipped, failed, blocked or outside its expected scope.
import {EXPECTED_BROWSER_CASES,summarizeBrowserRegression} from './helpers/systemization-fixtures.mjs';
const completeBrowserChecks=()=>EXPECTED_BROWSER_CASES.map(id=>({id,status:'PASS',classification:'ACTUAL_CHROMIUM_SYNTHETIC_RUNTIME_BFF'}));
test('synthetic browser gate accepts exactly all 22 passing cases',()=>{
 assert.equal(EXPECTED_BROWSER_CASES.length,22);
 assert.equal(summarizeBrowserRegression(completeBrowserChecks()).status,'PASS');
});
for(const [label,mutate] of [
 ['missing',rows=>rows.slice(1)],
 ['duplicate',rows=>[...rows,rows[0]]],
 ['skipped',rows=>rows.map((row,index)=>index?row:{...row,status:'SKIPPED'})],
 ['failed',rows=>rows.map((row,index)=>index?row:{...row,status:'FAIL'})],
 ['blocked',rows=>rows.map((row,index)=>index?row:{...row,status:'BLOCKED'})],
 ['unexpected',rows=>rows.map((row,index)=>index?row:{...row,id:'EXTRA_CASE'})],
 ['unclassified',rows=>rows.map((row,index)=>index?row:{...row,classification:undefined})],
])test('synthetic browser gate rejects '+label+' cases',()=>{
 assert.equal(summarizeBrowserRegression(mutate(completeBrowserChecks())).status,'FAIL');
});
test('synthetic browser gate rejects page errors and invalid report shapes',()=>{
 assert.equal(summarizeBrowserRegression(completeBrowserChecks(),['page failed']).status,'FAIL');
 assert.equal(summarizeBrowserRegression(null).status,'FAIL');
 assert.equal(summarizeBrowserRegression(completeBrowserChecks(),null).status,'FAIL');
});
