// AI Native M31: distinct addressable screens. No client-side business data persistence.
const $=id=>document.getElementById(id);
const state={workspaces:[],projects:[],presets:[],selected:null,workspaceId:null,type:'',writesEnabled:false,routeVersion:0,viewCache:null};
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
async function req(path,opts={}){
 const result=await fetch(path,{credentials:'same-origin',...opts,headers:{...(opts.body?{'content-type':'application/json'}:{}),...opts.headers}});
 let payload;try{payload=await result.json();}catch{throw Error('SERVER_NON_JSON_RESPONSE');}
 if(!result.ok)throw Error(payload?.error||'HTTP_'+result.status);
 return Object.hasOwn(payload,'data')?payload.data:payload;
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
 const shared=$('loginMode').value==='shared';
 text('loginSecretLabel',shared?'预发共享访问密码':'Runtime 受限凭据');
 text('loginHint',shared?'预发验证模式只有读取权限。':'凭据仅用于 HTTPS 登录，不存入浏览器，之后使用 HttpOnly 会话。');
 $('password').value='';
}
$('loginMode').addEventListener('change',loginMode);
$('loginForm').addEventListener('submit',async event=>{
 event.preventDefault();text('loginError','');
 const key=$('loginMode').value==='shared'?'password':'credential';
 try{await req('/auth/login',{method:'POST',body:JSON.stringify({[key]:$('password').value})});$('password').value='';await bootstrap();}
 catch(e){$('password').value='';text('loginError','登录失败：'+e.message);}
});
$('logout').addEventListener('click',async()=>{
 await req('/auth/logout',{method:'POST',body:'{}'});
 state.projects=[];state.workspaces=[];state.selected=null;await bootstrap();
});
async function bootstrap(){
 const session=await req('/auth/session');
 const shared=$('loginMode').querySelector('option[value="shared"]');shared.hidden=!session.sharedLoginEnabled;
 if(!session.sharedLoginEnabled&&$('loginMode').value==='shared')$('loginMode').value='scoped';
 loginMode();
 if(!session.authenticated){
  $('login').hidden=false;$('workspace').hidden=true;$('logout').hidden=true;return;
 }
 state.writesEnabled=!!session.writesEnabled;
 $('login').hidden=true;$('workspace').hidden=false;$('logout').hidden=false;
 $('newProject').disabled=!state.writesEnabled;
 $('newProject').title=state.writesEnabled?'在预发环境创建真实项目':'需要受限写入权限，当前预发写入关闭';
 await loadCatalogs();
}
async function loadCatalogs(){
 try{
  const workspaces=await req('/api/runtime/workspaces');
  if(!Array.isArray(workspaces))throw Error('WORKSPACE_CONTRACT_INVALID');
  state.workspaces=workspaces;
  clear($('workspaceSelect'));
  for(const w of state.workspaces){const option=make('option',w.name||w.workspaceKey||w.id);option.value=w.id;$('workspaceSelect').append(option);}
  state.workspaceId=state.workspaces.some(x=>x.id===state.workspaceId)?state.workspaceId:state.workspaces[0]?.id||null;
  if(state.workspaceId)$('workspaceSelect').value=state.workspaceId;
  state.presets=[];
  // Optional administrator catalogue must not block ordinary read-only users.
  req('/api/runtime/domain-presets').then(v=>{state.presets=Array.isArray(v)?v:(v?.items||[]);}).catch(()=>{});
  await loadProjects();
 }catch(e){state.projects=[];warn('工作空间读取失败：'+e.message+'；不会补造项目。');await renderRoute();}
}
async function loadProjects(){
 if(!state.workspaceId){state.projects=[];await renderRoute();return;}
 try{
  const items=[];let offset=0,total=0;
  do{
   const page=await req('/api/runtime/projects?workspaceId='+encodeURIComponent(state.workspaceId)+'&offset='+offset+'&limit=100');
   if(!Array.isArray(page?.items)||!Number.isInteger(page.total))throw Error('PROJECT_LIST_CONTRACT_INVALID');
   total=page.total;items.push(...page.items);offset+=page.items.length;
   if(items.length>1000)throw Error('PROJECT_LIST_LIMIT_EXCEEDED');
   if(!page.items.length)break;
  }while(offset<total);
  state.projects=items;state.viewCache=null;await renderRoute();
 }catch(e){state.projects=[];warn('真实项目查询失败：'+e.message);await renderRoute();}
}
function renderCatalog(){
 const root=$('projectList');clear(root);
 const items=state.projects.filter(p=>!state.type||p.projectType===state.type);
 if(!items.length){root.append(make('p','当前筛选范围没有真实项目。','empty'));return;}
 for(const p of items){
  const card=links(root,urlFor(p.id),'','portfolio-card');
  card.replaceChildren(make('strong',p.name||p.projectKey),make('span',projectType(p)+' · '+(p.status||'—'),'muted'));
  card.append(make('small','项目 ID · '+p.id,'mono'),make('span','进入项目 →','entry-arrow'));
 }
}
async function renderCapability(){
 const root=$('capabilityRows');clear(root);
 try{
  const arr=await req('/api/runtime/capabilities');
  if(!Array.isArray(arr))throw Error('CAPABILITY_CONTRACT_INVALID');
  if(!arr.length){root.append(make('p','Runtime 能力注册表暂无记录。','muted'));return;}
  for(const entry of arr){
   const row=make('div','','event');
   const name=entry.displayName||entry.name||entry.capabilityKey||entry.key||entry.id;
   row.append(make('strong',name||'未命名能力'),make('span',entry.capabilityType||entry.type||entry.status||'—','mono'));root.append(row);
  }
 }catch(e){
  root.append(make('p','尚不能读取正式能力池：'+e.message+'。此接口由 Runtime 管理员授权，未用模拟资源替代。','muted'));
 }
}
async function renderKnowledge(){
 const select=$('knowledgeProject');const root=$('knowledgeRows');clear(select);clear(root);
 for(const p of state.projects){const option=make('option',p.name||p.projectKey);option.value=p.id;select.append(option);}
 if(!state.projects.length){root.append(make('p','当前没有可读取的项目知识源绑定。','muted'));return;}
 const route=select.dataset.last;
 if(route&&state.projects.some(p=>p.id===route))select.value=route;
 await loadKnowledgeBinding(select.value);
}
async function loadKnowledgeBinding(id){
 const root=$('knowledgeRows');clear(root);
 if(!id)return;
 try{
  const items=await req('/api/runtime/projects/'+encodeURIComponent(id)+'/knowledge-bindings');
  if(!Array.isArray(items))throw Error('KNOWLEDGE_BINDING_CONTRACT_INVALID');
  if(!items.length){root.append(make('p','该项目未绑定知识源。全局文件浏览和授权打开仍未接通。','muted'));return;}
  for(const it of items){
   const row=make('div','','event'),info=make('div');
   info.append(make('strong',it.bindingKey||it.sourceKey));
   info.append(make('p',[it.sourceKey,it.provider,it.sourceType].filter(Boolean).join(' · '),'mono'));
   row.append(info,make('span',it.status||'—','status'));root.append(row);
  }
 }catch(e){root.append(make('p','知识源绑定读取受阻：'+e.message,'muted'));}
}
const values=(root,obj,fields)=>{
 for(const [key,value] of fields){
  const row=make('div','','event');row.append(make('strong',key),make('span',value??'—','mono'));root.append(row);
 }
};
function renderMilestones(g){
 const root=$('milestones');clear(root);const ms=Array.isArray(g?.milestones)?g.milestones:[];
 if(!ms.length){root.append(make('p','暂无正式里程碑记录。','muted'));return;}
 for(const m of ms){
  const row=make('div','','event');row.append(make('strong',m.displayName||m.milestoneKey),make('span',(m.managementStatus||m.workflowStatus||'—')+' · '+m.progressPercent+'%','status'));root.append(row);
 }
}
function renderTasks(g,id){
 const root=$('taskRows');clear(root);const items=Array.isArray(g?.workItems)?g.workItems:[];
 if(!items.length){root.append(make('p','该项目没有服务端任务记录。','muted'));return;}
 for(const task of items){
  const row=links(root,urlFor(id,'tasks')+'/'+encodeURIComponent(task.id),'','task-row');
  row.append(make('strong',task.title||task.itemKey),make('span',(task.priority||'—')+' · '+(task.status||'—'),'status'));
  row.append(make('small','任务 ID · '+task.id,'mono'));
 }
}
const AIGC_STAGE_ORDER=Object.keys(AIGC_DOMAINS);
function verifyAigcStageStructure(project,lifecycle){
 if(!project.workflowTemplateId)return '未通过：项目尚未绑定正式工作流模板。';
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
 const root=$('stageTable');clear(root);
 const stages=Array.isArray(v?.stages)?v.stages:[];
 text('stageCount',stages.length);
 if(!stages.length){root.append(make('p','尚未绑定可读取的工作流阶段。','muted'));return;}
 for(const s of stages){
  const row=make('div','','gridrow');
  row.append(make('small',String(s.sequenceNo??'—')),make('strong',s.displayName||s.stageKey),make('span',s.status||'—','status'));
  row.append(make('span',s.lastGateResultId?'Gate '+String(s.lastGateResultId):'尚无 Gate 证据','mono'));root.append(row);
 }
}
function renderTransitions(v){
 const root=$('transitions');clear(root);const items=Array.isArray(v)?v:(v?.items||[]);
 if(!items.length){root.append(make('p','暂无服务端阶段变更记录。','muted'));return;}
 for(const t of items){
  const row=make('div','','event');row.append(make('strong',(t.fromStageKey||'—')+' → '+(t.toStageKey||'—')));
  row.append(make('small',t.createdAt||t.gateResultId||'—','mono'));root.append(row);
 }
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
 try{
  const data=await req('/api/runtime/projects/'+encodeURIComponent(id)+'/'+name);
  if(name!=='aigc-asset-system'){
   const box=make('pre','','mono');box.textContent=JSON.stringify(data,null,2).slice(0,12000);root.append(box);return;
  }
  const assets=Array.isArray(data?.assets)?data.assets:[];
  const versions=Array.isArray(data?.versions)?data.versions:[];
  root.append(make('h2','正式资产 · '+assets.length+' 项，版本 · '+versions.length+' 个'));
  if(!assets.length){root.append(make('p','没有服务端资产记录。','muted'));return;}
  for(const asset of assets){
   const row=links(root,urlFor(id,'assets')+'/'+encodeURIComponent(asset.id),'','asset-row');
   row.append(make('strong',asset.displayName||asset.assetKey||asset.id));
   row.append(make('span',(asset.assetType||'—')+' · '+(asset.status||'—'),'status'));
   row.append(make('small','资产 ID · '+asset.id+' · '+versions.filter(x=>x.assetId===asset.id).length+' 个版本','mono'));
  }
 }catch(e){root.append(make('p','真实资产接口不可用：'+e.message,'muted'));}
}
function renderData(g,lifecycle){
 const root=$('dataRows');clear(root);
 if(!g||!lifecycle){root.append(make('p','项目数据源不完整，不展示推测的统计数值。','muted'));return;}
 const records=[['任务总数',g.workItems?.length],['里程碑总数',g.milestones?.length],['风险总数',g.risks?.length],['阶段总数',lifecycle.stages?.length]];
 if(records.some(([,n])=>!Number.isInteger(n))){root.append(make('p','统计字段缺失，不能计算。','muted'));return;}
 values(root,g,records);
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
 state.selected=route.projectId;
 text('projectTitle',project.name||project.projectKey);
 text('projectMeta',(project.projectKey||'—')+' · '+projectType(project)+' · '+project.id);
 text('projectStatus',project.status);text('currentStage',project.currentStageKey);
 text('workflowVersion',project.currentWorkflowVersion);
 showTab(route.tab,project.id);
 const path='/api/runtime/projects/'+encodeURIComponent(project.id);
 try{
  let gov,lifecycle;
  if(['overview','tasks','data','stages','assets'].includes(route.tab)){
   const jobs=[];
   if(['overview','tasks','data'].includes(route.tab))jobs.push(req(path+'/governance').then(x=>gov=x));
   if(['overview','stages','data','assets'].includes(route.tab))jobs.push(req(path+'/lifecycle').then(x=>lifecycle=x));
   await Promise.all(jobs);
  }
  if(serial!==state.routeVersion)return;
  if(route.tab==='overview'){renderMilestones(gov);text('stageCount',lifecycle?.stages?.length);return;}
  if(route.tab==='tasks'){renderTasks(gov,project.id);return;}
  if(route.tab==='data'){renderData(gov,lifecycle);return;}
  if(route.tab==='stages'){
   renderStages(lifecycle);
   renderAigcStageCheck(project,lifecycle);
   const changes=await req(path+'/stage-transitions?limit=50');
   if(serial===state.routeVersion)renderTransitions(changes);
   return;
  }
  if(route.tab==='assets'){
   configureDomains(project,lifecycle?.stages);
   if(!$('domainSelect').disabled)await loadAssetModule(project.id,$('domainSelect').value);
   else{clear($('modules'));$('modules').append(make('p','没有可以读取的项目资产领域。','muted'));}
   return;
  }
  if(route.tab==='audit'){
   const result=await Promise.allSettled([
    req(path+'/audit-events?limit=50'),
    req('/api/runtime/workspaces/'+encodeURIComponent(state.workspaceId)+'/audit-evidence?projectId='+encodeURIComponent(project.id)+'&limit=50')
   ]);
   if(serial!==state.routeVersion)return;
   if(result[0].status==='fulfilled')renderAuditRows(result[0].value,'liveAuditRows',{primary:true});
   else warn('原始审计读取失败：'+result[0].reason.message);
   if(result[1].status==='fulfilled')renderAuditRows(result[1].value,'auditRows');
   else $('auditRows').replaceChildren(make('p','索引接口不可用：'+result[1].reason.message,'muted'));
  }
 }catch(e){if(serial===state.routeVersion)warn('当前页面真实接口读取失败：'+e.message);}
}
async function loadDetail(route,project,serial){
 const id=route.projectId,path='/api/runtime/projects/'+encodeURIComponent(id);
 const back=urlFor(id,route.kind);$('detailBack').href=back;
 const root=$('detailRows');clear(root);
 text('detailCategory',route.kind==='tasks'?'任务详情':'资产详情');
 try{
  if(route.kind==='tasks'){
   const g=await req(path+'/governance');if(serial!==state.routeVersion)return;
   const item=(g.workItems||[]).find(x=>x.id===route.objectId);
   if(!item){text('detailTitle','任务未找到');root.append(make('p','当前项目不存在这一任务，或已无法读取。','muted'));return;}
   text('detailTitle',item.title||item.itemKey);
   text('detailMeta',item.itemKey+' · '+project.name);
   values(root,item,[['任务 ID',item.id],['任务类型',item.itemType],['状态',item.status],['优先级',item.priority],['阶段',item.stageKey],['里程碑 ID',item.milestoneId],['迭代 ID',item.iterationId]]);
  }else{
   if(project.projectType!=='AIGC_CONTENT')throw Error('ASSET_BACKEND_NOT_AVAILABLE_FOR_PROJECT_TYPE');
   const data=await req(path+'/aigc-asset-system');if(serial!==state.routeVersion)return;
   const item=(data.assets||[]).find(x=>x.id===route.objectId);
   if(!item){text('detailTitle','资产未找到');root.append(make('p','当前项目不存在这一资产，或没有访问权限。','muted'));return;}
   text('detailTitle',item.displayName||item.assetKey);
   text('detailMeta',(item.assetType||'—')+' · '+project.name);
   values(root,item,[['资产 ID',item.id],['资产 Key',item.assetKey],['类型',item.assetType],['状态',item.status],['所属项目',item.ownerProjectId]]);
   const versions=(data.versions||[]).filter(v=>v.assetId===item.id).sort((a,b)=>(b.versionNo||0)-(a.versionNo||0));
   root.append(make('h2','正式版本'));
   if(!versions.length)root.append(make('p','尚无服务端版本记录。','muted'));
   for(const v of versions){
    const locator=v.contentLocator||{};
    const source=locator.libraryFileId||locator.fileId||locator.artifactId||locator.library_file_id||locator.file_id||locator.artifact_id;
    const box=make('div','','event');
    box.append(make('strong','v'+v.versionNo+' · '+v.state));
    box.append(make('span',source?'已登记源引用，待授权解析':'文件引用未登记','status'));
    box.append(make('small','版本 ID · '+v.id,'mono'));
    if(locator.provider==='S3_COMPATIBLE'&&locator.objectKey){
      const status=make('span','尚未校验当前权限','muted');
      const verify=make('button','验证文件授权','outline');
      verify.addEventListener('click',async()=>{
        status.textContent='正在验证 Runtime 文件权限…';
        verify.disabled=true;
        const url=path+'/assets/'+encodeURIComponent(item.id)+'/versions/'+encodeURIComponent(v.id);
        try{
          const authorization=await req(url+'/access');
          if(authorization.access!=='READY'||authorization.versionId!==v.id||
             authorization.contentPath!==url+'/content')throw Error('FILE_ACCESS_CONTRACT_INVALID');
          const download=make('a','下载已授权文件','outline');
          download.href=url+'/content';download.download='';download.rel='noopener';
          box.append(download);
          status.textContent='已确认访问许可；下载时将再次校验权限和 SHA-256';
        }catch(e){
          status.textContent='暂不可打开：'+e.message+'。未生成下载链接。';
        }
      });
      box.append(verify,status);
    }else{
      box.append(make('span','该版本尚未迁入受控对象存储','muted'));
    }
    root.append(box);
   }
   root.append(make('p','仅能下载已经迁入受控对象存储、通过权利与 QA 检查的版本；历史 ChatGPT Library / 外部文档仍待授权适配。','muted'));
  }
 }catch(e){if(serial===state.routeVersion)root.append(make('p','详情读取失败：'+e.message,'muted'));}
}
async function renderRoute(){
 const serial=++state.routeVersion,route=parseRoute();
 setActiveNav(route);warn('');
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
 state.workspaceId=event.target.value;state.selected=null;
 if(parseRoute().page!=='projects')history.pushState(null,'','/projects');
 await loadProjects();
});
$('refresh').addEventListener('click',()=>loadProjects());
$('refreshProject').addEventListener('click',()=>renderRoute());
$('knowledgeProject').addEventListener('change',event=>{event.target.dataset.last=event.target.value;loadKnowledgeBinding(event.target.value);});
$('domainSelect').addEventListener('change',event=>{const project=state.projects.find(p=>p.id===state.selected);if(project)loadAssetModule(project.id,event.target.value);});
document.querySelectorAll('.filter').forEach(button=>button.addEventListener('click',()=>{
 state.type=button.dataset.type;document.querySelectorAll('.filter').forEach(b=>b.classList.toggle('active',b===button));renderCatalog();
}));
$('newProject').addEventListener('click',()=>{
 if(!state.writesEnabled)return;
 const el=$('createPreset');clear(el);const first=make('option','不自动绑定');first.value='';el.append(first);
 const selected=$('createType').value;
 for(const preset of state.presets.filter(x=>x.projectTypeKey===selected&&x.status==='ACTIVE')){
  const option=make('option',preset.displayName||preset.presetKey);option.value=preset.presetKey;el.append(option);
 }
 $('createDialog').showModal();
});
$('closeDialog').addEventListener('click',()=>$('createDialog').close());
$('createForm').addEventListener('submit',async event=>{
 event.preventDefault();text('createError','');
 if(!state.workspaceId){text('createError','没有真实工作空间');return;}
 const body={workspaceId:state.workspaceId,projectKey:$('createKey').value.trim(),name:$('createName').value.trim(),projectType:$('createType').value};
 if($('createPreset').value)body.domainPresetKey=$('createPreset').value;
 try{
  const result=await req('/api/runtime/projects',{method:'POST',body:JSON.stringify(body)});
  if(!result?.id)throw Error('PROJECT_CREATE_RESPONSE_MISSING_ID');
  $('createDialog').close();$('createForm').reset();
  history.pushState(null,'',urlFor(result.id));await loadProjects();
 }catch(e){text('createError',e.message);}
});
if(location.pathname==='/')history.replaceState(null,'','/projects');
bootstrap().catch(e=>warn('启动失败：'+e.message));
