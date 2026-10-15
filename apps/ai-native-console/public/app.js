import {isCurrentAssetRead,isCurrentKnowledgeRead,isCurrentRead} from './read-guards.mjs';
// AI Native M31: distinct addressable screens. No client-side business data persistence.
const $=id=>document.getElementById(id);
const state={workspaces:[],projects:[],presets:[],selected:null,workspaceId:null,type:'',writesEnabled:false,routeVersion:0,viewCache:null,stageContext:null,assetNonce:0,knowledgeNonce:0,projectListNonce:0,sessionEpoch:0,authenticated:false,readNonces:{},workspaceRead:{status:'idle'},projectRead:{status:'idle'},presetRead:{status:'idle'},dialogVersions:{account:0,create:0},formPending:{}};
const make=(tag,value='',cls='')=>{const e=document.createElement(tag);e.textContent=value==null?'—':String(value);if(cls)e.className=cls;return e;};
const clear=node=>node.replaceChildren();
const text=(id,value)=>$(id).textContent=value==null?'—':String(value);
const warn=message=>{const el=$('notice');el.className=message?'warn':'';el.textContent=message||'';};
const projectType=p=>p.projectType==='AIGC_CONTENT'?'AIGC 内容生产':p.projectType==='PRODUCT_DEVELOPMENT'?'产品研发':p.projectType;
const AIGC_DOMAINS={
 AIGC_00_INIT:'aigc-foundation',AIGC_01_DISCOVERY:'aigc-foundation',AIGC_02_PLAN:'aigc-foundation',
 AIGC_03_SCRIPT:'aigc-script-domain',AIGC_04_BREAKDOWN:'aigc-breakdown',AIGC_05_FORMAT:'aigc-format-strategy',
 AIGC_06_ASSET:'aigc-asset-system',AIGC_07_IMAGE:'aigc-generation-image',
 AIGC_08_VIDEO_AUDIO:'aigc-video-audio-production',AIGC_09_EDIT:'aigc-edit-timeline',
 AIGC_10_MASTER:'aigc-mastering',AIGC_11_DERIVATION:'aigc-distribution-package',
 AIGC_12_PUBLISH:'aigc-release-publishing',AIGC_13_PERFORMANCE:'aigc-performance',AIGC_14_REVIEW:'aigc-review'
};
const PRODUCT_DOMAINS=[
 ['product-domain','需求与产品基线'],['product-delivery-domain','设计与技术交付'],
 ['product-engineering-domain','研发与预览'],['product-quality-domain','验收与质量'],
 ['product-outcome','结果与实验'],['product-review','复盘与知识回写']
];
const validId='[A-Za-z0-9-]{1,64}';
const parseRoute=(path=location.pathname)=>{
 if(path==='/'||path==='/projects')return {page:'projects'};
 if(path==='/capabilities')return {page:'capabilities'};
 if(path==='/knowledge')return {page:'knowledge'};
 let m=path.match(new RegExp('^/projects/('+validId+')/(tasks|assets)/('+validId+')$'));
 if(m)return {page:'detail',projectId:m[1],kind:m[2],objectId:m[3]};
 m=path.match(new RegExp('^/projects/('+validId+')/(overview|tasks|assets|data|stages|audit)$'));
 if(m)return {page:'project',projectId:m[1],tab:m[2]};
 m=path.match(new RegExp('^/projects/('+validId+')$'));
 if(m)return {page:'project',projectId:m[1],tab:'overview'};
 return {page:'not-found'};
};
const urlFor=(id,tab='overview')=>'/projects/'+encodeURIComponent(id)+'/'+tab;
// Keep HTTP status separate from a backend error code. Non-JSON error bodies
// still carry their auth/forbidden/not-found semantics.
function readFailure(code,status=0,kind='error'){
 const error=Error(code);error.status=status;error.kind=kind;return error;
}
async function req(path,opts={}){
 let result;
 try{result=await fetch(path,{credentials:'same-origin',...opts,headers:{...(opts.body?{'content-type':'application/json'}:{}),...opts.headers}});}
 catch(error){if(error?.name==='AbortError')throw readFailure('READ_ABORTED',0,'abort');throw readFailure('NETWORK_ERROR',0,'network');}
 let payload;
 try{payload=await result.json();}
 catch(error){if(error?.name==='AbortError')throw readFailure('READ_ABORTED',0,'abort');throw readFailure('SERVER_NON_JSON_RESPONSE',result.status,'invalid-json');}
 if(!result.ok)throw readFailure(typeof payload?.error==='string'?payload.error:'HTTP_'+result.status,result.status,'http');
 if(payload===null||typeof payload!=='object')throw readFailure('RESPONSE_CONTRACT_INVALID',result.status,'contract');
 return Object.hasOwn(payload,'data')?payload.data:payload;
}
const contract=(valid,code)=>{if(!valid)throw readFailure(code,0,'contract');};
const record=value=>value!==null&&typeof value==='object'&&!Array.isArray(value);
const records=value=>Array.isArray(value)&&value.every(record);
function readMessage(error){
 if(error.status===401)return '登录已失效，请重新登录。';
 if(error.status===403)return '无权访问（403）：'+error.message;
 if(error.status===404)return '未找到（404）：'+error.message;
 if(error.kind==='abort')return '读取已取消，可刷新重试。';
 if(error.kind==='network')return '网络连接失败，请重试。';
 if(error.kind==='invalid-json')return '响应不是有效 JSON，请重试。';
 if(error.kind==='contract')return '响应格式不符合约定：'+error.message;
 return '读取失败：'+error.message;
}
const mutationUncertain=error=>error.status>=500||['network','abort','invalid-json','contract'].includes(error.kind);
const mutationUncertainMessage='服务端结果尚未确认。请先核实结果再决定是否重新提交；不会自动重试。';
function readState(root,status,message){
 root.dataset.readState=status;root.setAttribute('aria-busy',String(status==='loading'));
 root.replaceChildren(make('p',message,status==='error'?'error':'muted'));
}
function beginRead(key,{projectId=parseRoute().projectId??null}={}){
 const request={key,sessionEpoch:state.sessionEpoch,workspaceId:state.workspaceId,
  routeVersion:state.routeVersion,projectId,nonce:state.readNonces[key]=(state.readNonces[key]||0)+1};
 const current=()=>state.authenticated&&isCurrentRead(request,{
  sessionEpoch:state.sessionEpoch,workspaceId:state.workspaceId,routeVersion:state.routeVersion,
  projectId:parseRoute().projectId??null,nonce:state.readNonces[key]
 });
 return {request,current};
}
function clearSession(message=''){
 ++state.sessionEpoch;++state.routeVersion;state.authenticated=false;state.writesEnabled=false;
 state.projects=[];state.workspaces=[];state.presets=[];state.workspaceId=null;state.selected=null;state.viewCache=null;
 clearProjectContent();$('refreshProject').disabled=false;
 state.workspaceRead={status:'idle'};state.projectRead={status:'idle'};state.presetRead={status:'idle'};
 for(const id of ['projectList','workspaceSelect','capabilityRows','knowledgeRows','knowledgeProject','milestones','taskRows','dataRows','modules','domainSelect','stageTable','transitions','liveAuditRows','auditRows','detailRows'])clear($(id));
 text('detailTitle','');text('detailMeta','');text('aigcStageCheckResult','');text('stageCount','—');
 $('aigcStageCheck').hidden=true;$('login').hidden=false;$('workspace').hidden=true;
 $('logout').hidden=true;$('accountSettings').hidden=true;$('credentialSettings').hidden=true;
 $('newProject').disabled=true;$('refresh').disabled=false;
 for(const name of ['account','create']){invalidateDialog(name);if($(name+'Dialog').open)$(name+'Dialog').close();}
 $('accountForm').reset();$('createForm').reset();loginMode();warn('');text('loginError',message);
}
function appendReadRetry(root,current){
 const retry=make('button','重新读取','outline');retry.addEventListener('click',()=>{if(current())return renderRoute();});root.append(retry);
}
function invalidateDialog(name){
 ++state.dialogVersions[name];delete state.formPending[name];$(name==='create'?'createSubmit':'accountSubmit').disabled=false;
}
function settleDialogClose(name){
 const pending=state.formPending[name];invalidateDialog(name);
 if(pending)warn('提交可能仍在处理中；关闭窗口不会取消服务器操作。请先核实结果再决定是否重新提交。');
}
function closeDialog(name){settleDialogClose(name);$(name+'Dialog').close();}
function handleReadError(error,current,root,prefix=''){
 if(!current())return false;
 if(error.kind==='abort'){if(root)readState(root,'idle',readMessage(error));return false;}
 if(error.status===401){clearSession(readMessage(error));return false;}
 if(root){readState(root,'error',prefix+readMessage(error));appendReadRetry(root,current);}
 return true;
}
function navigate(path,{replace=false}={}){
 if(replace)history.replaceState(null,'',path);
 else if(location.pathname!==path)history.pushState(null,'',path);
 return renderRoute();
}
const links=(el,path,label,cls='')=>{const a=make('a',label,cls);a.href=path;a.dataset.nav='';el.append(a);return a;};
document.addEventListener('click',event=>{
 const a=event.target.closest('a[data-nav]');
 if(!a||event.defaultPrevented||event.metaKey||event.ctrlKey||event.shiftKey||event.altKey||event.button!==0)return;
 const target=new URL(a.href,location.origin);
 if(target.origin!==location.origin)return;
 event.preventDefault();navigate(target.pathname);
});
window.addEventListener('popstate',()=>renderRoute());
// A restored browser history snapshot must never revive an authenticated UI or
// a previously authorized file link without re-reading the session.
window.addEventListener('pagehide',()=>clearSession());
window.addEventListener('pageshow',event=>{if(event.persisted)void bootstrap();});
function setActiveNav(route){
 const active=route.page==='project'||route.page==='detail'?'projects':route.page;
 document.querySelectorAll('[data-global]').forEach(el=>{
  const selected=el.dataset.global===active;
  el.classList.toggle('selected',selected);
  if(selected)el.setAttribute('aria-current','page');else el.removeAttribute('aria-current');
 });
}
function setScreen(id){
 for(const name of ['catalogScreen','capabilityScreen','knowledgeScreen','projectScreen','detailScreen'])$(name).hidden=name!==id;
}
function showTab(tab,id){
 document.querySelectorAll('.tab[data-panel]').forEach(a=>{
  a.href=urlFor(id,a.dataset.panel);a.classList.toggle('active',a.dataset.panel===tab);
  if(a.dataset.panel===tab)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');
 });
 for(const name of ['overview','tasks','assets','data','stages','audit'])$(name).hidden=name!==tab;
}
function loginMode(){
 text('loginSecretLabel','个人账号密码');
 $('password').value='';
}
$('loginForm').addEventListener('submit',async event=>{
 event.preventDefault();text('loginError','');
 const password=$('password').value;clearSession();const epoch=state.sessionEpoch;
 try{
  await req('/auth/login',{method:'POST',body:JSON.stringify({password})});
  if(epoch!==state.sessionEpoch)return;
  await bootstrap();
 }catch(e){
  if(epoch!==state.sessionEpoch)return;
  const message=e.message==='INVALID_CREDENTIALS'?'凭证或密码不正确，请重新输入。':['TOO_MANY_ATTEMPTS','LOGIN_RATE_LIMITED'].includes(e.message)?'尝试次数过多，请稍后再试。':'暂时无法登录，请稍后重试。';
  text('loginError',message);
 }
});
$('logout').addEventListener('click',async()=>{
 // Invalidate reads before waiting for the logout response.
 clearSession();const epoch=state.sessionEpoch;
 try{await req('/auth/logout',{method:'POST',body:'{}'});}
 catch(e){if(epoch===state.sessionEpoch)text('loginError','退出请求未完成：'+readMessage(e));}
});
$('accountSettings').addEventListener('click',()=>{invalidateDialog('account');$('accountForm').reset();text('accountError','');$('accountDialog').showModal();});
$('closeAccount').addEventListener('click',()=>closeDialog('account'));
$('accountDialog').addEventListener('close',()=>{if(!$('accountDialog').open)settleDialogClose('account');});
$('accountForm').addEventListener('submit',async event=>{
 event.preventDefault();
 if(state.formPending.account||!$('accountDialog').open)return;
 text('accountError','');
 if($('newPassword').value!==$('confirmPassword').value){text('accountError','两次输入的新密码不一致。');return;}
 const version=state.dialogVersions.account,{current:readCurrent}=beginRead('account-submit');
 const current=()=>readCurrent()&&version===state.dialogVersions.account&&$('accountDialog').open;
 state.formPending.account={version};$('accountSubmit').disabled=true;
 try{
  const result=await req('/auth/change-password',{method:'POST',body:JSON.stringify({currentPassword:$('currentPassword').value,newPassword:$('newPassword').value})});
  if(!current())return;
  contract(record(result)&&result.changed===true,'PASSWORD_CHANGE_CONTRACT_INVALID');
  delete state.formPending.account;$('accountDialog').close();warn('密码修改成功。');
 }catch(e){
  if(!current())return;
  if(e.status===401&&e.message!=='CURRENT_PASSWORD_INVALID'){clearSession(readMessage(e));return;}
  text('accountError',mutationUncertain(e)?mutationUncertainMessage:e.message==='CURRENT_PASSWORD_INVALID'?'当前密码不正确。':e.message==='PASSWORD_POLICY_REQUIRED'?'新密码至少需要 12 个字符。':'密码修改失败，请稍后重试。');
 }finally{if(current()){delete state.formPending.account;$('accountSubmit').disabled=false;}}
});
async function bootstrap(){
 clearSession();const epoch=state.sessionEpoch;
 try{
  const session=await req('/auth/session');
  if(epoch!==state.sessionEpoch)return;
  contract(record(session)&&typeof session.authenticated==='boolean','SESSION_CONTRACT_INVALID');
  if(!session.authenticated)return;
  if(session.credentialAdmin){location.href='/credential-admin';return;}
  state.authenticated=true;state.writesEnabled=!!session.writesEnabled;
  $('login').hidden=true;$('workspace').hidden=false;$('logout').hidden=false;
  $('accountSettings').hidden=!session.owner;$('credentialSettings').hidden=!session.owner;
  $('newProject').disabled=!state.writesEnabled;
  $('newProject').title=state.writesEnabled?'在预发环境创建真实项目':'需要受限写入权限，当前预发写入关闭';
  await loadCatalogs();
 }catch(e){if(epoch===state.sessionEpoch)text('loginError','启动失败：'+readMessage(e));}
}
async function loadPresets(){
 const {current}=beginRead('presets');state.presets=[];state.presetRead={status:'loading'};
 try{
  const data=await req('/api/runtime/domain-presets');if(!current())return;
  const items=Array.isArray(data)?data:data?.items;contract(records(items),'PRESET_CONTRACT_INVALID');
  state.presets=items;state.presetRead={status:'ready'};
 }catch(e){if(current()&&e.kind==='abort')state.presetRead={status:'cancelled',error:e};else if(handleReadError(e,current,null))state.presetRead={status:'error',error:e};}
}
async function loadCatalogs(){
 const {current}=beginRead('workspaces');state.workspaceRead={status:'loading'};state.projectRead={status:'idle'};state.projects=[];
 setScreen('catalogScreen');renderCatalog();
 try{
  const workspaces=await req('/api/runtime/workspaces');if(!current())return;
  contract(records(workspaces)&&workspaces.every(w=>typeof w.id==='string'&&w.id),'WORKSPACE_CONTRACT_INVALID');
  state.workspaces=workspaces;state.workspaceRead={status:'ready'};
  clear($('workspaceSelect'));
  for(const w of state.workspaces){const option=make('option',w.name||w.workspaceKey||w.id);option.value=w.id;$('workspaceSelect').append(option);}
  state.workspaceId=state.workspaces.some(x=>x.id===state.workspaceId)?state.workspaceId:state.workspaces[0]?.id||null;
  if(state.workspaceId)$('workspaceSelect').value=state.workspaceId;
  // The optional administrator preset catalogue is loaded only in its dialog.
  await loadProjects();
 }catch(e){
  if(current()&&e.kind==='abort'){state.workspaceRead={status:'cancelled',error:e};await renderRoute();return;}
  if(!handleReadError(e,current,null))return;
  state.projects=[];state.workspaceRead={status:'error',error:e};await renderRoute();
 }
}
async function loadProjects(){
 if(!state.authenticated)return;
 ++state.routeVersion;clearProjectContent();
 const {request,current}=beginRead('projects');const workspaceId=request.workspaceId;
 ++state.projectListNonce;state.projects=[];state.selected=null;state.projectRead={status:'loading'};
 $('refresh').disabled=true;$('refreshProject').disabled=true;setScreen('catalogScreen');renderCatalog();
 try{
  const items=[];let offset=0,total=null;
  while(workspaceId){
   const page=await req('/api/runtime/projects?workspaceId='+encodeURIComponent(workspaceId)+'&offset='+offset+'&limit=100');
   if(!current())return;
   contract(record(page)&&records(page.items)&&Number.isInteger(page.total)&&page.total>=0&&
    page.items.every(p=>typeof p.id==='string'&&p.id)&&(!page.workspaceId||page.workspaceId===workspaceId),'PROJECT_LIST_CONTRACT_INVALID');
   contract(total===null||total===page.total,'PROJECT_LIST_CHANGED_DURING_READ');
   total=page.total;items.push(...page.items);offset+=page.items.length;
   contract(items.length<=total&&new Set(items.map(p=>p.id)).size===items.length,'PROJECT_LIST_CONTRACT_INVALID');
   contract(items.length<=1000,'PROJECT_LIST_LIMIT_EXCEEDED');
   contract(page.items.length>0||offset===total,'PROJECT_LIST_INCOMPLETE');
  if(offset>=total)break;
  }
  if(!current())return;
  state.projects=items;state.projectRead={status:'ready'};state.viewCache=null;
 }catch(e){
  if(current()&&e.kind==='abort')state.projectRead={status:'cancelled',error:e};
  else{if(!handleReadError(e,current,null))return;state.projects=[];state.projectRead={status:'error',error:e};}
 }finally{if(current()){$('refresh').disabled=false;$('refreshProject').disabled=false;}}
 if(current())await renderRoute();
}

function renderCatalog(){
 const root=$('projectList');clear(root);
 if(state.workspaceRead.status==='cancelled'||state.projectRead.status==='cancelled'){readState(root,'idle','读取已取消，可刷新重试。');return;}
 if(state.workspaceRead.status==='error'){readState(root,'error','工作空间读取失败：'+readMessage(state.workspaceRead.error));return;}
 if(state.projectRead.status==='error'){readState(root,'error','真实项目查询失败：'+readMessage(state.projectRead.error));return;}
 if(state.workspaceRead.status!=='ready'||state.projectRead.status!=='ready'){readState(root,'loading','正在读取真实项目…');return;}
 root.dataset.readState='ready';root.setAttribute('aria-busy','false');
 if(!state.workspaces.length){readState(root,'empty','当前账号没有可读取的工作空间。');return;}
 const items=state.projects.filter(p=>!state.type||p.projectType===state.type);
 if(!items.length){readState(root,'empty','当前筛选范围没有真实项目。');return;}
 for(const p of items){
  const card=links(root,urlFor(p.id),'','portfolio-card');
  card.replaceChildren(make('strong',p.name||p.projectKey),make('span',projectType(p)+' · '+(p.status||'—'),'muted'));
  card.append(make('small','项目 ID · '+p.id,'mono'),make('span','进入项目 →','entry-arrow'));
 }
}
async function renderCapability(){
 const root=$('capabilityRows'),{current}=beginRead('capabilities');
 readState(root,'loading','正在读取正式能力池…');
 try{
  const arr=await req('/api/runtime/capabilities');if(!current())return;
  contract(records(arr),'CAPABILITY_CONTRACT_INVALID');
  clear(root);root.dataset.readState='ready';root.setAttribute('aria-busy','false');
  if(!arr.length){readState(root,'empty','Runtime 能力注册表暂无记录。');return;}
  for(const entry of arr){
   const row=make('div','','event');
   const name=entry.displayName||entry.name||entry.capabilityKey||entry.key||entry.id;
   row.append(make('strong',name||'未命名能力'),make('span',entry.capabilityType||entry.type||entry.status||'—','mono'));root.append(row);
  }
 }catch(e){handleReadError(e,current,root,'正式能力池：');}
}
async function renderKnowledge(){
 const select=$('knowledgeProject');const root=$('knowledgeRows');clear(select);clear(root);
 for(const p of state.projects){const option=make('option',p.name||p.projectKey);option.value=p.id;select.append(option);}
 if(!state.projects.length){readState(root,'empty','当前没有可读取的项目知识源绑定。');return;}
 const route=select.dataset.last;
 if(route&&state.projects.some(p=>p.id===route))select.value=route;
 await loadKnowledgeBinding(select.value);
}
async function loadKnowledgeBinding(id){
 const root=$('knowledgeRows');clear(root);
 const request={sessionEpoch:state.sessionEpoch,routeVersion:state.routeVersion,nonce:++state.knowledgeNonce,workspaceId:state.workspaceId,projectId:id};
 const current=()=>state.authenticated&&isCurrentKnowledgeRead(request,{
  sessionEpoch:state.sessionEpoch,routeVersion:state.routeVersion,nonce:state.knowledgeNonce,workspaceId:state.workspaceId,
  projectId:$('knowledgeProject').value,page:parseRoute().page
 });
 if(!id)return;
 readState(root,'loading','正在读取项目知识源…');
 try{
  const items=await req('/api/runtime/projects/'+encodeURIComponent(id)+'/knowledge-bindings');
  if(!current())return;
  clear(root);
  contract(records(items),'KNOWLEDGE_BINDING_CONTRACT_INVALID');root.dataset.readState='ready';root.setAttribute('aria-busy','false');
  if(!items.length){readState(root,'empty','该项目未绑定知识源。全局文件浏览和授权打开仍未接通。');return;}
  for(const it of items){
   const row=make('div','','event'),info=make('div');
   info.append(make('strong',it.bindingKey||it.sourceKey));
   info.append(make('p',[it.sourceKey,it.provider,it.sourceType].filter(Boolean).join(' · '),'mono'));
   row.append(info,make('span',it.status||'—','status'));root.append(row);
  }
 }catch(e){handleReadError(e,current,root,'知识源绑定：');}
}

const values=(root,obj,fields)=>{
 for(const [key,value] of fields){
  const row=make('div','','event');row.append(make('strong',key),make('span',value??'—','mono'));root.append(row);
 }
};
// Project read sections own their state; missing contracts are never empty data.
const knownText=(value,missing='未提供')=>typeof value==='string'&&value.trim()?value:missing;
const displayTime=value=>typeof value==='string'&&value.trim()&&Number.isFinite(Date.parse(value))?value:'时间未知';
const progressText=value=>typeof value==='number'&&Number.isFinite(value)&&value>=0&&value<=100?value+'%（服务端值）':'未知';
function readySection(root){clear(root);root.dataset.readState='ready';root.setAttribute('aria-busy','false');}
function textFields(item,fields,code){contract(fields.every(key=>item[key]==null||typeof item[key]==='string'),code);}
function projectIdentity(data,id,code){contract(record(data)&&record(data.project)&&typeof data.project.id==='string'&&data.project.id===id&&(!Object.hasOwn(data.project,'workspaceId')||data.project.workspaceId===state.workspaceId),code);}
function collection(data,key,id,fields=[]){
 const items=data[key],code='GOVERNANCE_'+key.toUpperCase()+'_CONTRACT_INVALID';
 contract(records(items)&&items.every(x=>typeof x.id==='string'&&x.id.trim()&&(!Object.hasOwn(x,'projectId')||x.projectId===id))&&new Set(items.map(x=>x.id)).size===items.length,code);
 for(const item of items)textFields(item,fields,code);
 return items;
}
function validatePlan(g,id){
 projectIdentity(g,id,'GOVERNANCE_PROJECT_CONTRACT_INVALID');
 collection(g,'workItems',id,['itemKey','itemType','title','status','priority','milestoneId','iterationId','stageKey']);
 collection(g,'milestones',id,['displayName','milestoneKey','managementStatus','workflowStatus','plannedStart','plannedEnd']);
 collection(g,'iterations',id,['name','iterationKey','status','startDate','endDate']);
 collection(g,'dependencies',id,['sourceType','sourceId','targetType','targetId','dependencyType','status']);
 contract(g.iterations.every(x=>x.sequenceNo==null||(typeof x.sequenceNo==='number'&&Number.isFinite(x.sequenceNo))),'GOVERNANCE_ITERATIONS_CONTRACT_INVALID');
 contract(g.dependencies.every(x=>['sourceType','sourceId','targetType','targetId'].every(key=>typeof x[key]==='string'&&x[key].trim())&&(x.criticalPath==null||typeof x.criticalPath==='boolean')),'GOVERNANCE_DEPENDENCIES_CONTRACT_INVALID');
}
function validateLifecycle(v,id){
 projectIdentity(v,id,'LIFECYCLE_PROJECT_CONTRACT_INVALID');
 textFields(v.project,['currentStageKey','currentWorkflowVersion','status'],'LIFECYCLE_PROJECT_CONTRACT_INVALID');
 contract(records(v.stages)&&v.stages.every(x=>typeof x.id==='string'&&x.id.trim()&&typeof x.stageKey==='string'&&x.stageKey.trim()&&typeof x.sequenceNo==='number'&&Number.isInteger(x.sequenceNo)&&(!Object.hasOwn(x,'projectId')||x.projectId===id))&&new Set(v.stages.map(x=>x.id)).size===v.stages.length,'LIFECYCLE_STAGE_CONTRACT_INVALID');
 for(const stage of v.stages)textFields(stage,['displayName','status','agentCapabilityKey','gatePolicyKey','lastGateResultId','blockedReason','startedAt','completedAt'],'LIFECYCLE_STAGE_CONTRACT_INVALID');
}
const projectSectionIds=['governanceSummary','lifecycleSummary','sourceComparison','governanceBlockers','stageBlockers','governanceDecisions','milestones','taskRows','planDependencies','stageTable','transitions'];
function clearProjectContent(){
 state.stageContext=null;
 for(const id of projectSectionIds){clear($(id));$(id).dataset.readState='idle';$(id).setAttribute('aria-busy','false');}
 clear($('detailRows'));text('detailTitle','');text('detailMeta','');$('governanceHealth').dataset.health='unknown';
 for(const id of ['overviewPlanLink','overviewStagesLink'])$(id).removeAttribute('href');
 for(const id of ['projectTitle','projectMeta','projectStatus','currentStage','workflowVersion','governanceHealth','governanceStage','lifecycleStage','projectHeaderState'])text(id,'');
 text('stageCount','—');text('aigcStageCheckResult','');$('aigcStageCheck').hidden=true;
}
function sectionError(root,error,current,prefix=''){
 if(!current())return;
 if(error.status===401){clearSession(readMessage(error));return;}
 readState(root,error.kind==='abort'?'idle':error.status===403?'forbidden':'error',prefix+readMessage(error));
}
function renderMilestones(g){
 const root=$('milestones');readySection(root);const ms=g.milestones;
 if(!ms.length){readState(root,'empty','暂无正式里程碑记录。');return;}
 for(const m of ms){
  const row=make('article','','project-record');row.append(make('h3',knownText(m.displayName,knownText(m.milestoneKey,'未命名里程碑'))));
  values(row,m,[['管理状态',knownText(m.managementStatus)],['工作流状态',knownText(m.workflowStatus)],['里程碑进度',progressText(m.progressPercent)],['计划开始',displayTime(m.plannedStart)],['计划结束',displayTime(m.plannedEnd)]]);
  row.append(make('small','里程碑 ID · '+m.id,'mono'));root.append(row);
 }
}
function planAssignment(g,item,key){
 const milestone=key==='milestoneId',label=milestone?'里程碑':'迭代',id=item[key];
 if(id===undefined||id==='')return {key:'unknown',label:label+'归属未知（未返回正式归属）',id:null};
 if(id===null)return {key:'unregistered',label:'未登记'+label+'归属',id:null};
 const target=g[milestone?'milestones':'iterations'].find(x=>x.id===id);
 return {key:'id:'+id,label:target?label+' · '+knownText(milestone?target.displayName:target.name,knownText(milestone?target.milestoneKey:target.iterationKey,id)):label+'目标不可确认（未确认目标）',id,target};
}
function appendPlanContext(root,g,item){
 for(const key of ['milestoneId','iterationId']){
  const assignment=planAssignment(g,item,key);root.append(make('p',assignment.label,'context-label'));
  if(assignment.id)root.append(make('small',(key==='milestoneId'?'里程碑':'迭代')+' ID · '+assignment.id,'mono'));
  if(assignment.target){const x=assignment.target;values(root,x,key==='milestoneId'?[['管理状态',knownText(x.managementStatus)],['工作流状态',knownText(x.workflowStatus)],['里程碑进度',progressText(x.progressPercent)],['计划开始',displayTime(x.plannedStart)],['计划结束',displayTime(x.plannedEnd)]]:[['迭代状态',knownText(x.status)],['迭代顺序',typeof x.sequenceNo==='number'?x.sequenceNo:'未知'],['迭代开始',displayTime(x.startDate)],['迭代结束',displayTime(x.endDate)]]);}
 }
}
function dependencyEndpoint(root,g,type,id,projectId){
 const collections={WORK_ITEM:'workItems',MILESTONE:'milestones',ITERATION:'iterations'};
 const item=Object.hasOwn(collections,type)?g[collections[type]].find(x=>x.id===id):null;
 const box=make('div','','dependency-endpoint');
 const label=type+' · '+id;
 if(item&&type==='WORK_ITEM')links(box,urlFor(projectId,'tasks')+'/'+encodeURIComponent(item.id),knownText(item.title,knownText(item.itemKey,item.id))+'（'+label+'）','inline-link');
 else box.append(make('span',label+(item?' · '+knownText(item.displayName,knownText(item.name,item.id)):' · 目标不可确认（未确认目标）')));
 root.append(box);
}
function renderDependencies(g,projectId,root=$('planDependencies'),workItemId=null){
 readySection(root);const items=workItemId?g.dependencies.filter(d=>(d.sourceType==='WORK_ITEM'&&d.sourceId===workItemId)||(d.targetType==='WORK_ITEM'&&d.targetId===workItemId)):g.dependencies;
 if(!items.length){readState(root,'empty','无返回的'+(workItemId?'此 WorkItem ':'')+'依赖记录。');return;}
 for(const d of items){
  const row=make('article','','project-record');row.append(make('h3',knownText(d.dependencyType,'依赖类型未知')));
  dependencyEndpoint(row,g,d.sourceType,d.sourceId,projectId);row.append(make('span','→','muted'));dependencyEndpoint(row,g,d.targetType,d.targetId,projectId);
  values(row,d,[['依赖状态',knownText(d.status)],['关键路径标记',typeof d.criticalPath==='boolean'?(d.criticalPath?'是（服务端标记）':'否（服务端标记）'):'未知']]);
  row.append(make('small','依赖 ID · '+d.id,'mono'));root.append(row);
 }
}
function renderTasks(g,id){
 const root=$('taskRows');readySection(root);const items=g.workItems;
 if(!items.length)readState(root,'empty','该项目没有服务端 WorkItem 记录。');
 const groups=new Map();
 for(const task of items){const m=planAssignment(g,task,'milestoneId'),it=planAssignment(g,task,'iterationId');
  if(!groups.has(m.key))groups.set(m.key,{assignment:m,iterations:new Map()});const group=groups.get(m.key);
  if(!group.iterations.has(it.key))group.iterations.set(it.key,{assignment:it,items:[]});group.iterations.get(it.key).items.push(task);
 }
 for(const group of groups.values()){
  const section=make('section','','plan-group');section.dataset.milestoneId=group.assignment.id||'';section.append(make('h3',group.assignment.label));
  if(group.assignment.id)section.append(make('small','里程碑 ID · '+group.assignment.id,'mono'));
  for(const iteration of group.iterations.values()){
   const part=make('section','','iteration-group');part.dataset.iterationId=iteration.assignment.id||'';part.append(make('h4',iteration.assignment.label));
   if(iteration.assignment.id)part.append(make('small','迭代 ID · '+iteration.assignment.id,'mono'));
   for(const task of iteration.items){
    const row=links(part,urlFor(id,'tasks')+'/'+encodeURIComponent(task.id),'','task-row');row.dataset.workItemId=task.id;
    row.append(make('strong',knownText(task.title,knownText(task.itemKey,'未命名 WorkItem'))),make('span',knownText(task.priority)+' · '+knownText(task.status),'status'));
    row.append(make('small','WorkItem ID · '+task.id+' · 类型 '+knownText(task.itemType)+' · 阶段 Key '+knownText(task.stageKey,'未登记'),'mono'));
   }section.append(part);
  }root.append(section);
 }
 renderDependencies(g,id);
}
async function loadOverview(project,current){
 const rootsG=['governanceSummary','governanceBlockers','governanceDecisions','milestones'],rootsL=['lifecycleSummary','stageBlockers'];
 const source={};
 const compare=()=>{if(!current())return;const root=$('sourceComparison');
  if(source.g===undefined||source.l===undefined){readState(root,'loading','正在分别核对治理与生命周期来源…');return;}
  if(source.g===null||source.l===null){readState(root,'unknown','部分来源不可用，不能合成统一的当前阶段结论。');return;}
  if(!source.g||!source.l){readState(root,'unknown','当前阶段来源有未提供值，尚不能核对一致性。');return;}
  readState(root,source.g===source.l?'ready':'mismatch',source.g===source.l?'治理与生命周期返回的当前阶段一致。':'来源不一致：治理当前阶段 '+source.g+'；生命周期当前阶段 '+source.l+'。');
 };
 const path='/api/runtime/projects/'+encodeURIComponent(project.id);
 await Promise.all([
  (async()=>{try{
   const g=await req(path+'/governance');if(!current())return;projectIdentity(g,project.id,'GOVERNANCE_PROJECT_CONTRACT_INVALID');
   try{textFields(g.project,['name','projectKey','status','health','currentStageKey'],'GOVERNANCE_PROJECT_FIELDS_CONTRACT_INVALID');
    readySection($('governanceSummary'));text('projectStatus',knownText(g.project.status));text('governanceStage',knownText(g.project.currentStageKey));
    const health=g.project.health;text('governanceHealth',health==null||health===''?'未知':['GREEN','AMBER','RED'].includes(health)?health:health+'（未识别）');
    $('governanceHealth').dataset.health=['GREEN','AMBER','RED'].includes(health)?health:'unknown';
    $('governanceSummary').append(make('p','来源：Governance project；治理健康不代表实时运行状态。','muted'));source.g=g.project.currentStageKey||'';
   }catch(error){source.g=null;sectionError($('governanceSummary'),error,current);}
   for(const [key,rootId,fields] of [['milestones','milestones',['displayName','milestoneKey','managementStatus','workflowStatus','plannedStart','plannedEnd']],['blockers','governanceBlockers',['blockingObjectType','blockingObjectId','reason','status','resumeCondition']],['decisions','governanceDecisions',['title','status']]]){
    if(!current())return;try{const items=collection(g,key,project.id,fields);const root=$(rootId);
     if(key==='milestones'){renderMilestones(g);continue;}
     readySection(root);if(!items.length){readState(root,'empty',key==='blockers'?'无返回的治理阻塞记录。':'无返回的治理决策记录。');continue;}
     for(const item of items){const row=make('article','','project-record');
      row.append(make('h3',key==='blockers'?knownText(item.reason,'原因未提供'):knownText(item.title,'标题未提供')));
      values(row,item,[['原状态',knownText(item.status)],...(key==='blockers'?[['恢复条件',knownText(item.resumeCondition,'未登记')],['阻塞对象引用',knownText(item.blockingObjectType)+' · '+knownText(item.blockingObjectId)]]:[])]);
      row.append(make('small',(key==='blockers'?'治理阻塞':'决策')+' ID · '+item.id,'mono'));root.append(row);
     }
    }catch(error){sectionError($(rootId),error,current);}
   }
  }catch(error){if(!current())return;source.g=null;for(const id of rootsG){if(!current())return;sectionError($(id),error,current);}}
  finally{compare();}})(),
  (async()=>{try{
   const lifecycle=await req(path+'/lifecycle');if(!current())return;validateLifecycle(lifecycle,project.id);
   readySection($('lifecycleSummary'));text('lifecycleStage',knownText(lifecycle.project.currentStageKey));text('currentStage',knownText(lifecycle.project.currentStageKey));text('workflowVersion',knownText(lifecycle.project.currentWorkflowVersion));text('stageCount',lifecycle.stages.length);
   $('lifecycleSummary').append(make('p','来源：Lifecycle project / stages；阶段执行信息独立于治理状态。','muted'));source.l=lifecycle.project.currentStageKey||'';
   const root=$('stageBlockers');readySection(root);const blocked=lifecycle.stages.filter(x=>typeof x.blockedReason==='string'&&x.blockedReason.trim());
   if(!blocked.length)readState(root,'empty','返回阶段未登记阻塞原因；不代表项目没有治理阻塞。');
   for(const stage of blocked){const row=make('article','','project-record');row.append(make('h3',knownText(stage.displayName,stage.stageKey)),make('p',stage.blockedReason),make('small','阶段实例 ID · '+stage.id,'mono'));root.append(row);}
  }catch(error){if(!current())return;source.l=null;for(const id of rootsL){if(!current())return;sectionError($(id),error,current);}}
  finally{compare();}})()
 ]);
}
const AIGC_STAGE_ORDER=Object.keys(AIGC_DOMAINS);
function verifyAigcStageStructure(project,lifecycle){
 const bindingId=value=>value===null||(typeof value==='string'&&value.length>0);
 contract(Object.hasOwn(project,'workflowTemplateId')&&bindingId(project.workflowTemplateId)&&
  record(lifecycle?.project)&&Object.hasOwn(lifecycle.project,'workflowTemplateId')&&bindingId(lifecycle.project.workflowTemplateId)&&
  Object.hasOwn(lifecycle,'template')&&(lifecycle.template===null||record(lifecycle.template))&&records(lifecycle.stages),'LIFECYCLE_BINDING_CONTRACT_INVALID');
 if(lifecycle.template!==null)contract(typeof lifecycle.template.id==='string'&&lifecycle.template.id&&
  typeof lifecycle.template.templateKey==='string'&&lifecycle.template.templateKey&&
  ['string','number'].includes(typeof lifecycle.template.version)&&String(lifecycle.template.version).length>0,'LIFECYCLE_TEMPLATE_CONTRACT_INVALID');
 contract(lifecycle.stages.every(stage=>typeof stage.stageKey==='string'&&stage.stageKey&&
  ['number','string'].includes(typeof stage.sequenceNo)&&String(stage.sequenceNo).length>0&&Number.isInteger(Number(stage.sequenceNo))),'LIFECYCLE_STAGE_CONTRACT_INVALID');
 if(project.workflowTemplateId===null&&lifecycle.project.workflowTemplateId===null&&lifecycle.template===null&&lifecycle.stages.length===0)
  return '未绑定：服务端明确返回项目未绑定工作流模板。';
 if(project.workflowTemplateId===null)return '未通过：项目与生命周期返回的工作流绑定不一致。';
 if(lifecycle?.template?.id!==project.workflowTemplateId||lifecycle?.project?.workflowTemplateId!==project.workflowTemplateId||
    lifecycle?.template?.templateKey!=='STANDARD:AIGC_CONTENT_STANDARD'||String(lifecycle?.template?.version)!=='2.4')
   return '未通过：工作流模板身份或版本与正式 AIGC V2.4 预设不一致。';
 if(!Array.isArray(lifecycle?.stages))return '未通过：真实工作流阶段未返回。';
 const stages=lifecycle.stages;
 if(stages.length!==AIGC_STAGE_ORDER.length)return '未通过：当前真实阶段 '+stages.length+'/15；不能把阶段数量当作已验收。';
 const ordered=[...stages].sort((a,b)=>Number(a.sequenceNo)-Number(b.sequenceNo));
 const valid=ordered.every((stage,i)=>stage.stageKey===AIGC_STAGE_ORDER[i]&&Number(stage.sequenceNo)===i+1);
 if(!valid)return '未通过：15 阶段的 Key、顺序或序号与正式 V2.4 工作流不一致。';
 if(project.currentStageKey&&!AIGC_STAGE_ORDER.includes(project.currentStageKey))return '未通过：项目当前阶段不在正式 15 阶段序列中。';
 return '结构通过：真实工作流 15/15，阶段 Key 和顺序一致；这不代表全部 Gate 已执行或作品已发布。';
}
function renderAigcStageCheck(project,lifecycle){
 const box=$('aigcStageCheck');
 box.hidden=project.projectType!=='AIGC_CONTENT';
 if(!box.hidden)text('aigcStageCheckResult',verifyAigcStageStructure(project,lifecycle));
}
function renderStages(v){
 const root=$('stageTable');readySection(root);const stages=[...v.stages].sort((a,b)=>a.sequenceNo-b.sequenceNo);
 text('stageCount',stages.length);
 if(!stages.length){readState(root,'empty','未返回工作流阶段记录；绑定情况以服务端模板字段为准。');return;}
 for(const s of stages){
  const row=make('article','','stage-record');row.dataset.stageInstanceId=s.id;
  const active=v.project.currentStageKey===s.stageKey;row.dataset.currentStage=String(active);
  row.append(make('h3',s.sequenceNo+' · '+knownText(s.displayName,s.stageKey)+(active?' · 当前阶段 Key':'')),make('span',knownText(s.status),'status'));
  values(row,s,[['阶段 Agent 配置',knownText(s.agentCapabilityKey,'未登记')],['Gate 策略 Key',knownText(s.gatePolicyKey,'未登记')],['阶段阻塞原因',knownText(s.blockedReason,'未登记')],['开始时间',displayTime(s.startedAt)],['完成时间',displayTime(s.completedAt)],['最近 Gate 结果引用',knownText(s.lastGateResultId,'未登记')]]);
  row.append(make('small','阶段实例 ID · '+s.id+' · Stage Key · '+s.stageKey,'mono'));root.append(row);
 }
}
function validateTransitions(items,id){
 contract(records(items)&&items.every(t=>typeof t.id==='string'&&t.id.trim()&&t.projectId===id)&&new Set(items.map(x=>x.id)).size===items.length,'TRANSITIONS_CONTRACT_INVALID');
 for(const event of items){textFields(event,['projectStageInstanceId','targetStageInstanceId','transitionType','fromStageKey','toStageKey','actorKey','createdAt','runId','taskId','gateResultId','checkpointId'],'TRANSITIONS_FIELDS_CONTRACT_INVALID');
  contract(event.attemptNo==null||(typeof event.attemptNo==='number'&&Number.isInteger(event.attemptNo)&&event.attemptNo>=0),'TRANSITIONS_ATTEMPT_CONTRACT_INVALID');
 }
}
function renderTransitions(v,lifecycle){
 const root=$('transitions');readySection(root);const items=Array.isArray(v)?v:v.items;
 if(!items.length){readState(root,'empty','本次读取范围无返回的服务端阶段变更记录。');return;}
 const stageMap=new Map(lifecycle.stages.map(s=>[s.id,s])),groups=new Map();
 for(const event of items){const source=stageMap.get(event.projectStageInstanceId),target=event.targetStageInstanceId==null?null:stageMap.get(event.targetStageInstanceId);
  const confirmed=!!source&&(event.targetStageInstanceId==null||!!target),key=confirmed?'instance:'+source.id:'unconfirmed';
  if(!groups.has(key))groups.set(key,{stage:confirmed?source:null,items:[]});groups.get(key).items.push({event,target});
 }
 for(const [key,group] of groups){
  const section=make('section','','transition-group');section.dataset.stageInstanceId=group.stage?group.stage.id:'';section.dataset.attribution=group.stage?'confirmed':'unconfirmed';
  section.append(make('h3',group.stage?'来源阶段实例 · '+knownText(group.stage.displayName,group.stage.stageKey)+' · '+group.stage.id:'归属待确认'));
  for(const {event:t,target} of group.items){
   const details=make('details','','transition-record');details.dataset.transitionId=t.id;
   details.append(make('summary',knownText(t.transitionType,'变更类型未知')+' · '+knownText(t.fromStageKey,'来源 Key 未知')+' → '+knownText(t.toStageKey,'目标 Key 未提供')+' · '+displayTime(t.createdAt)));
   values(details,t,[['变更 ID',t.id],['来源阶段实例引用',knownText(t.projectStageInstanceId,'未登记')],['目标阶段实例引用',knownText(t.targetStageInstanceId,'未登记')],['目标阶段',target?knownText(target.displayName,target.stageKey):t.targetStageInstanceId?'归属待确认':'未返回目标实例'],['操作主体',knownText(t.actorKey,'未知')],['尝试次数',t.attemptNo==null?'未知':t.attemptNo]]);
   for(const field of ['decision','evidence']){details.append(make('h4',field));details.append(t[field]==null?make('p','未返回可展示证据；不代表证据完整。','muted'):make('pre',JSON.stringify(t[field],null,2),'evidence-json'));}
   values(details,t,[['Run 引用',knownText(t.runId,'未登记')],['Runtime Task 引用',knownText(t.taskId,'未登记')],['Gate 结果引用',knownText(t.gateResultId,'未登记')],['Checkpoint 引用',knownText(t.checkpointId,'未登记')]]);
   section.append(details);
  }root.append(section);
 }
}
async function loadTransitions(projectId){
 const context=state.stageContext,route=parseRoute();
 if(!context||context.projectId!==projectId||!context.current()||route.page!=='project'||route.tab!=='stages')return;
 const {current:readCurrent}=beginRead('transitions',{projectId});
 const current=()=>state.stageContext===context&&context.current()&&readCurrent()&&parseRoute().page==='project'&&parseRoute().tab==='stages';
 const root=$('transitions');readState(root,'loading','正在读取阶段变更证据…');
 try{
  const changes=await req('/api/runtime/projects/'+encodeURIComponent(projectId)+'/stage-transitions?limit=50');if(!current())return;
  validateTransitions(Array.isArray(changes)?changes:changes?.items,projectId);renderTransitions(changes,context.lifecycle);
 }catch(error){sectionError(root,error,current,'阶段变更证据：');}
 finally{if(current()){
  root.setAttribute('aria-busy','false');
  const retry=make('button','重新读取','outline');retry.dataset.evidenceRetry='';
  retry.addEventListener('click',()=>{if(current())return loadTransitions(projectId);});root.append(retry);
 }}
}
function configureDomains(project,stages){
 const sel=$('domainSelect');clear(sel);
 const items=project.projectType==='AIGC_CONTENT'?
   Array.from(new Map((stages||[]).filter(s=>AIGC_DOMAINS[s.stageKey]).map(s=>[AIGC_DOMAINS[s.stageKey],s.displayName||s.stageKey])).entries())
   :PRODUCT_DOMAINS;
 if(project.projectType==='AIGC_CONTENT'&&!items.some(x=>x[0]==='aigc-asset-system'))items.push(['aigc-asset-system','正式资产台账']);
 for(const [path,label] of items){const opt=make('option',label);opt.value=path;sel.append(opt);}
 if(project.projectType==='AIGC_CONTENT')sel.value='aigc-asset-system';
 sel.disabled=!items.length;
}
async function loadAssetModule(id,name='aigc-asset-system'){
 const root=$('modules');clear(root);
 const request={sessionEpoch:state.sessionEpoch,workspaceId:state.workspaceId,routeVersion:state.routeVersion,nonce:++state.assetNonce,projectId:id,domain:name};
 const current=()=>{
  const route=parseRoute();
  return state.authenticated&&isCurrentAssetRead(request,{
   sessionEpoch:state.sessionEpoch,workspaceId:state.workspaceId,routeVersion:state.routeVersion,nonce:state.assetNonce,projectId:route.projectId,
   domain:$('domainSelect').value,page:route.page,tab:route.tab
  });
 };
 readState(root,'loading','正在读取服务端资产…');
 try{
  const data=await req('/api/runtime/projects/'+encodeURIComponent(id)+'/'+name);
  if(!current())return;
  contract(record(data),'ASSET_DOMAIN_CONTRACT_INVALID');
  clear(root);root.dataset.readState='ready';root.setAttribute('aria-busy','false');
  if(name!=='aigc-asset-system'){
   const box=make('pre','','mono');box.textContent=JSON.stringify(data,null,2).slice(0,12000);root.append(box);return;
  }
  contract(records(data.assets)&&data.assets.every(x=>typeof x.id==='string'&&x.id)&&records(data.versions)&&data.versions.every(x=>typeof x.id==='string'&&x.id),'ASSET_CONTRACT_INVALID');
  const assets=data.assets,versions=data.versions;
  root.append(make('h2','正式资产 · '+assets.length+' 项，版本 · '+versions.length+' 个'));
  if(!assets.length){root.append(make('p','没有服务端资产记录。','muted'));return;}
  for(const asset of assets){
   const row=links(root,urlFor(id,'assets')+'/'+encodeURIComponent(asset.id),'','asset-row');
   row.append(make('strong',asset.displayName||asset.assetKey||asset.id));
   row.append(make('span',(asset.assetType||'—')+' · '+(asset.status||'—'),'status'));
   row.append(make('small','资产 ID · '+asset.id+' · '+versions.filter(x=>x.assetId===asset.id).length+' 个版本','mono'));
   row.append(make('span','查看版本与下载 →','outline'));
  }
 }catch(e){handleReadError(e,current,root,'真实资产接口：');}
}

function renderData(g,lifecycle){
 const root=$('dataRows');clear(root);
 if(!g||!lifecycle){root.append(make('p','项目数据源不完整，不展示推测的统计数值。','muted'));return;}
 const records=[['WorkItem 总数',g.workItems?.length],['里程碑总数',g.milestones?.length],['风险总数',g.risks?.length],['阶段总数',lifecycle.stages?.length]];
 if(records.some(([,n])=>!Number.isInteger(n))){root.append(make('p','统计字段缺失，不能计算。','muted'));return;}
 values(root,g,[...records,['Runtime Task 总数','未知（尚未接入执行态任务来源）']]);
}
function renderAuditRows(v,rootId,{primary=false}={}){
 const root=$(rootId);clear(root);
 if(primary&&v?.source!=='AUDIT_LOGS_PRIMARY'){root.append(make('p','服务端原始审计数据未验证。','muted'));return;}
 const items=Array.isArray(v?.items)?v.items:[];
 if(!items.length){root.append(make('p',primary?'暂无原始审计记录。':'索引暂无记录，可能尚未重建。','muted'));return;}
 for(const e of items){
  const row=make('div','','event');row.append(make('strong',primary?e.eventType:(e.eventType||e.category)));
  row.append(make('small',(primary?e.actorKey:e.sourceType)||'—','mono'));root.append(row);
 }
}
async function loadProjectData(route,project,serial){
 const {current}=beginRead('project');
 state.selected=route.projectId;
 text('projectTitle',project.name||project.projectKey);
 text('projectMeta',(project.projectKey||'—')+' · '+projectType(project)+' · '+project.id);
 text('projectHeaderState','项目目录：'+knownText(project.status,'状态未提供')+' · 当前阶段 '+knownText(project.currentStageKey));
 text('projectStatus',project.status);text('currentStage',project.currentStageKey);
 text('workflowVersion',project.currentWorkflowVersion);
 showTab(route.tab,project.id);
 const pane={overview:['governanceSummary','lifecycleSummary','sourceComparison','governanceBlockers','stageBlockers','governanceDecisions','milestones'],tasks:['taskRows','planDependencies'],data:['dataRows'],
   assets:['modules'],stages:['stageTable','transitions'],audit:['liveAuditRows','auditRows']}[route.tab]||[];
 for(const id of pane)readState($(id),'loading','正在读取服务端数据…');
 if(route.tab==='assets'){clear($('domainSelect'));$('domainSelect').disabled=true;}
 text('stageCount','—');
 $('aigcStageCheck').hidden=route.tab!=='stages'||project.projectType!=='AIGC_CONTENT';
 text('aigcStageCheckResult',route.tab==='stages'?'正在读取正式工作流，结构尚未核验。':'');
 const path='/api/runtime/projects/'+encodeURIComponent(project.id);
 if(route.tab==='overview'){
  for(const id of ['projectStatus','currentStage','workflowVersion','governanceHealth','governanceStage','lifecycleStage'])text(id,'未知');
  $('overviewPlanLink').href=urlFor(project.id,'tasks');$('overviewStagesLink').href=urlFor(project.id,'stages');
  await loadOverview(project,current);return;
 }
 if(route.tab==='tasks'){
  try{const g=await req(path+'/governance');if(!current())return;validatePlan(g,project.id);renderTasks(g,project.id);}
  catch(error){for(const id of pane){if(!current())return;sectionError($(id),error,current);}}
  return;
 }
 if(route.tab==='stages'){
  state.stageContext=null;
  try{
   const lifecycle=await req(path+'/lifecycle');if(!current())return;validateLifecycle(lifecycle,project.id);
   renderAigcStageCheck(project,lifecycle);renderStages(lifecycle);
   state.stageContext={projectId:project.id,lifecycle,current};await loadTransitions(project.id);
  }catch(error){
   if(!current())return;state.stageContext=null;sectionError($('stageTable'),error,current);
   if(!current())return;
   readState($('transitions'),'unavailable','阶段主体不可用，未读取阶段变更证据。');text('aigcStageCheckResult','结构尚未核验：'+readMessage(error));
  }
  return;
 }
 try{
  let gov,lifecycle;
  if(['overview','tasks','data','stages','assets'].includes(route.tab)){
   const jobs=[];
   if(route.tab==='data')jobs.push(req(path+'/governance').then(x=>gov=x));
   if(['data','assets'].includes(route.tab))jobs.push(req(path+'/lifecycle').then(x=>lifecycle=x));
   await Promise.all(jobs);
  }
  if(!current())return;
  if(gov!==undefined){
   contract(record(gov),'GOVERNANCE_CONTRACT_INVALID');
   for(const key of route.tab==='tasks'?['workItems']:route.tab==='overview'?['milestones']:['workItems','milestones','risks'])
    contract(records(gov[key])&&(key!=='workItems'||gov[key].every(x=>typeof x.id==='string'&&x.id)),'GOVERNANCE_'+key.toUpperCase()+'_CONTRACT_INVALID');
  }
  if(lifecycle!==undefined)contract(record(lifecycle)&&records(lifecycle.stages),'LIFECYCLE_CONTRACT_INVALID');
  if(route.tab==='data'){renderData(gov,lifecycle);return;}
  if(route.tab==='assets'){
   configureDomains(project,lifecycle.stages);
   if(!$('domainSelect').disabled)await loadAssetModule(project.id,$('domainSelect').value);
   else readState($('modules'),'empty','没有可以读取的项目资产领域。');
   return;
  }
  if(route.tab==='audit'){
   const result=await Promise.allSettled([
    req(path+'/audit-events?limit=50'),
    req('/api/runtime/workspaces/'+encodeURIComponent(state.workspaceId)+'/audit-evidence?projectId='+encodeURIComponent(project.id)+'&limit=50')
   ]);
   if(!current())return;
   for(const [index,rootId] of ['liveAuditRows','auditRows'].entries()){
    if(!current())return;
    try{
     if(result[index].status==='rejected')throw result[index].reason;
     const data=result[index].value;
     contract(record(data)&&records(data.items)&&(index!==0||data.source==='AUDIT_LOGS_PRIMARY'),'AUDIT_CONTRACT_INVALID');
     renderAuditRows(data,rootId,{primary:index===0});
    }catch(e){handleReadError(e,current,$(rootId),index===0?'原始审计：':'工作空间审计索引：');}
   }
  }
 }catch(e){
  if(current()&&e.kind==='abort'){for(const id of pane)readState($(id),'idle',readMessage(e));if(route.tab==='stages')text('aigcStageCheckResult','结构尚未核验：'+readMessage(e));return;}
  if(!handleReadError(e,current,null))return;
  for(const id of pane)readState($(id),'error',readMessage(e));
  if(route.tab==='stages')text('aigcStageCheckResult','结构尚未核验：'+readMessage(e));
 }finally{
  if(current()&&route.tab!=='assets')for(const id of pane){const root=$(id);if(root.dataset.readState==='loading')root.dataset.readState='ready';root.setAttribute('aria-busy','false');}
 }
}
async function loadDetail(route,project,serial){
 const {current}=beginRead('detail');
 const id=route.projectId,path='/api/runtime/projects/'+encodeURIComponent(id);
 $('detailBack').href=urlFor(id,route.kind);
 const root=$('detailRows');root.dataset.detailKind=route.kind;readState(root,'loading','正在读取详情…');
 text('detailTitle','读取中');text('detailMeta','');
 text('detailCategory',route.kind==='tasks'?'WorkItem 详情':'资产详情');
 try{
  if(route.kind==='tasks'){
   const g=await req(path+'/governance');if(!current())return;
   validatePlan(g,id);
   const item=g.workItems.find(x=>x.id===route.objectId);
   if(!item){text('detailTitle','WorkItem 未找到');readState(root,'not-found','当前项目未返回这一 WorkItem。');return;}
   clear(root);text('detailTitle',item.title||item.itemKey);text('detailMeta',(item.itemKey||'—')+' · '+(project.name||project.projectKey));
   values(root,item,[['WorkItem ID',item.id],['WorkItem 类型',item.itemType],['状态',item.status],['优先级',item.priority],['阶段 Key',item.stageKey],['里程碑 ID',item.milestoneId],['迭代 ID',item.iterationId],['Runtime Task / Run 关联','未知（尚无可验证的执行态关联来源）']]);
   appendPlanContext(root,g,item);const dependencies=make('section');root.append(make('h2','此 WorkItem 的正式依赖'),dependencies);renderDependencies(g,id,dependencies,item.id);
   root.append(make('p','来源：Governance workItems / project_work_items。itemType=TASK 仍表示 WorkItem；stageKey 仅表示阶段归属，不证明存在 Runtime Task 或 Run。','muted'));
  }else{
   contract(project.projectType==='AIGC_CONTENT','ASSET_BACKEND_NOT_AVAILABLE_FOR_PROJECT_TYPE');
   const data=await req(path+'/aigc-asset-system');if(!current())return;
   contract(record(data)&&records(data.assets)&&data.assets.every(x=>typeof x.id==='string'&&x.id)&&records(data.versions)&&data.versions.every(x=>typeof x.id==='string'&&x.id),'ASSET_CONTRACT_INVALID');
   const item=data.assets.find(x=>x.id===route.objectId);
   if(!item){text('detailTitle','资产未找到');readState(root,'not-found','当前项目未返回这一资产。');return;}
   clear(root);text('detailTitle',item.displayName||item.assetKey);
   text('detailMeta',(item.assetType||'—')+' · '+(project.name||project.projectKey));
   values(root,item,[['资产 ID',item.id],['资产 Key',item.assetKey],['类型',item.assetType],['状态',item.status],['所属项目',item.ownerProjectId]]);
   const versions=data.versions.filter(v=>v.assetId===item.id).sort((a,b)=>(b.versionNo||0)-(a.versionNo||0));
   root.append(make('h2','正式版本'));
   if(!versions.length)root.append(make('p','尚无服务端版本记录。','muted'));
   for(const v of versions){
    const locator=v.contentLocator||{};
    const source=locator.libraryFileId||locator.fileId||locator.artifactId||locator.library_file_id||locator.file_id||locator.artifact_id;
    const box=make('div','','event');
    box.append(make('strong','v'+v.versionNo+' · '+v.state));
    box.append(make('span',locator.provider==='S3_COMPATIBLE'&&locator.objectKey?'已登记受控文件，待校验授权':source?'已登记源引用，待授权解析':'文件引用未登记','status'));
    box.append(make('small','版本 ID · '+v.id,'mono'));
    if(locator.provider==='S3_COMPATIBLE'&&locator.objectKey){
      const status=make('span','尚未校验当前权限','muted');
      const verify=make('button','验证并获取下载入口','outline');
      let inFlight=false,nonce=0,download=null;
      verify.addEventListener('click',async()=>{
        if(!current()||inFlight)return;
        const attempt=++nonce,active=()=>current()&&attempt===nonce;
        inFlight=true;verify.disabled=true;status.textContent='正在验证 Runtime 文件权限…';
        if(download){download.remove();download=null;}
        const url=path+'/assets/'+encodeURIComponent(item.id)+'/versions/'+encodeURIComponent(v.id);
        try{
          const authorization=await req(url+'/access');if(!active())return;
          contract(record(authorization)&&authorization.access==='READY'&&authorization.versionId===v.id&&
             authorization.contentPath===url+'/content','FILE_ACCESS_CONTRACT_INVALID');
          download=make('a','下载已授权文件','outline');
          download.href=url+'/content';download.download='';download.rel='noopener';
          box.append(download);status.textContent='已确认访问许可；下载时将再次校验权限和 SHA-256';
        }catch(e){
          if(active()&&e.kind==='abort'){status.textContent=readMessage(e);return;}
          if(!handleReadError(e,active,null))return;
          status.textContent='暂不可打开：'+readMessage(e)+' 未生成下载链接，可重试。';
        }finally{
          if(active()){inFlight=false;verify.disabled=false;verify.textContent=download?'重新验证下载权限':'验证并获取下载入口';}
        }
      });
      box.append(verify,status);
    }else box.append(make('span','该版本尚未迁入受控对象存储','muted'));
    root.append(box);
   }
   root.append(make('p','仅能下载已经迁入受控对象存储、通过权利与 QA 检查的版本；历史 ChatGPT Library / 外部文档仍待授权适配。','muted'));
  }
 }catch(e){if(current()&&e.kind==='abort'){text('detailTitle','详情读取已取消');text('detailMeta','');}if(handleReadError(e,current,root,'详情：')){text('detailTitle','详情暂不可用');text('detailMeta','');}}
 finally{if(current()){if(root.dataset.readState==='loading')root.dataset.readState='ready';root.setAttribute('aria-busy','false');}}
}
async function renderRoute(){
 const serial=++state.routeVersion,route=parseRoute();
 setActiveNav(route);warn('');clearProjectContent();
 // Remove detached headers and authorized links on every navigation, including Back.
 clear($('detailRows'));text('detailTitle','');text('detailMeta','');
 if($('createDialog').open)$('createDialog').close();
 if(!state.authenticated)return;
 if(state.workspaceRead.status==='loading'||state.workspaceRead.status==='idle'){await loadCatalogs();return;}
 if(state.workspaceRead.status==='ready'&&['idle','loading'].includes(state.projectRead.status)){await loadProjects();return;}
 if(['error','cancelled'].includes(state.workspaceRead.status)||['error','cancelled'].includes(state.projectRead.status)){setScreen('catalogScreen');renderCatalog();return;}
 if(route.page==='not-found'){navigate('/projects',{replace:true});return;}
 if(route.page==='projects'){setScreen('catalogScreen');state.selected=null;renderCatalog();return;}
 if(route.page==='capabilities'){setScreen('capabilityScreen');await renderCapability();return;}
 if(route.page==='knowledge'){setScreen('knowledgeScreen');await renderKnowledge();return;}
 const project=state.projects.find(p=>p.id===route.projectId);
 if(!project){
  setScreen('catalogScreen');renderCatalog();warn('项目不存在或当前工作空间无权访问该项目。');
  return;
 }
 if(route.page==='project'){setScreen('projectScreen');await loadProjectData(route,project,serial);}
 else{setScreen('detailScreen');await loadDetail(route,project,serial);}
}
$('workspaceSelect').addEventListener('change',async event=>{
 state.workspaceId=event.target.value;state.selected=null;state.projects=[];state.projectRead={status:'loading'};state.presets=[];state.presetRead={status:'idle'};
 ++state.routeVersion;clearProjectContent(); // invalidate in-flight lifecycle/asset/audit reads of old workspace
 if(parseRoute().page!=='projects')history.pushState(null,'','/projects');
 setScreen('catalogScreen');clear($('detailRows'));text('detailTitle','');text('detailMeta','');renderCatalog(); // clear old workspace cards before any new HTTP result
 await loadProjects();
});
$('refresh').addEventListener('click',()=>['error','cancelled'].includes(state.workspaceRead.status)?loadCatalogs():loadProjects());
async function refreshProject(){if(!state.authenticated)return;await loadProjects();}
$('refreshProject').addEventListener('click',()=>refreshProject());
$('knowledgeProject').addEventListener('change',event=>{event.target.dataset.last=event.target.value;loadKnowledgeBinding(event.target.value);});
$('domainSelect').addEventListener('change',event=>{const project=state.projects.find(p=>p.id===state.selected);if(project)loadAssetModule(project.id,event.target.value);});
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{
 state.type=button.dataset.type;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===button));renderCatalog();
}));
$('newProject').addEventListener('click',async()=>{
 if(!state.writesEnabled)return;
 invalidateDialog('create');
 const version=state.dialogVersions.create,{current:readCurrent}=beginRead('create-dialog');
 const current=()=>readCurrent()&&version===state.dialogVersions.create;
 const el=$('createPreset');clear(el);const first=make('option','不自动绑定');first.value='';el.append(first);
 text('createError','正在读取可用工作流预设…');el.disabled=true;$('createDialog').showModal();
 await loadPresets();
 if(!current()||!$('createDialog').open)return;
 el.disabled=false;
 text('createError',state.presetRead.status==='error'?'工作流预设不可用：'+readMessage(state.presetRead.error):state.presetRead.status==='cancelled'?readMessage(state.presetRead.error):'');
 const selected=$('createType').value;
 for(const preset of state.presets.filter(x=>x.projectTypeKey===selected&&x.status==='ACTIVE')){
  const option=make('option',preset.displayName||preset.presetKey);option.value=preset.presetKey;el.append(option);
 }
});
$('closeDialog').addEventListener('click',()=>closeDialog('create'));
$('createDialog').addEventListener('close',()=>{
 if($('createDialog').open)return;
 settleDialogClose('create');
 state.readNonces['create-dialog']=(state.readNonces['create-dialog']||0)+1;state.readNonces.presets=(state.readNonces.presets||0)+1;
 if(state.presetRead.status==='loading')state.presetRead={status:'idle'};
});
$('createForm').addEventListener('submit',async event=>{
 event.preventDefault();
 if(state.formPending.create||!$('createDialog').open||!state.writesEnabled)return;
 text('createError','');
 if(!state.workspaceId){text('createError','没有真实工作空间');return;}
 const version=state.dialogVersions.create,{current:readCurrent}=beginRead('create-project');
 const current=()=>readCurrent()&&version===state.dialogVersions.create&&$('createDialog').open;
 state.formPending.create={version};$('createSubmit').disabled=true;
 const body={workspaceId:state.workspaceId,projectKey:$('createKey').value.trim(),name:$('createName').value.trim(),projectType:$('createType').value};
 if($('createPreset').value)body.domainPresetKey=$('createPreset').value;
 try{
  const result=await req('/api/runtime/projects',{method:'POST',body:JSON.stringify(body)});
  if(!current())return;
  contract(record(result)&&typeof result.id==='string'&&new RegExp('^'+validId+'$').test(result.id),'PROJECT_CREATE_RESPONSE_MISSING_ID');
  delete state.formPending.create;$('createDialog').close();$('createForm').reset();
  history.pushState(null,'',urlFor(result.id));await loadProjects();
 }catch(e){
  if(current()&&mutationUncertain(e))text('createError',readMessage(e)+' '+mutationUncertainMessage);
  else if(handleReadError(e,current,null))text('createError',readMessage(e));
 }finally{if(current()){delete state.formPending.create;$('createSubmit').disabled=false;}}
});
if(location.pathname==='/')history.replaceState(null,'','/projects');
void bootstrap();
