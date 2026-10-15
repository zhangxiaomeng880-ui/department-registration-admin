import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import vm from 'node:vm';

const source=await readFile(new URL('../public/requirements.js',import.meta.url),'utf8');
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
const reply=(data,status=200)=>({ok:status>=200&&status<300,status,json:async()=>data});
const session=(id='s1')=>({authenticated:true,mode:'scoped',writesEnabled:true,id});
const record=(id,projectId='p1',extra={})=>({id,projectId,status:'READY_FOR_PRD',sourceStatement:'需求描述 '+id,result:{summary:'结果 '+id,completionScore:80,requirements:[]},decisions:[],trace:{runId:'trace-'+id},...extra});
const flush=async()=>{for(let i=0;i<12;i++)await Promise.resolve();};

// Run the real browser script against a deliberately small DOM and controllable
// fetch promises. These tests prove state transitions, not browser/live E2E.
class Element{
  constructor(tag='div'){this.tagName=tag.toUpperCase();this.children=[];this.dataset={};this.listeners={};this.hidden=false;this.disabled=false;this.checked=false;this.attributes={};this._text='';this._value='';this.parentElement=null;const classes=new Set();this.classList={add:x=>classes.add(x),remove:x=>classes.delete(x),contains:x=>classes.has(x),toggle:(x,on)=>{if(on)classes.add(x);else classes.delete(x);}};}
  get firstChild(){return this.children[0]||null;}
  get textContent(){return this._text+this.children.map(child=>child.textContent).join('');}
  set textContent(value){this._text=String(value);this.children.forEach(child=>child.parentElement=null);this.children=[];if(this.tagName==='SELECT')this._value='';}
  get value(){return this._value;}
  set value(value){this._value=value;}
  append(...children){for(const child of children){child.parentElement=this;this.children.push(child);if(this.tagName==='SELECT'&&this.children.length===1)this._value=child.value;}}
  remove(){if(this.parentElement){const parent=this.parentElement;parent.children=parent.children.filter(child=>child!==this);if(parent.tagName==='SELECT')parent._value=parent.children[0]?.value||'';}this.parentElement=null;}
  setAttribute(name,value){this.attributes[name]=value;}
  addEventListener(name,callback){(this.listeners[name]??=[]).push(callback);}
  async fire(name,event={}){for(const callback of this.listeners[name]||[])await callback({target:this,preventDefault(){},...event});}
  querySelector(selector){return this.all().find(child=>selector==='span'&&child.tagName==='SPAN')||null;}
  all(){return this.children.flatMap(child=>[child,...child.all()]);}
}
async function setup({auto=false}={}){
  const ids=['workspaceSelect','projectSelect','sessionBadge','execute','inputStatus','historyList','resultPanel','resultStatus','summary','completionScore','decisionCount','runTrace','handoff','levelTip','requirementsList','decisionList','submitDecisions','refreshHistory','statement','applicationType','decisionForm','toast'];
  const elements=Object.fromEntries(ids.map(id=>[id,new Element(id.endsWith('Select')||id==='applicationType'?'select':'div')]));
  elements.resultPanel.hidden=true;elements.statement.value='四字以上需求';elements.applicationType.value='WEBSITE';
  const traceContainer=new Element();const traceLabel=new Element('span');traceLabel.textContent='运行追踪';traceContainer.append(traceLabel,elements.runTrace);
  const tabs=['PAGE','MODULE','METRIC','FUNCTION'].map(level=>{const tab=new Element('button');tab.dataset.level=level;return tab;});
  const requests=[],timers=[];const window=new Element();
  const context=vm.createContext({document:{getElementById:id=>elements[id],createElement:tag=>new Element(tag),querySelectorAll:selector=>selector==='.yellow-tabs button'?tabs:selector==='#decisionList input'?elements.decisionList.all().filter(item=>item.tagName==='INPUT'):[],querySelector:selector=>{const match=selector.match(/^input\[name="(.*)"\]:checked$/);return match?elements.decisionList.all().find(item=>item.name===match[1]&&item.checked):null;}},window,CSS:{escape:value=>value},location:{href:'/requirements',pathname:'/requirements'},setTimeout:fn=>{timers.push(fn);},fetch:(path,options)=>{const pending=deferred();requests.push({path,options,...pending});return pending.promise;}});
  vm.runInContext(source+'\nglobalThis.workbench={state,bootstrap,loadProjects,loadHistory,openSession,isCurrent,beginRequest,api,render,submit};',context);
  const app=context.workbench;
  const next=(path)=>{const request=requests.find(item=>!item.handled&&item.path===path);assert.ok(request,'Expected request '+path);request.handled=true;return request;};
  const answer=async(path,data,status=200)=>{next(path).resolve(reply(data,status));await flush();};
  const env={app,e:elements,window,requests,next,answer,timers,traceLabel};
  if(auto){
    await answer('/auth/session',session());
    await answer('/api/runtime/workspaces',{data:[{id:'w1'},{id:'w2'}]});
    await answer('/api/runtime/projects?workspaceId=w1&limit=100',{data:{workspaceId:'w1',items:[{id:'p1',workspaceId:'w1',name:'项目一'},{id:'p2',workspaceId:'w1',name:'项目二'}]}});
    await answer('/api/runtime/projects/p1/requirement-completions?limit=20',{data:{projectId:'p1',items:[]}});
  }
  return env;
}
const historyPath=project=>'/api/runtime/projects/'+project+'/requirement-completions?limit=20';
const completionPath=(id,project='p1')=>'/api/runtime/projects/'+project+'/requirement-completions'+(id?'/'+id:'');
async function open(env,id='r1',extra={}){const pending=env.app.openSession(id);await env.answer(completionPath(id),{data:record(id,'p1',extra)});await pending;}

for(const dimension of ['sessionVersion','workspaceId','projectId','routeVersion','nonce']){
  test('requirement token rejects a changed '+dimension,async()=>{
    const {app}=await setup({auto:true});const request=app.beginRequest('history');assert.equal(app.isCurrent(request),true);
    if(dimension==='nonce')app.beginRequest('history');else app.state[dimension]=dimension.endsWith('Version')?app.state[dimension]+1:'changed';
    assert.equal(app.isCurrent(request),false);
  });
}

test('workspace switch clears project, history and result before awaiting the catalog',async()=>{
  const env=await setup({auto:true});await open(env);env.e.historyList.append(new Element());
  env.e.workspaceSelect.value='w2';const switched=env.e.workspaceSelect.fire('change');
  assert.equal(env.app.state.projectId,null);assert.equal(env.app.state.current,null);assert.equal(env.app.state.projects.length,0);
  assert.equal(env.e.projectSelect.children.length,0);assert.equal(env.e.historyList.children.length,0);assert.equal(env.e.summary.textContent,'');assert.equal(env.e.resultPanel.hidden,true);assert.equal(env.e.execute.disabled,true);
  await env.answer('/api/runtime/projects?workspaceId=w2&limit=100',{data:{workspaceId:'w2',items:[]}});await switched;
  assert.equal(env.e.projectSelect.dataset.state,'empty');assert.match(env.e.inputStatus.textContent,/没有可访问的项目/);
});

for(const outcome of ['success','401','500','network','bad-json']){
  test('older workspace catalog '+outcome+' cannot overwrite newer selection or controls',async()=>{
    const env=await setup({auto:true});
    env.e.workspaceSelect.value='w2';const older=env.e.workspaceSelect.fire('change');const oldRequest=env.next('/api/runtime/projects?workspaceId=w2&limit=100');
    env.e.workspaceSelect.value='w1';const newer=env.e.workspaceSelect.fire('change');
    await env.answer('/api/runtime/projects?workspaceId=w1&limit=100',{data:{workspaceId:'w1',items:[{id:'p2',workspaceId:'w1'}]}});
    await env.answer(historyPath('p2'),{data:{projectId:'p2',items:[]}});await newer;
    const badge=env.e.sessionBadge.textContent;
    if(outcome==='network')oldRequest.reject(new TypeError('offline'));else if(outcome==='bad-json')oldRequest.resolve({ok:true,status:200,json:async()=>{throw new SyntaxError();}});else oldRequest.resolve(reply({data:{items:[{id:'old-project'}]}},outcome==='success'?200:Number(outcome)));
    await older;
    assert.equal(env.app.state.workspaceId,'w1');assert.equal(env.app.state.projectId,'p2');assert.equal(env.e.projectSelect.value,'p2');assert.equal(env.e.projectSelect.dataset.state,'ready');assert.equal(env.e.execute.disabled,false);assert.equal(env.e.sessionBadge.textContent,badge);assert.equal(env.app.state.session.authenticated,true);
  });
}

test('workspace A → B → A rejects the first A request even with identical final scope',async()=>{
  const env=await setup({auto:true});const old=env.app.loadProjects();const request=env.next('/api/runtime/projects?workspaceId=w1&limit=100');
  env.e.workspaceSelect.value='w2';const b=env.e.workspaceSelect.fire('change');
  env.e.workspaceSelect.value='w1';const a=env.e.workspaceSelect.fire('change');
  await env.answer('/api/runtime/projects?workspaceId=w1&limit=100',{data:{items:[]}});await a;
  request.resolve(reply({data:{items:[{id:'stale'}]}}));await old;
  await env.answer('/api/runtime/projects?workspaceId=w2&limit=100',{data:{items:[{id:'stale-b'}]}});await b;
  assert.equal(env.app.state.projectId,null);assert.equal(env.app.state.projects.length,0);assert.equal(env.e.projectSelect.dataset.state,'empty');
});

for(const outcome of ['success','401','403','500','network','bad-json']){
  test('older history '+outcome+' cannot change a newer history view',async()=>{
    const env=await setup({auto:true});const old=env.app.loadHistory();const oldRequest=env.next(historyPath('p1'));const newer=env.app.loadHistory();
    await env.answer(historyPath('p1'),{data:{projectId:'p1',items:[record('fresh')]}});await newer;
    if(outcome==='network')oldRequest.reject(Error('offline'));else if(outcome==='bad-json')oldRequest.resolve({ok:true,status:200,json:async()=>{throw Error();}});else oldRequest.resolve(reply({data:{projectId:'p1',items:[record('stale')]}},outcome==='success'?200:Number(outcome)));
    await old;
    assert.match(env.e.historyList.textContent,/fresh/);assert.doesNotMatch(env.e.historyList.textContent,/stale|失败/);assert.equal(env.e.historyList.dataset.state,'ready');assert.equal(env.e.refreshHistory.disabled,false);assert.equal(env.app.state.session.authenticated,true);
  });
}

test('history from an old project cannot contaminate a newer project',async()=>{
  const env=await setup({auto:true});const old=env.app.loadHistory();const request=env.next(historyPath('p1'));
  env.e.projectSelect.value='p2';const changed=env.e.projectSelect.fire('change');await env.answer(historyPath('p2'),{data:{projectId:'p2',items:[record('p2-record','p2')]}});await changed;
  request.resolve(reply({data:{projectId:'p1',items:[record('p1-record')]}}));await old;
  assert.match(env.e.historyList.textContent,/p2-record/);assert.doesNotMatch(env.e.historyList.textContent,/p1-record/);
});

for(const oldOutcome of ['success','401','500']){
  test('last openSession wins including stale '+oldOutcome+' and finally',async()=>{
    const env=await setup({auto:true});await open(env,'initial');
    const older=env.app.openSession('older'),oldRequest=env.next(completionPath('older'));const newer=env.app.openSession('newer');
    assert.equal(env.app.state.current,null);assert.equal(env.e.resultPanel.hidden,true);assert.equal(env.e.handoff.disabled,true);
    oldRequest.resolve(reply({data:record('older')},oldOutcome==='success'?200:Number(oldOutcome)));await older;
    assert.equal(env.e.execute.disabled,true);assert.equal(env.e.resultPanel.hidden,true);assert.match(env.e.inputStatus.textContent,/正在读取/);
    await env.answer(completionPath('newer'),{data:record('newer')});await newer;
    assert.equal(env.app.state.current.id,'newer');assert.equal(env.e.summary.textContent,'结果 newer');assert.equal(env.e.execute.disabled,false);assert.equal(env.e.handoff.disabled,false);
  });
}

for(const outcome of ['401','403','404','500','network','bad-json','contract','empty']){
  test('history distinguishes '+outcome+' without fabricating records',async()=>{
    const env=await setup({auto:true});const pending=env.app.loadHistory();const request=env.next(historyPath('p1'));
    if(outcome==='network')request.reject(Error('offline'));else if(outcome==='bad-json')request.resolve({ok:true,status:200,json:async()=>{throw SyntaxError();}});else if(outcome==='contract')request.resolve(reply({data:{projectId:'p1',items:{}}}));else if(outcome==='empty')request.resolve(reply({data:{projectId:'p1',items:[]}}));else request.resolve(reply({error:'TEST'},Number(outcome)));
    await pending;
    if(outcome==='401'){assert.equal(env.app.state.session,null);assert.equal(env.app.state.projectId,null);assert.match(env.e.inputStatus.textContent,/401/);assert.equal(env.e.execute.disabled,true);}
    else if(outcome==='empty'){assert.equal(env.e.historyList.dataset.state,'empty');assert.match(env.e.historyList.textContent,/没有补全记录/);}
    else{assert.equal(env.e.historyList.dataset.state,'error');assert.equal(env.e.historyList.dataset.errorKind,({'403':'forbidden','404':'notFound','500':'server','bad-json':'json'})[outcome]||outcome);assert.doesNotMatch(env.e.historyList.textContent,/没有补全记录/);assert.equal(env.e.refreshHistory.disabled,false);}
  });
}

test('bad JSON with HTTP 401 retains auth classification',async()=>{
  const env=await setup({auto:true});const pending=env.app.loadHistory();env.next(historyPath('p1')).resolve({ok:false,status:401,json:async()=>{throw SyntaxError();}});await pending;
  assert.equal(env.app.state.session,null);assert.match(env.e.inputStatus.textContent,/401/);
});

test('current read AbortError is not displayed as a business failure',async()=>{
  const env=await setup({auto:true});const pending=env.app.openSession('aborted');env.next(completionPath('aborted')).reject(Object.assign(Error('abort'),{name:'AbortError'}));await pending;
  assert.doesNotMatch(env.e.inputStatus.textContent,/失败/);assert.equal(env.e.execute.disabled,false);
});

test('late initial auth response cannot replace a newer bootstrap identity',async()=>{
  const env=await setup();const old=env.next('/auth/session');const second=env.app.bootstrap();
  await env.answer('/auth/session',session('new'));await env.answer('/api/runtime/workspaces',{data:[]});await second;
  old.resolve(reply(session('old')));await flush();assert.equal(env.app.state.session.id,'new');assert.equal(env.requests.filter(request=>request.path==='/api/runtime/workspaces').length,1);
});

test('old 401 cannot invalidate a new identity even when workspace and project match',async()=>{
  const env=await setup({auto:true});const old=env.app.openSession('old');const request=env.next(completionPath('old'));
  const boot=env.app.bootstrap();await env.answer('/auth/session',session('new'));await env.answer('/api/runtime/workspaces',{data:[{id:'w1'}]});await env.answer('/api/runtime/projects?workspaceId=w1&limit=100',{data:{items:[{id:'p1'}]}});await env.answer(historyPath('p1'),{data:{projectId:'p1',items:[]}});await boot;
  request.resolve(reply({error:'OLD_UNAUTHORIZED'},401));await old;
  assert.equal(env.app.state.session.id,'new');assert.equal(env.e.execute.disabled,false);assert.doesNotMatch(env.e.inputStatus.textContent,/401/);
});

test('BFCache pagehide revokes in-flight owners; restore rechecks auth',async()=>{
  const env=await setup({auto:true});const old=env.app.openSession('old');const request=env.next(completionPath('old'));
  await env.window.fire('pagehide');assert.equal(env.e.execute.disabled,true);assert.equal(env.e.resultPanel.hidden,true);
  request.resolve(reply({data:record('old')}));await old;assert.equal(env.app.state.current,null);
  const restore=env.window.fire('pageshow',{persisted:true});await env.answer('/auth/session',{authenticated:false});await restore;assert.equal(env.e.execute.disabled,true);assert.match(env.e.sessionBadge.textContent,/未登录/);
});

for(const operation of ['run','decisions','handoff'])for(const outcome of ['success','401','500','network']){
  test(operation+' POST '+outcome+' after switching cannot change the new result, auth or busy buttons',async()=>{
    const env=await setup({auto:true});await open(env,'source');
    const old=env.app.submit(operation,operation==='run'?{statement:'approved request'}:{},operation==='run'?undefined:'source');
    const path=completionPath(operation==='run'?undefined:'source')+(operation==='run'?'':'/'+operation);const request=env.next(path);
    assert.equal(request.options.method,'POST');assert.equal(request.options.signal,undefined);
    env.e.projectSelect.value='p2';const changed=env.e.projectSelect.fire('change');
    assert.match(env.e.inputStatus.textContent,/服务器执行/);assert.doesNotMatch(env.e.inputStatus.textContent,/取消/);
    await env.answer(historyPath('p2'),{data:{projectId:'p2',items:[]}});await changed;
    const fresh=env.app.openSession('fresh');const freshRequest=env.next(completionPath('fresh','p2'));
    if(outcome==='network')request.reject(Error('offline'));else request.resolve(reply({data:record(operation==='run'?'accepted':'source','p1',{status:operation==='handoff'?'HANDOFF_READY':'READY_FOR_PRD'})},outcome==='success'?200:Number(outcome)));
    await old;assert.equal(env.e.execute.disabled,true);assert.equal(env.e.resultPanel.hidden,true);assert.equal(env.app.state.session.id,'s1');assert.match(env.e.inputStatus.textContent,/正在读取/);
    freshRequest.resolve(reply({data:record('fresh','p2')}));await fresh;
    assert.equal(env.app.state.current.id,'fresh');assert.equal(env.e.execute.disabled,false);assert.equal(env.e.handoff.disabled,false);assert.equal(env.e.toast.textContent,'');
    assert.equal(env.requests.filter(item=>item.options.method==='POST').length,1);
  });
}

test('accepted POST can be recovered through the existing project history, never auto-replayed',async()=>{
  const env=await setup({auto:true});const pending=env.app.submit('run',{statement:'approved requirement'});const request=env.next(completionPath());
  env.e.workspaceSelect.value='w2';const change=env.e.workspaceSelect.fire('change');assert.match(env.e.inputStatus.textContent,/服务器执行/);
  await env.answer('/api/runtime/projects?workspaceId=w2&limit=100',{data:{items:[]}});await change;
  request.resolve(reply({data:record('accepted')}));await pending;assert.equal(env.app.state.current,null);
  env.e.workspaceSelect.value='w1';const back=env.e.workspaceSelect.fire('change');await env.answer('/api/runtime/projects?workspaceId=w1&limit=100',{data:{items:[{id:'p1'}]}});await env.answer(historyPath('p1'),{data:{projectId:'p1',items:[record('accepted')]}});await back;
  const card=env.e.historyList.children[0];const restored=card.fire('click');await env.answer(completionPath('accepted'),{data:record('accepted')});await restored;
  assert.equal(env.app.state.current.id,'accepted');assert.equal(env.requests.filter(item=>item.options.method==='POST').length,1);
});

for(const operation of ['run','decisions','handoff']){
  test(operation+' repeated submission is suppressed until the current request finishes',async()=>{
    const env=await setup({auto:true});await open(env,'source');
    const id=operation==='run'?undefined:'source';const body=operation==='run'?{statement:'valid requirement'}:{};
    const first=env.app.submit(operation,body,id);await env.app.submit(operation,body,id);
    assert.equal(env.requests.filter(item=>item.options.method==='POST').length,1);assert.equal(env.e.execute.disabled,true);assert.equal(env.e.handoff.disabled,true);assert.equal(env.e.submitDecisions.disabled,true);
    await env.answer(completionPath(id)+(id?'/'+operation:''),{data:record(id||'created','p1',{status:operation==='handoff'?'HANDOFF_READY':'READY_FOR_PRD'})});await env.answer(historyPath('p1'),{data:{projectId:'p1',items:[]}});await first;
    assert.equal(env.e.execute.disabled,false);assert.equal(env.e.execute.textContent,'运行需求 Agent');assert.equal(env.app.state.current.id,id||'created');
  });
}

test('write network failure reports unknown acceptance and requires history verification',async()=>{
  const env=await setup({auto:true});const pending=env.app.submit('run',{statement:'valid requirement'});env.next(completionPath()).reject(Error('offline'));await pending;
  assert.match(env.e.inputStatus.textContent,/结果未确认/);assert.match(env.e.inputStatus.textContent,/刷新历史核验/);assert.match(env.e.inputStatus.textContent,/不会自动重试/);assert.doesNotMatch(env.e.inputStatus.textContent,/取消|执行失败/);assert.equal(env.e.execute.disabled,false);
});

test('wrong project, wrong session or malformed success cannot render as completion',async()=>{
  for(const data of [record('wrong-id'),record('expected','wrong-project'),{...record('expected'),decisions:{}},{...record('expected'),result:{requirements:{}}}]){
    const env=await setup({auto:true});const pending=env.app.openSession('expected');await env.answer(completionPath('expected'),{data});await pending;
    assert.equal(env.e.resultPanel.hidden,true);assert.equal(env.app.state.current,null);assert.equal(env.e.inputStatus.dataset.errorKind,'contract');
  }
});

test('requirement trace is explicitly distinct from a verified Runtime Run and has no link',async()=>{
  const env=await setup({auto:true});await open(env,'trace-record');assert.equal(env.traceLabel.textContent,'需求追踪');assert.match(env.e.runTrace.title,/未验证为 Runtime Run/);assert.equal(env.e.runTrace.all().filter(item=>item.tagName==='A').length,0);
});

test('read-only identity cannot issue run, decision or handoff POSTs even through handlers',async()=>{
  const env=await setup({auto:true});env.app.state.session={...session(),writesEnabled:false};
  await env.app.submit('run',{statement:'valid requirement'});await env.e.execute.fire('click');await env.e.decisionForm.fire('submit');await env.e.handoff.fire('click');
  assert.equal(env.requests.filter(item=>item.options.method==='POST').length,0);
});

for(const operation of ['run','decisions','handoff'])for(const outcome of ['success','401','500']){
  test(operation+' POST '+outcome+' from a previous session cannot settle a newer identity request',async()=>{
    const env=await setup({auto:true});await open(env,'source');
    const old=env.app.submit(operation,{},operation==='run'?undefined:'source');const oldRequest=env.next(completionPath(operation==='run'?undefined:'source')+(operation==='run'?'':'/'+operation));
    const boot=env.app.bootstrap();await env.answer('/auth/session',session('replacement'));await env.answer('/api/runtime/workspaces',{data:[{id:'w1'}]});await env.answer('/api/runtime/projects?workspaceId=w1&limit=100',{data:{items:[{id:'p1'}]}});await env.answer(historyPath('p1'),{data:{projectId:'p1',items:[]}});await boot;
    const newWrite=env.app.submit('run',{statement:'new identity request'});const newRequest=env.next(completionPath());
    oldRequest.resolve(reply({data:record(operation==='run'?'old-result':'source','p1',{status:operation==='handoff'?'HANDOFF_READY':'READY_FOR_PRD'})},outcome==='success'?200:Number(outcome)));await old;
    assert.equal(env.app.state.session.id,'replacement');assert.equal(env.e.execute.disabled,true);assert.match(env.e.execute.textContent,/正在读取上下文/);assert.equal(env.e.resultPanel.hidden,true);assert.equal(env.e.toast.textContent,'');assert.equal(env.e.inputStatus.textContent,'');
    newRequest.resolve(reply({data:record('new-result')}));await flush();await env.answer(historyPath('p1'),{data:{projectId:'p1',items:[record('new-result')]}});await newWrite;
    assert.equal(env.app.state.current.id,'new-result');assert.equal(env.e.execute.disabled,false);assert.equal(env.requests.filter(request=>request.options.method==='POST').length,2);
  });
}

test('history accepts each persisted status and FAILED with null result',async()=>{
  const env=await setup({auto:true});const records=['REVIEW_REQUIRED','READY_FOR_PRD','HANDOFF_READY','FAILED'].map((status,index)=>record('status-'+index,'p1',{status,...(status==='FAILED'?{result:null}:{})}));
  const pending=env.app.loadHistory();await env.answer(historyPath('p1'),{data:{projectId:'p1',items:records}});await pending;
  assert.equal(env.e.historyList.dataset.state,'ready');assert.equal(env.e.historyList.children.length,4);
  const failedClick=env.e.historyList.children[3].fire('click');await env.answer(completionPath('status-3'),{data:records[3]});await failedClick;
  assert.equal(env.app.state.current.id,'status-3');assert.equal(env.e.resultPanel.hidden,false);assert.match(env.e.summary.textContent,/执行失败/);assert.equal(env.e.handoff.disabled,true);
});

test('history refreshed after a POST rejects an older history response and its old card handlers',async()=>{
  const env=await setup({auto:true});const listed=env.app.loadHistory();await env.answer(historyPath('p1'),{data:{projectId:'p1',items:[record('older-card')]}});await listed;
  const oldCard=env.e.historyList.children[0];const old=env.app.loadHistory();const oldRequest=env.next(historyPath('p1'));
  const write=env.app.submit('run',{statement:'valid requirement'});await env.answer(completionPath(),{data:record('new-result')});await env.answer(historyPath('p1'),{data:{projectId:'p1',items:[record('new-result')]}});await write;
  oldRequest.resolve(reply({data:{projectId:'p1',items:[record('old-result')]}}));await old;const before=env.requests.length;await oldCard.fire('click');
  assert.match(env.e.historyList.textContent,/new-result/);assert.doesNotMatch(env.e.historyList.textContent,/old-result/);assert.equal(env.requests.length,before);
});

test('HTTP200 write contract errors remain uncertain and never announce success',async()=>{
  for(const data of [null,{items:[]},record('wrong-project','p2'),record('failed','p1',{status:'FAILED',result:null})]){
    const env=await setup({auto:true});const pending=env.app.submit('run',{statement:'valid requirement'});await env.answer(completionPath(),{data});await pending;
    assert.equal(env.app.state.current,null);assert.equal(env.e.resultPanel.hidden,true);assert.equal(env.e.inputStatus.dataset.errorKind,'contract');assert.match(env.e.inputStatus.textContent,/结果未确认/);assert.equal(env.e.toast.textContent,'');
  }
});

test('HTTP200 handoff with the wrong status cannot claim the PRD package exists',async()=>{
  const env=await setup({auto:true});await open(env,'source');const pending=env.app.submit('handoff',{},'source');await env.answer(completionPath('source')+'/handoff',{data:record('source')});await pending;
  assert.equal(env.app.state.current.status,'READY_FOR_PRD');assert.equal(env.e.toast.textContent,'');assert.equal(env.e.inputStatus.dataset.errorKind,'contract');assert.match(env.e.inputStatus.textContent,/结果未确认/);
});

test('invalid session DTO does not enable writes',async()=>{
  const env=await setup();await env.answer('/auth/session',{authenticated:true,writesEnabled:true});assert.equal(env.app.state.session,null);assert.equal(env.e.execute.disabled,true);assert.equal(env.e.inputStatus.dataset.errorKind,'contract');
});

test('workspace and project contract failures differ from successful empty lists',async()=>{
  const invalid=await setup();await invalid.answer('/auth/session',session());await invalid.answer('/api/runtime/workspaces',{data:{items:[]}});assert.equal(invalid.e.inputStatus.dataset.errorKind,'contract');assert.equal(invalid.e.execute.disabled,true);
  const env=await setup({auto:true});env.e.workspaceSelect.value='w2';const pending=env.e.workspaceSelect.fire('change');await env.answer('/api/runtime/projects?workspaceId=w2&limit=100',{data:{workspaceId:'w1',items:[]}});await pending;
  assert.equal(env.e.projectSelect.dataset.errorKind,'contract');assert.equal(env.e.projectSelect.dataset.state,'error');assert.equal(env.app.state.projectId,null);assert.doesNotMatch(env.e.inputStatus.textContent,/没有可访问的项目/);
});

test('typed status resets after a successful current retry',async()=>{
  const env=await setup({auto:true});const fail=env.app.openSession('missing');await env.answer(completionPath('missing'),{error:'not found'},404);await fail;assert.equal(env.e.inputStatus.dataset.errorKind,'notFound');
  await open(env,'valid');assert.equal(env.e.inputStatus.dataset.errorKind,undefined);assert.equal(env.e.inputStatus.dataset.state,'ready');assert.equal(env.e.inputStatus.textContent,'');
});
