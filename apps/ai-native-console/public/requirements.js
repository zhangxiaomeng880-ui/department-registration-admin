const $=id=>document.getElementById(id);
const state={session:null,workspaceId:null,projectId:null,projects:[],current:null,level:'PAGE'};
const api=async(path,options={})=>{const response=await fetch(path,{...options,headers:{'content-type':'application/json',...(options.headers||{})}});const body=await response.json().catch(()=>({}));if(!response.ok)throw Error(body.error||'REQUEST_FAILED');return body.data??body;};
const clear=node=>{while(node.firstChild)node.firstChild.remove();};
const node=(tag,className,text)=>{const el=document.createElement(tag);if(className)el.className=className;if(text!=null)el.textContent=text;return el;};
const toast=message=>{$('toast').textContent=message;$('toast').classList.add('show');setTimeout(()=>$('toast').classList.remove('show'),2600);};
const statusLabel=status=>({REVIEW_REQUIRED:'待产品决策',READY_FOR_PRD:'可整理 PRD',HANDOFF_READY:'已生成 PRD 整理包',FAILED:'执行失败'}[status]||status||'—');
const tips={PAGE:'页面级：定义前台、管理后台各有哪些页面，以及页面目标、角色和入口。',MODULE:'模块级：定义页面内模块的职责、边界、数据来源和模块间关系。',METRIC:'指标级：定义口径、单位、维度、时间窗、刷新延迟、空值与异常状态。',FUNCTION:'功能点：定义搜索、下拉、筛选、点击、导出、提醒等触发条件、权限和结果反馈。'};

async function bootstrap(){
  state.session=await api('/auth/session');
  if(!state.session.authenticated){location.href='/projects';return;}
  $('sessionBadge').textContent=state.session.mode==='scoped'?'个人授权 · '+(state.session.writesEnabled?'可执行':'只读'):'共享预览 · 只读';
  $('execute').disabled=!state.session.writesEnabled;
  if(!state.session.writesEnabled)$('inputStatus').textContent='运行 Agent 需要个人 scoped 身份与 project:write 权限。';
  const workspaces=await api('/api/runtime/workspaces');
  clear($('workspaceSelect'));
  for(const workspace of workspaces){const option=node('option','',workspace.name||workspace.workspaceKey||workspace.id);option.value=workspace.id;$('workspaceSelect').append(option);}
  state.workspaceId=$('workspaceSelect').value||null;
  await loadProjects();
}
async function loadProjects(){
  if(!state.workspaceId)return;
  const data=await api('/api/runtime/projects?workspaceId='+encodeURIComponent(state.workspaceId)+'&limit=100');
  state.projects=data.items||data||[];clear($('projectSelect'));
  for(const project of state.projects){const option=node('option','',project.name+' · '+project.projectType);option.value=project.id;$('projectSelect').append(option);}
  state.projectId=$('projectSelect').value||null;
  await loadHistory();
}
async function loadHistory(){
  clear($('historyList'));if(!state.projectId)return;
  try{const data=await api('/api/runtime/projects/'+encodeURIComponent(state.projectId)+'/requirement-completions?limit=20');
    for(const item of data.items||[]){const card=node('article','history-item');const title=node('b','',statusLabel(item.status));const time=node('span','',item.createdAt?new Date(item.createdAt).toLocaleString('zh-CN'):'');const text=node('p','',item.sourceStatement);card.append(title,time,text);card.addEventListener('click',()=>openSession(item.id));$('historyList').append(card);}
    if(!(data.items||[]).length)$('historyList').append(node('p','aside-note','当前项目还没有补全记录。'));
  }catch(error){$('historyList').append(node('p','aside-note','历史读取失败：'+error.message));}
}
async function openSession(id){try{state.current=await api('/api/runtime/projects/'+encodeURIComponent(state.projectId)+'/requirement-completions/'+encodeURIComponent(id));render();}catch(error){toast('读取失败：'+error.message);}}

function render(){
  const current=state.current;if(!current)return;$('resultPanel').hidden=false;
  $('resultStatus').textContent=statusLabel(current.status);$('summary').textContent=current.result?.summary||'本次执行未生成结果。';
  $('completionScore').textContent=(current.result?.completionScore??'—')+(Number.isInteger(current.result?.completionScore)?'%':'');
  $('decisionCount').textContent=String((current.decisions||[]).filter(x=>x.status!=='RESOLVED').length);
  $('runTrace').textContent=current.trace?.runId?current.trace.runId.slice(0,8):'—';
  renderLevel();renderDecisions();
  $('handoff').disabled=!state.session.writesEnabled||current.status!=='READY_FOR_PRD';
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
    for(const option of decision.options||[]){const label=node('label','option');const radio=document.createElement('input');radio.type='radio';radio.name='decision_'+decision.id;radio.value=option.id;radio.disabled=decision.status==='RESOLVED'||!state.session.writesEnabled;if(decision.answer?.optionId===option.id)radio.checked=true;const copy=node('span','',option.label+' — '+option.description);label.append(radio,copy);if(option.recommended)label.append(node('em','','推荐'));options.append(label);}card.append(options);$('decisionList').append(card);if(decision.status!=='RESOLVED')pending++;}
  $('submitDecisions').hidden=pending===0;$('submitDecisions').disabled=!state.session.writesEnabled;
  if(!decisions.length)$('decisionList').append(node('p','aside-note','没有必须由用户补充的决策项。'));
}

$('workspaceSelect').addEventListener('change',async event=>{state.workspaceId=event.target.value;state.current=null;$('resultPanel').hidden=true;await loadProjects();});
$('projectSelect').addEventListener('change',async event=>{state.projectId=event.target.value;state.current=null;$('resultPanel').hidden=true;await loadHistory();});
$('refreshHistory').addEventListener('click',loadHistory);
document.querySelectorAll('.yellow-tabs button').forEach(button=>button.addEventListener('click',()=>{state.level=button.dataset.level;renderLevel();}));
$('execute').addEventListener('click',async()=>{
  const statement=$('statement').value.trim();if(statement.length<4){$('inputStatus').textContent='请先输入至少 4 个字的需求描述。';return;}
  if(!state.projectId){$('inputStatus').textContent='请选择项目。';return;}
  $('execute').disabled=true;$('execute').textContent='Agent 正在读取上下文并补全…';$('inputStatus').textContent='';
  try{state.current=await api('/api/runtime/projects/'+encodeURIComponent(state.projectId)+'/requirement-completions',{method:'POST',body:JSON.stringify({statement,applicationType:$('applicationType').value})});render();await loadHistory();toast('需求补全已完成并持久化。');}
  catch(error){$('inputStatus').textContent='执行失败：'+error.message;}
  finally{$('execute').disabled=!state.session.writesEnabled;$('execute').textContent='运行需求 Agent';}
});
$('decisionForm').addEventListener('submit',async event=>{
  event.preventDefault();const answers=[];
  for(const decision of state.current?.decisions||[]){if(decision.status==='RESOLVED')continue;const selected=document.querySelector('input[name="decision_'+CSS.escape(decision.id)+'"]:checked');if(selected)answers.push({decisionId:decision.id,optionId:selected.value});}
  if(!answers.length){toast('请至少选择一项决策。');return;}
  try{state.current=await api('/api/runtime/projects/'+encodeURIComponent(state.projectId)+'/requirement-completions/'+encodeURIComponent(state.current.id)+'/decisions',{method:'POST',body:JSON.stringify({answers})});render();await loadHistory();toast('决策已记录，断点已更新。');}catch(error){toast('提交失败：'+error.message);}
});
$('handoff').addEventListener('click',async()=>{try{state.current=await api('/api/runtime/projects/'+encodeURIComponent(state.projectId)+'/requirement-completions/'+encodeURIComponent(state.current.id)+'/handoff',{method:'POST',body:'{}'});render();await loadHistory();toast('PRD 整理包已生成。');}catch(error){toast('生成失败：'+error.message);}});
bootstrap().catch(error=>{$('inputStatus').textContent='启动失败：'+error.message;});
