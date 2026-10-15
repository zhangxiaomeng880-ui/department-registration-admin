const $=id=>document.getElementById(id);
const state={session:null,sessionVersion:0,workspaceId:null,projectId:null,projects:[],current:null,level:'PAGE',routeVersion:0,nonces:{},pending:{}};
const clear=element=>{element.textContent='';};
const node=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!=null)el.textContent=text;return el;};
let toastVersion=0;
const toast=message=>{const version=++toastVersion;$('toast').textContent=message;$('toast').classList.add('show');setTimeout(()=>{if(version===toastVersion)$('toast').classList.remove('show');},2600);};
const statusLabel=status=>({REVIEW_REQUIRED:'待产品决策',READY_FOR_PRD:'可整理 PRD',HANDOFF_READY:'已生成 PRD 整理包',FAILED:'执行失败'}[status]||status||'—');
const tips={PAGE:'页面级：定义前台、管理后台各有哪些页面，以及页面目标、角色和入口。',MODULE:'模块级：定义页面内模块的职责、边界、数据来源和模块间关系。',METRIC:'指标级：定义口径、单位、维度、时间窗、刷新延迟、空值与异常状态。',FUNCTION:'功能点：定义搜索、下拉、筛选、点击、导出、提醒等触发条件、权限和结果反馈。'};
const object=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const validId=value=>typeof value==='string'&&/^[A-Za-z0-9-]{1,80}$/.test(value);
const requestError=(kind,status=0)=>Object.assign(new Error(kind),{kind,status});
const contract=condition=>{if(!condition)throw requestError('contract');};
const errorText=error=>({auth:'身份已失效（401），请返回项目总览重新登录。',forbidden:'无权访问（403），请检查当前身份的项目权限。',notFound:'记录不存在或已不可用（404）。',server:'服务暂时异常（'+error.status+'），请稍后重试。',network:'网络连接失败，请检查连接后重试。',json:'服务返回了无效 JSON。',contract:'服务返回的数据格式不符合约定。',aborted:'读取已中止。'}[error.kind]||'请求失败'+(error.status?'（'+error.status+'）':'')+'。');

// API parsing has no global auth or UI effects. Every caller must first prove
// that the exact identity, selected scope, route and latest request still own it.
async function api(path,options={}){
  let response;
  try{response=await fetch(path,{credentials:'same-origin',...options,headers:{'content-type':'application/json',...(options.headers||{})}});}
  catch(error){throw requestError(error.name==='AbortError'?'aborted':'network');}
  let body,parsed=true;
  try{body=await response.json();}catch{parsed=false;}
  if(!response.ok){
    const kind=response.status===401?'auth':response.status===403?'forbidden':response.status===404?'notFound':response.status>=500?'server':'http';
    throw requestError(kind,response.status);
  }
  if(!parsed||body?.error==='RUNTIME_NON_JSON_RESPONSE')throw requestError('json',response.status);
  contract(object(body)||Array.isArray(body));
  if(object(body)&&Object.hasOwn(body,'error'))throw requestError('contract',response.status);
  return object(body)&&Object.hasOwn(body,'data')?body.data:body;
}
function beginRequest(kind,operation=kind){
  const request={kind,operation,nonce:state.nonces[kind]=(state.nonces[kind]||0)+1,session:state.session,sessionVersion:state.sessionVersion,workspaceId:state.workspaceId,projectId:state.projectId,routeVersion:state.routeVersion};
  state.pending[kind]=request;return request;
}
function isCurrent(request){
  return request.session===state.session&&request.sessionVersion===state.sessionVersion&&request.workspaceId===state.workspaceId&&request.projectId===state.projectId&&request.routeVersion===state.routeVersion&&request.nonce===state.nonces[request.kind];
}
function canWrite(){return state.session?.authenticated===true&&state.session.mode==='scoped'&&state.session.writesEnabled===true&&!!state.projectId;}
function syncControls(){
  const operation=state.pending.current?.operation;
  const disabled=!canWrite()||!!state.pending.projects||!!state.pending.current;
  $('workspaceSelect').disabled=!state.session?.authenticated||!!state.pending.workspaces;
  $('projectSelect').disabled=!state.workspaceId||!!state.pending.projects||!state.projects.length;
  $('refreshHistory').disabled=!state.projectId||!!state.pending.history;
  $('execute').disabled=disabled;
  $('execute').textContent=operation==='run'?'Agent 正在读取上下文并补全…':'运行需求 Agent';
  $('submitDecisions').disabled=disabled||!state.current;
  $('submitDecisions').textContent=operation==='decisions'?'正在记录决策…':'提交决策并继续';
  $('handoff').disabled=disabled||state.current?.status!=='READY_FOR_PRD';
  $('handoff').textContent=operation==='handoff'?'正在生成整理包…':'生成 PRD 整理包';
  $('resultPanel').setAttribute('aria-busy',String(!!state.pending.current));
  document.querySelectorAll('#decisionList input').forEach(input=>{input.disabled=disabled||input.dataset.resolved==='true';});
}
function finishRequest(request){
  if(!isCurrent(request))return;
  if(state.pending[request.kind]===request)delete state.pending[request.kind];
  syncControls();
}
function clearResult(){
  state.current=null;$('resultPanel').hidden=true;
  for(const id of ['resultStatus','summary','completionScore','decisionCount','runTrace','requirementsList','decisionList'])clear($(id));
  $('submitDecisions').hidden=true;
}
function resetView({clearProjects=false}={}){
  // A submitted POST is never aborted or replayed here: the server may have
  // accepted it. Its durable result can be recovered with the history query.
  const submitted=state.pending.current&&state.pending.current.operation!=='open';
  ++state.routeVersion;state.pending={};clearResult();clear($('historyList'));
  $('historyList').dataset.state='idle';delete $('historyList').dataset.errorKind;
  if(clearProjects){state.projectId=null;state.projects=[];clear($('projectSelect'));$('projectSelect').dataset.state='idle';delete $('projectSelect').dataset.errorKind;}
  ++toastVersion;$('toast').classList.remove('show');$('toast').textContent='';
  delete $('inputStatus').dataset.errorKind;$('inputStatus').dataset.state='idle';
  $('inputStatus').textContent=submitted?'已提交的请求可能仍在服务器执行。可返回原项目刷新历史核验，请勿重复提交。':'';
  syncControls();
}
function expireSession(request){
  if(!isCurrent(request))return;
  ++state.sessionVersion;state.session=null;state.workspaceId=null;resetView({clearProjects:true});clear($('workspaceSelect'));
  $('sessionBadge').textContent='身份已失效';$('inputStatus').textContent=errorText(requestError('auth',401));syncControls();
}
function showReadError(request,error,target,prefix){
  if(!isCurrent(request))return;
  if(error.kind==='aborted'){
    $(target).textContent='读取已中止，可重新读取。';$(target).dataset.state='idle';delete $(target).dataset.errorKind;return;
  }
  if(error.kind==='auth'){expireSession(request);return;}
  if(target==='historyList'){
    clear($(target));$(target).append(node('p','aside-note',prefix+errorText(error)));
  }else $(target).textContent=prefix+errorText(error);
  $(target).dataset.state='error';$(target).dataset.errorKind=error.kind;
}
function collection(data,{key,scope,scopeId}={}){
  const items=key&&object(data)?data[key]:data;
  contract(Array.isArray(items));
  if(scope&&object(data)&&data[scope]!=null)contract(data[scope]===scopeId);
  contract(items.every(item=>object(item)&&validId(item.id))&&new Set(items.map(item=>item.id)).size===items.length);
  return items;
}
function completion(data,projectId,id){
  contract(object(data)&&validId(data.id)&&data.projectId===projectId&&(!id||data.id===id));
  contract(['REVIEW_REQUIRED','READY_FOR_PRD','HANDOFF_READY','FAILED'].includes(data.status)&&typeof data.sourceStatement==='string');
  contract(Array.isArray(data.decisions)&&data.decisions.every(decision=>object(decision)&&typeof decision.id==='string'&&typeof decision.question==='string'&&typeof decision.reason==='string'&&Array.isArray(decision.options)&&decision.options.every(option=>object(option)&&typeof option.id==='string'&&typeof option.label==='string'&&typeof option.description==='string')));
  contract(data.trace==null||(object(data.trace)&&(data.trace.runId==null||typeof data.trace.runId==='string')));
  if(data.result==null){contract(data.status==='FAILED');return data;}
  contract(object(data.result)&&typeof data.result.summary==='string'&&Array.isArray(data.result.requirements));
  contract(data.result.completionScore==null||(Number.isInteger(data.result.completionScore)&&data.result.completionScore>=0&&data.result.completionScore<=100));
  contract(data.result.requirements.every(item=>object(item)&&typeof item.id==='string'&&Object.hasOwn(tips,item.level)&&typeof item.description==='string'&&Array.isArray(item.acceptanceCriteria)&&item.acceptanceCriteria.every(value=>typeof value==='string')));
  return data;
}

async function bootstrap(){
  ++state.sessionVersion;state.session=null;state.workspaceId=null;resetView({clearProjects:true});clear($('workspaceSelect'));
  $('sessionBadge').textContent='检查身份…';
  const request=beginRequest('session');
  try{
    const session=await api('/auth/session');if(!isCurrent(request))return;
    contract(object(session)&&typeof session.authenticated==='boolean'&&(!session.authenticated||(typeof session.mode==='string'&&typeof session.writesEnabled==='boolean')));
    delete state.pending.session;state.session=session;
    if(!session.authenticated){$('sessionBadge').textContent='未登录';$('inputStatus').textContent='请返回项目总览登录。';syncControls();return;}
    $('sessionBadge').textContent=session.mode==='scoped'?'个人授权 · '+(session.writesEnabled?'可执行':'只读'):'共享预览 · 只读';
    if(!session.writesEnabled)$('inputStatus').textContent='运行 Agent 需要个人 scoped 身份与 project:write 权限。';
    await loadWorkspaces();
  }catch(error){showReadError(request,error,'inputStatus','启动失败：');}
  finally{finishRequest(request);}
}
async function loadWorkspaces(){
  const request=beginRequest('workspaces');syncControls();
  try{
    const data=await api('/api/runtime/workspaces');if(!isCurrent(request))return;
    const workspaces=collection(data);clear($('workspaceSelect'));
    for(const workspace of workspaces){const option=node('option','',workspace.name||workspace.workspaceKey||workspace.id);option.value=workspace.id;$('workspaceSelect').append(option);}
    delete state.pending.workspaces;
    state.workspaceId=workspaces[0]?.id||null;$('workspaceSelect').value=state.workspaceId||'';
    if(!state.workspaceId){$('inputStatus').textContent='当前身份没有可访问的工作空间。';syncControls();return;}
    await loadProjects();
  }catch(error){showReadError(request,error,'inputStatus','工作空间读取失败：');}
  finally{finishRequest(request);}
}
async function loadProjects(){
  if(!state.workspaceId||!state.session?.authenticated)return;
  // Loading a new project catalog immediately discards the previous selection.
  resetView({clearProjects:true});
  const request=beginRequest('projects');$('projectSelect').dataset.state='loading';syncControls();
  try{
    const data=await api('/api/runtime/projects?workspaceId='+encodeURIComponent(request.workspaceId)+'&limit=100');if(!isCurrent(request))return;
    const projects=collection(data,{key:'items',scope:'workspaceId',scopeId:request.workspaceId});
    contract(projects.every(project=>project.workspaceId==null||project.workspaceId===request.workspaceId));
    state.projects=projects;clear($('projectSelect'));
    for(const project of projects){const option=node('option','',(project.name||project.id)+' · '+(project.projectType||'未分类'));option.value=project.id;$('projectSelect').append(option);}
    delete state.pending.projects;$('projectSelect').dataset.state=projects.length?'ready':'empty';
    state.projectId=projects[0]?.id||null;$('projectSelect').value=state.projectId||'';syncControls();
    if(!state.projectId){$('inputStatus').textContent='当前工作空间没有可访问的项目。';return;}
    await loadHistory();
  }catch(error){
    if(isCurrent(request)){$('projectSelect').dataset.state=error.kind==='aborted'?'idle':'error';if(error.kind!=='aborted')$('projectSelect').dataset.errorKind=error.kind;}
    showReadError(request,error,'inputStatus','项目读取失败：');
  }finally{finishRequest(request);}
}
async function loadHistory(){
  if(!state.projectId||!state.session?.authenticated)return;
  const request=beginRequest('history');clear($('historyList'));$('historyList').dataset.state='loading';delete $('historyList').dataset.errorKind;
  $('historyList').append(node('p','aside-note','正在读取补全历史…'));syncControls();
  try{
    const data=await api('/api/runtime/projects/'+encodeURIComponent(request.projectId)+'/requirement-completions?limit=20');if(!isCurrent(request))return;
    contract(object(data)&&Array.isArray(data.items)&&data.projectId===request.projectId);
    const items=collection(data,{key:'items'});items.forEach(item=>completion(item,request.projectId));
    clear($('historyList'));$('historyList').dataset.state=items.length?'ready':'empty';
    for(const item of items){
      const card=node('article','history-item');const title=node('b','',statusLabel(item.status));const time=node('span','',item.createdAt?new Date(item.createdAt).toLocaleString('zh-CN'):'');const text=node('p','',item.sourceStatement);
      card.append(title,time,text);card.addEventListener('click',()=>{if(isCurrent(request))return openSession(item.id);});$('historyList').append(card);
    }
    if(!items.length)$('historyList').append(node('p','aside-note','当前项目还没有补全记录。'));
  }catch(error){showReadError(request,error,'historyList','历史读取失败：');}
  finally{finishRequest(request);}
}
async function openSession(id){
  if(!validId(id)||!state.projectId||!state.session?.authenticated)return;
  const submitted=state.pending.current&&state.pending.current.operation!=='open';
  const request=beginRequest('current','open');clearResult();syncControls();
  $('inputStatus').dataset.state='loading';delete $('inputStatus').dataset.errorKind;
  $('inputStatus').textContent=submitted?'已提交的请求可能仍在服务器执行。可刷新历史核验，请勿重复提交。':'正在读取补全记录…';
  try{
    const data=await api('/api/runtime/projects/'+encodeURIComponent(request.projectId)+'/requirement-completions/'+encodeURIComponent(id));if(!isCurrent(request))return;
    state.current=completion(data,request.projectId,id);$('inputStatus').textContent='';$('inputStatus').dataset.state='ready';render();
  }catch(error){showReadError(request,error,'inputStatus','记录读取失败：');}
  finally{finishRequest(request);}
}

function render(){
  const current=state.current;if(!current)return;$('resultPanel').hidden=false;
  $('resultStatus').textContent=statusLabel(current.status);$('summary').textContent=current.result?.summary||(current.status==='FAILED'?'本次执行失败，未生成结果。':'本次执行未生成结果。');
  $('completionScore').textContent=(current.result?.completionScore??'—')+(Number.isInteger(current.result?.completionScore)?'%':'');
  $('decisionCount').textContent=String((current.decisions||[]).filter(x=>x.status!=='RESOLVED').length);
  // This random requirement trace is not a verified Runtime Run relationship.
  $('runTrace').textContent=current.trace?.runId?current.trace.runId.slice(0,8):'—';
  $('runTrace').title='需求补全内部追踪标识，未验证为 Runtime Run。';
  const traceLabel=$('runTrace').parentElement?.querySelector('span');if(traceLabel)traceLabel.textContent='需求追踪';
  renderLevel();renderDecisions();syncControls();
}
function renderLevel(){
  document.querySelectorAll('.yellow-tabs button').forEach(button=>button.classList.toggle('active',button.dataset.level===state.level));
  $('levelTip').textContent=tips[state.level];clear($('requirementsList'));
  const items=(state.current?.result?.requirements||[]).filter(item=>item.level===state.level);
  for(const item of items){const card=node('article','requirement');const header=node('header');header.append(node('h4','',item.page||item.module||item.metric||item.function||item.id),node('span','dimension',item.dimension));card.append(header,node('p','',item.description));const list=node('ul');for(const criterion of item.acceptanceCriteria||[])list.append(node('li','',criterion));card.append(list);$('requirementsList').append(card);}
  if(!items.length)$('requirementsList').append(node('p','aside-note','该层级暂无输出；这通常表示模型输出未满足完整性要求。'));
}
function renderDecisions(){
  clear($('decisionList'));const decisions=state.current?.decisions||[];let pending=0;
  for(const decision of decisions){const card=node('section','decision-card');card.append(node('h4','',decision.question),node('small','',decision.reason));const options=node('div','options');
    for(const option of decision.options||[]){const label=node('label','option');const radio=document.createElement('input');radio.type='radio';radio.name='decision_'+decision.id;radio.value=option.id;radio.dataset.resolved=String(decision.status==='RESOLVED');if(decision.answer?.optionId===option.id)radio.checked=true;const copy=node('span','',option.label+' — '+option.description);label.append(radio,copy);if(option.recommended)label.append(node('em','','推荐'));options.append(label);}card.append(options);$('decisionList').append(card);if(decision.status!=='RESOLVED')pending++;}
  $('submitDecisions').hidden=pending===0;
  if(!decisions.length)$('decisionList').append(node('p','aside-note','没有必须由用户补充的决策项。'));
}

async function submit(operation,body,id){
  const actions={run:'',decisions:'/decisions',handoff:'/handoff'};
  if(!Object.hasOwn(actions,operation)||(operation!=='run'&&!validId(id))||!canWrite()||state.pending.current||state.pending.projects)return;
  const request=beginRequest('current',operation);syncControls();$('inputStatus').textContent='';$('inputStatus').dataset.state='loading';delete $('inputStatus').dataset.errorKind;
  const suffix=operation==='run'?'':'/'+encodeURIComponent(id)+actions[operation];
  try{
    // Do not attach a view-lifetime AbortSignal to writes. A dropped response
    // cannot establish server cancellation, nor authorize an automatic retry.
    const data=await api('/api/runtime/projects/'+encodeURIComponent(request.projectId)+'/requirement-completions'+suffix,{method:'POST',body:JSON.stringify(body)});
    if(!isCurrent(request))return;
    const current=completion(data,request.projectId,id);
    contract(operation==='handoff'?current.status==='HANDOFF_READY':['REVIEW_REQUIRED','READY_FOR_PRD'].includes(current.status));
    state.current=current;$('inputStatus').dataset.state='ready';render();
    toast({run:'需求补全已完成并持久化。',decisions:'决策已记录，断点已更新。',handoff:'PRD 整理包已生成。'}[operation]);
    await loadHistory();
  }catch(error){
    if(!isCurrent(request))return;
    if(error.kind==='auth'){expireSession(request);return;}
    $('inputStatus').dataset.state='error';$('inputStatus').dataset.errorKind=error.kind;
    const uncertain=['network','aborted','server','json','contract'].includes(error.kind);
    $('inputStatus').textContent=(uncertain?'请求结果未确认：':'提交失败：')+errorText(error)+(uncertain?'服务器可能已接收，请先刷新历史核验；不会自动重试。':'');
  }finally{finishRequest(request);}
}
$('workspaceSelect').addEventListener('change',async event=>{state.workspaceId=event.target.value||null;if(state.workspaceId)await loadProjects();else resetView({clearProjects:true});});
$('projectSelect').addEventListener('change',async event=>{state.projectId=event.target.value||null;resetView();await loadHistory();});
$('refreshHistory').addEventListener('click',loadHistory);
document.querySelectorAll('.yellow-tabs button').forEach(button=>button.addEventListener('click',()=>{state.level=button.dataset.level;renderLevel();}));
$('execute').addEventListener('click',async()=>{
  if(!canWrite()||state.pending.current)return;
  const statement=$('statement').value.trim();if(statement.length<4){$('inputStatus').textContent='请先输入至少 4 个字的需求描述。';return;}
  await submit('run',{statement,applicationType:$('applicationType').value});
});
$('decisionForm').addEventListener('submit',async event=>{
  event.preventDefault();if(!canWrite()||state.pending.current||!state.current)return;
  const answers=[];
  for(const decision of state.current.decisions){if(decision.status==='RESOLVED')continue;const selected=document.querySelector('input[name="decision_'+CSS.escape(decision.id)+'"]:checked');if(selected)answers.push({decisionId:decision.id,optionId:selected.value});}
  if(!answers.length){toast('请至少选择一项决策。');return;}
  await submit('decisions',{answers},state.current.id);
});
$('handoff').addEventListener('click',async()=>{if(state.current?.status==='READY_FOR_PRD')await submit('handoff',{},state.current.id);});
// BFCache and restored pages must recheck identity before re-enabling any write.
window.addEventListener('pagehide',()=>{++state.sessionVersion;state.session=null;resetView({clearProjects:true});});
window.addEventListener('pageshow',event=>{if(event.persisted)return bootstrap();});
bootstrap();
