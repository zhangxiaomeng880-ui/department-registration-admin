const $=id=>document.getElementById(id);
const state={workspaces:[],projects:[],presets:[],modules:[],type:'',selected:null,workspaceId:null,writesEnabled:false,version:0};
const AIGC_DOMAINS={
 'AIGC_00_INIT':'aigc-foundation','AIGC_01_DISCOVERY':'aigc-foundation','AIGC_02_PLAN':'aigc-foundation',
 'AIGC_03_SCRIPT':'aigc-script-domain','AIGC_04_BREAKDOWN':'aigc-breakdown',
 'AIGC_05_FORMAT':'aigc-format-strategy','AIGC_06_ASSET':'aigc-asset-system',
 'AIGC_07_IMAGE':'aigc-generation-image','AIGC_08_VIDEO_AUDIO':'aigc-video-audio-production',
 'AIGC_09_EDIT':'aigc-edit-timeline','AIGC_10_MASTER':'aigc-mastering',
 'AIGC_11_DERIVATION':'aigc-distribution-package','AIGC_12_PUBLISH':'aigc-release-publishing',
 'AIGC_13_PERFORMANCE':'aigc-performance','AIGC_14_REVIEW':'aigc-review'
};
const PRODUCT_DOMAINS=[
 ['product-domain','需求与产品基线'],['product-delivery-domain','设计与技术交付'],
 ['product-engineering-domain','研发与预览'],['product-quality-domain','验收与质量'],
 ['product-outcome','结果与实验'],['product-review','复盘与知识回写']
];
function configureDomains(stages){
 const sel=$('domainSelect'),p=state.projects.find(x=>x.id===state.selected);clear(sel);
 if(!p)return;
 const items=p.projectType==='AIGC_CONTENT'
   ?stages.filter(s=>AIGC_DOMAINS[s.stageKey]).map(s=>[AIGC_DOMAINS[s.stageKey],s.displayName||s.stageKey])
   :PRODUCT_DOMAINS;
 for(const [path,label] of items){const op=make('option',label);op.value=path;sel.append(op);}
 sel.disabled=!sel.options.length;
}
const make=(tag,txt='',cls='')=>{const n=document.createElement(tag);if(cls)n.className=cls;n.textContent=txt==null?'—':String(txt);return n;};
const clear=n=>n.replaceChildren();
const text=(id,t)=>$(id).textContent=t==null?'—':String(t);
const warn=s=>{const n=$('notice');n.className=s?'warn':'';n.textContent=s||'';};
async function req(path,opts={}){
 const res=await fetch(path,{credentials:'same-origin',...opts,headers:{...(opts.body?{'content-type':'application/json'}:{}),...opts.headers}});
 let data;try{data=await res.json();}catch{throw Error('SERVER_NON_JSON_RESPONSE');}
 if(!res.ok)throw Error(data.error||'HTTP_'+res.status);
 return data.data??data;
}
const label=p=>p.projectType==='AIGC_CONTENT'?'AIGC 内容生产':p.projectType==='PRODUCT_DEVELOPMENT'?'产品研发':p.projectType;
async function bootstrap(){
 const session=await req('/auth/session');
 if(!session.authenticated){$('login').hidden=false;$('workspace').hidden=true;$('logout').hidden=true;return;}
 state.writesEnabled=!!session.writesEnabled;
 $('login').hidden=true;$('workspace').hidden=false;$('logout').hidden=false;
 $('newProject').disabled=!state.writesEnabled;
 $('newProject').title=state.writesEnabled?'真实写入预发环境':'预发写入未授权：CONSOLE_ALLOW_WRITES=false';
 await loadCatalogs();
}
async function loadCatalogs(){
 warn('正在读取真实工作空间和项目元数据…');
 try{
   const [ws,types,presets,modules]=await Promise.all([
    req('/api/runtime/workspaces'),
    req('/api/runtime/project-types'),
    req('/api/runtime/domain-presets'),
    req('/api/runtime/aigc-modules')
   ]);
   state.workspaces=Array.isArray(ws)?ws:(ws.items||[]);
   state.types=Array.isArray(types)?types:[];
   state.presets=Array.isArray(presets)?presets:(presets.items||[]);
   state.modules=Array.isArray(modules)?modules:[];
   const sel=$('workspaceSelect');clear(sel);
   for(const w of state.workspaces){const option=make('option',w.name||w.workspaceKey||w.id);option.value=w.id;sel.append(option);}
   state.workspaceId=state.workspaces.find(x=>x.id===state.workspaceId)?.id||state.workspaces[0]?.id||null;
   if(state.workspaceId){sel.value=state.workspaceId;await loadProjects();}
   else{warn('Runtime 未返回工作空间。未创建模拟空间。');clear($('projectList'));}
 }catch(e){warn('服务端读取失败：'+e.message+'。不使用旧原型数据兜底。');}
}
async function loadProjects(focus=null){
 if(!state.workspaceId)return;
 const ver=++state.version;
 warn('正在读取 Runtime 项目列表…');
 try{
  let offset=0;const items=[];let total=0;
  do{
   const page=await req('/api/runtime/projects?workspaceId='+encodeURIComponent(state.workspaceId)+'&limit=100&offset='+offset);
   if(ver!==state.version)return;
   if(!Array.isArray(page.items))throw Error('INVALID_PROJECT_LIST_CONTRACT');
   total=page.total;items.push(...page.items);offset+=page.items.length;
   if(items.length>1000)throw Error('PROJECT_PAGE_LIMIT_EXCEEDED');
   if(page.items.length===0)break;
  }while(offset<total);
  state.projects=items;
  renderProjects();
  const id=focus||((state.selected&&items.some(x=>x.id===state.selected))?state.selected:items[0]?.id);
  if(id)await selectProject(id);else{state.selected=null;$('projectBody').hidden=true;$('empty').hidden=false;warn('此工作空间没有真实项目。');}
 }catch(e){state.projects=[];renderProjects();warn('项目列表接口未通过：'+e.message+'。Frontend Sync Gate 仍为 FAIL。');}
}
function renderProjects(){
 const root=$('projectList');clear(root);
 const filtered=state.projects.filter(p=>!state.type||p.projectType===state.type);
 if(!filtered.length)root.append(make('p','无真实项目','muted'));
 for(const p of filtered){const b=make('button','','project-item'+(p.id===state.selected?' selected':''));const name=make('strong',p.name);b.append(name,make('small',label(p)+' · '+p.status));b.onclick=()=>selectProject(p.id);root.append(b);}
}
async function selectProject(id){
 const project=state.projects.find(p=>p.id===id);if(!project)return;
 state.selected=id;renderProjects();$('empty').hidden=true;$('projectBody').hidden=false;
 text('projectTitle',project.name);text('projectMeta',project.projectKey+' · '+label(project)+' · '+project.id);
 text('projectStatus',project.status);text('currentStage',project.currentStageKey);text('workflowVersion',project.currentWorkflowVersion);text('stageCount','—');
 for(const el of ['stageTable','transitions','modules','auditRows'])clear($(el));
 const ver=state.version,expected=id;
 const routes=[
  ['/api/runtime/projects/'+id+'/lifecycle','lifecycle'],
  ['/api/runtime/projects/'+id+'/governance','governance'],
  ['/api/runtime/projects/'+id+'/stage-transitions?limit=50','transitions'],
  ['/api/runtime/workspaces/'+state.workspaceId+'/audit-evidence?projectId='+id+'&limit=50','audit']
 ];
 if(project.projectType==='AIGC_CONTENT')routes.push(['/api/runtime/projects/'+id+'/aigc-foundation','domain']);
 else routes.push(['/api/runtime/projects/'+id+'/product-domain','domain']);
 const results=await Promise.allSettled(routes.map(([u])=>req(u)));
 if(ver!==state.version||expected!==state.selected)return;
 const errors=[];
 for(let i=0;i<results.length;i++){
  const name=routes[i][1],r=results[i];
  if(r.status==='rejected'){errors.push(name+': '+r.reason.message);continue;}
  if(name==='lifecycle')renderStages(r.value);
  if(name==='governance'||name==='domain')renderModule(name,r.value);
  if(name==='transitions')renderTransitions(r.value);
  if(name==='audit')renderAudit(r.value);
 }
 warn(errors.length?'部分真实接口不可用：'+errors.join('；'):'数据已从 Runtime 刷新。审计是服务端索引快照，可能需要单独重建。');
}
function renderStages(v){
 const stages=Array.isArray(v.stages)?v.stages:[];text('stageCount',stages.length);configureDomains(stages);
 const root=$('stageTable');clear(root);
 if(!stages.length){root.append(make('p','尚未绑定可读取的正式工作流。','muted'));return;}
 const head=make('div','','gridrow head');['序号','阶段','状态','Gate'].forEach(t=>head.append(make('span',t)));root.append(head);
 for(const s of stages){const row=make('div','','gridrow');row.append(make('small',String(s.sequenceNo)),make('strong',s.displayName||s.stageKey),make('span',s.status,'status '+s.status),make('span',s.lastGateResultId?'ID '+s.lastGateResultId.slice(0,8):'未产生 Gate 结果','mono'));root.append(row);}
}
function renderModule(name,v){
 const root=$('modules'),wrap=make('div','','event');
 const key=make('div');key.append(make('strong',name==='governance'?'项目治理':'业务领域'));
 key.append(make('p',name==='governance'?'来自 /governance 的服务端状态':'来自后端领域状态，不等于文件内容已可打开','muted'));
 wrap.append(key);root.append(wrap);
 const summary=make('pre','','mono');summary.textContent=JSON.stringify(v,null,2).slice(0,14000);
 summary.style.whiteSpace='pre-wrap';root.append(summary);
}
function renderTransitions(v){
 const root=$('transitions');clear(root);
 const items=Array.isArray(v)?v:(v.items||[]);
 if(!items.length){root.append(make('p','没有服务端阶段变更记录。','muted'));return;}
 for(const e of items){const row=make('div','','event');const box=make('div');box.append(make('strong',(e.fromStageKey||'—')+' → '+(e.toStageKey||'—')));box.append(make('p',(e.transitionType||'')+' · '+(e.gateResultId||'无 Gate ID'),'mono'));row.append(box,make('small',e.createdAt||''));root.append(row);}
}
function renderAudit(v){
 const root=$('auditRows');clear(root);const items=Array.isArray(v.items)?v.items:[];
 if(!items.length){root.append(make('p','当前服务端审计索引无结果；不构造浏览器日志。','muted'));return;}
 for(const e of items){const row=make('div','','event');const box=make('div');box.append(make('strong',e.eventType||e.category));box.append(make('p',e.sourceType+' · '+e.sourceId,'mono'));row.append(box,make('small',e.status||'—'));root.append(row);}
}
$('loginForm').onsubmit=async e=>{e.preventDefault();text('loginError','');try{await req('/auth/login',{method:'POST',body:JSON.stringify({password:$('password').value})});$('password').value='';await bootstrap();}catch(err){text('loginError','登录失败：'+err.message);}};
$('logout').onclick=async()=>{await req('/auth/logout',{method:'POST',body:'{}'});state.selected=null;await bootstrap();};
$('refresh').onclick=()=>loadCatalogs();
$('workspaceSelect').onchange=e=>{state.workspaceId=e.target.value;state.selected=null;loadProjects();};
document.querySelectorAll('.filter').forEach(b=>b.onclick=()=>{state.type=b.dataset.type;document.querySelectorAll('.filter').forEach(x=>x.classList.toggle('active',x===b));renderProjects();});
document.querySelectorAll('.tab').forEach(b=>b.onclick=()=>{document.querySelectorAll('.tab').forEach(x=>x.classList.toggle('active',x===b));document.querySelectorAll('.panel').forEach(p=>p.hidden=p.id!==b.dataset.panel);});
$('newProject').onclick=()=>{if(!state.writesEnabled)return;const sel=$('createPreset');clear(sel);const none=make('option','不自动绑定（保留待绑定状态）');none.value='';sel.append(none);setPresets();$('createDialog').showModal();};
function setPresets(){
 const sel=$('createPreset');while(sel.children.length>1)sel.lastChild.remove();
 for(const p of state.presets.filter(x=>x.projectTypeKey===$('createType').value&&x.status==='ACTIVE')){
  const op=make('option',p.displayName||p.presetKey);op.value=p.presetKey;sel.append(op);
 }
}
$('createType').onchange=setPresets;
$('closeDialog').onclick=()=>$('createDialog').close();
$('createForm').onsubmit=async e=>{
 e.preventDefault();text('createError','');if(!state.workspaceId){text('createError','未选择真实工作空间');return;}
 const body={workspaceId:state.workspaceId,projectKey:$('createKey').value.trim(),name:$('createName').value.trim(),projectType:$('createType').value};
 if($('createPreset').value)body.domainPresetKey=$('createPreset').value;
 try{
  const result=await req('/api/runtime/projects',{method:'POST',body:JSON.stringify(body)});
  if(!result.id)throw Error('PROJECT_CREATE_RESPONSE_MISSING_ID');
  $('createDialog').close();$('createForm').reset();await loadProjects(result.id);
 }catch(err){text('createError',err.message);}
};
$('domainSelect').onchange=async e=>{
 const id=state.selected,path=e.target.value;if(!id||!path)return;
 clear($('modules'));warn('正在读取后端阶段领域记录…');
 try{
  const v=await req('/api/runtime/projects/'+encodeURIComponent(id)+'/'+path);
  if(id!==state.selected)return;
  renderModule(path,v);warn('当前领域已从 Runtime 读取。文档内容仍需通过文件服务单独校验。');
 }catch(err){warn('领域记录读取失败：'+err.message);}
};
bootstrap().catch(e=>warn('启动失败：'+e.message));
