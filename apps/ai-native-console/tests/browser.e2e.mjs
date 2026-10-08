import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createConsoleServer } from '../server.mjs';

// Isolated browser interaction test. All fixture records are confined to this
// test process, NEVER deployed or exposed as real production/staging facts.
const env={
  CONSOLE_ADMIN_PASSWORD:'local-playwright-password',
  RUNTIME_API_TOKEN:'local-test-runtime-token',
  RUNTIME_API_BASE_URL:'https://runtime.test.invalid',
  CONSOLE_ALLOW_WRITES:'false',
  CONSOLE_ALLOW_SHARED_ADMIN_LOGIN:'true',
  NODE_ENV:'development'
};
const requests=[];
const pId='a1111111-2222-4333-8444-555555555555';
const wsId='b1111111-2222-4333-8444-555555555555';
const aId='c1111111-2222-4333-8444-555555555555';
const vId='d1111111-2222-4333-8444-555555555555';
const tId='e1111111-2222-4333-8444-555555555555';
let templateVersion='2.4',lifecycleUnavailable=false;
let resolveDelayedReview=null;
let stages=[
  {stageKey:'AIGC_06_ASSET',displayName:'正式资产与版本',sequenceNo:6,status:'ACTIVE',lastGateResultId:null},
  {stageKey:'AIGC_14_REVIEW',displayName:'数据复盘',sequenceNo:14,status:'PENDING',lastGateResultId:null}
];
const reply=(body,status=200)=>({status,text:async()=>JSON.stringify(body)});
const fakeRuntime=async(url,opt)=>{
 const parsed=new URL(url);requests.push({path:parsed.pathname,method:opt.method});
 assert.equal(opt.headers.authorization,'Bearer local-test-runtime-token');
 const path=parsed.pathname;
 if(path==='/api/runtime/workspaces')return reply({data:[{id:wsId,name:'独立 UI 测试空间'}]});
 if(path==='/api/runtime/project-types'||path==='/api/runtime/domain-presets'||path==='/api/runtime/aigc-modules')return reply({data:[]});
 if(path==='/api/runtime/capabilities')return reply({data:[{id:'tool1',name:'测试资源能力',capabilityType:'TOOL',status:'ACTIVE'}]});
 if(path==='/api/runtime/projects')return reply({data:{workspaceId:wsId,total:1,items:[{id:pId,name:'真实 API 形态样例（仅测试）',projectKey:'BROWSER_TEST_1',projectType:'AIGC_CONTENT',status:'ACTIVE',currentStageKey:'AIGC_06_ASSET',currentWorkflowVersion:'test-only',workflowTemplateId:'fixture-template'}]}});
 if(path.endsWith('/lifecycle'))return lifecycleUnavailable?reply({error:'TEST_LIFECYCLE_UNAVAILABLE'},503):reply({data:{project:{workflowTemplateId:'fixture-template'},template:{id:'fixture-template',templateKey:'STANDARD:AIGC_CONTENT_STANDARD',version:templateVersion},stages,milestones:[]}});
 if(path.endsWith('/governance'))return reply({data:{workItems:[{id:tId,itemKey:'TASK-01',title:'测试资产检查',itemType:'QA',status:'ACTIVE',priority:'P1'}],milestones:[{id:'ms-1',displayName:'第一里程碑',managementStatus:'ACTIVE',progressPercent:50}],risks:[]}});
 if(path.endsWith('/stage-transitions'))return reply({data:[]});
 if(path.endsWith('/audit-events'))return reply({data:{source:'AUDIT_LOGS_PRIMARY',items:[{id:'123',eventType:'READ_ONLY_AUDIT_TEST',actorKey:'browser-test'}]}});
 if(path.endsWith('/audit-evidence'))return reply({data:{items:[]}});
 if(path.endsWith('/aigc-foundation'))return reply({data:{projectId:pId}});
 if(path.endsWith('/aigc-review'))return new Promise(resolve=>{resolveDelayedReview=resolve;});
 if(path.endsWith('/knowledge-bindings'))return reply({data:[{projectId:pId,bindingKey:'SRC1',sourceKey:'TEST_LIBRARY',provider:'LIBRARY',status:'ACTIVE'}]});
 if(path.endsWith('/aigc-asset-system'))return reply({data:{
  assets:[{id:aId,assetKey:'LOOK_MAIN',displayName:'测试用造型母版',assetType:'LOOK',status:'CURRENT'}],
  versions:[{id:vId,assetId:aId,versionNo:2,state:'CURRENT',contentLocator:{file_id:'fixture-file-id'}}],
  requirementBindings:[]
 }});
 return reply({error:'UNEXPECTED_ROUTE'},404);
};
const server=createConsoleServer({env,fetchImpl:fakeRuntime});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const host='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
const page=await browser.newPage({viewport:{width:1280,height:800}});
try{
 await page.goto(host+'/projects');
 await page.getByRole('heading',{name:'连接你的真实项目'}).waitFor();
 assert.equal(await page.locator('#workspace').isVisible(),false);
 await page.locator('#loginMode').selectOption('shared');
 await page.locator('#password').fill('local-playwright-password');
 await page.getByRole('button',{name:'进入工作台'}).click();
 await page.getByRole('heading',{name:'项目总览'}).waitFor();
 assert.equal(new URL(page.url()).pathname,'/projects');
 assert.equal(await page.locator('#projectScreen').isVisible(),false);
 await page.locator('#projectList').getByText('真实 API 形态样例（仅测试）').click();
 await page.waitForURL('**/projects/'+pId+'/overview');
 await page.locator('#projectTitle').getByText('真实 API 形态样例（仅测试）').waitFor();
 assert.equal(await page.locator('#catalogScreen').isVisible(),false);
 await page.getByText('第一里程碑').waitFor();
 const go=async path=>{await page.locator('a[href="'+path+'"]').first().click();await page.waitForURL(u=>u.pathname===path);};
 await go('/projects/'+pId+'/tasks');
 await page.getByText('测试资产检查').waitFor();
 await go('/projects/'+pId+'/tasks/'+tId);
 await page.locator('#detailTitle').getByText('测试资产检查').waitFor();
 await page.reload();await page.locator('#detailTitle').getByText('测试资产检查').waitFor();
 await go('/projects/'+pId+'/tasks');
 await go('/projects/'+pId+'/assets');
 await page.locator('#modules').getByText('测试用造型母版').waitFor();
 // A slower previous domain request must never replace the user's latest
 // asset tab selection, even when the older response succeeds afterward.
 await page.locator('#domainSelect').selectOption('aigc-review');
 await page.locator('#modules').getByText('正在读取服务端资产…').waitFor();
 await page.locator('#domainSelect').selectOption('aigc-asset-system');
 await page.locator('#modules').getByText('测试用造型母版').waitFor();
 assert.ok(resolveDelayedReview,'the previous domain request was sent');
 const oldResponse=page.waitForResponse(x=>x.url().endsWith('/aigc-review')&&x.status()===200);
 resolveDelayedReview(reply({data:{stale:'OLD_DOMAIN_SHOULD_NOT_RENDER'}}));
 await oldResponse;
 await page.waitForTimeout(100);
 assert.equal(await page.locator('#modules').getByText('OLD_DOMAIN_SHOULD_NOT_RENDER').count(),0);
 await page.locator('#modules').getByText('测试用造型母版').waitFor();
 console.log('M31_ASSET_RACE_PASS stale successful domain response discarded after latest selection');
 await go('/projects/'+pId+'/assets/'+aId);
 await page.locator('#detailTitle').getByText('测试用造型母版').waitFor();
 await page.getByText('已登记源引用，待授权解析').waitFor();
 assert.equal(await page.getByRole('button',{name:'下载文件'}).count(),0);
 await page.goBack();await page.waitForURL('**/projects/'+pId+'/assets');
 await go('/projects/'+pId+'/data');await page.getByText('任务总数').waitFor();
 await go('/projects/'+pId+'/stages');
 await page.locator('#stageTable').getByText('正式资产与版本',{exact:true}).waitFor();
 const structuralResult=page.locator('#aigcStageCheckResult');
 await structuralResult.filter({hasText:'当前真实阶段 2/15'}).waitFor();
 const keys=['AIGC_00_INIT','AIGC_01_DISCOVERY','AIGC_02_PLAN','AIGC_03_SCRIPT','AIGC_04_BREAKDOWN','AIGC_05_FORMAT','AIGC_06_ASSET','AIGC_07_IMAGE','AIGC_08_VIDEO_AUDIO','AIGC_09_EDIT','AIGC_10_MASTER','AIGC_11_DERIVATION','AIGC_12_PUBLISH','AIGC_13_PERFORMANCE','AIGC_14_REVIEW'];
 stages=keys.map((stageKey,i)=>({stageKey,sequenceNo:i+1,displayName:'测试阶段 '+(i+1),status:'PENDING',lastGateResultId:null}));
 await page.locator('#refreshProject').click();
 await structuralResult.filter({hasText:'结构通过：真实工作流 15/15'}).waitFor();
 stages[9]={...stages[9],stageKey:'AIGC_08_VIDEO_AUDIO'};
 await page.locator('#refreshProject').click();
 await structuralResult.filter({hasText:'Key、顺序或序号'}).waitFor();
 stages[9]={...stages[9],stageKey:'AIGC_09_EDIT'};
 await page.locator('#refreshProject').click();
 await structuralResult.filter({hasText:'结构通过：真实工作流 15/15'}).waitFor();
 templateVersion='2.3';
 await page.locator('#refreshProject').click();
 await structuralResult.filter({hasText:'模板身份或版本'}).waitFor();
 templateVersion='2.4';
 await page.locator('#refreshProject').click();
 await structuralResult.filter({hasText:'结构通过：真实工作流 15/15'}).waitFor();
 lifecycleUnavailable=true;
 await page.locator('#refreshProject').click();
 await structuralResult.filter({hasText:'模板身份或版本'}).waitFor();
 await page.locator('#notice').filter({hasText:'TEST_LIFECYCLE_UNAVAILABLE'}).waitFor();
 assert.equal(await page.locator('#stageTable .gridrow').count(),0,'failed new lifecycle cannot display stale PASS stage rows');
 lifecycleUnavailable=false;
 console.log('M31_AIGC_15_STAGE_STRUCTURE_TEST_PASS 2/15=HOLD, duplicate=HOLD, wrong-version=HOLD, upstream-failure=HOLD, exact ordered 15=PASS');
 await go('/projects/'+pId+'/audit');await page.getByText('READ_ONLY_AUDIT_TEST').waitFor();
 await go('/capabilities');await page.getByText('测试资源能力').waitFor();
 assert.equal(await page.locator('#projectScreen').isVisible(),false);
 await go('/knowledge');await page.getByText('TEST_LIBRARY').waitFor();
 await go('/projects');await page.getByRole('heading',{name:'项目总览'}).waitFor();
 await page.goBack();await page.waitForURL('**/knowledge');
 await page.reload();await page.getByText('TEST_LIBRARY').waitFor();
 assert.equal(await page.locator('#newProject').isDisabled(),true);
 const mobile=await browser.newPage({viewport:{width:390,height:844}});
 await mobile.goto(host+'/projects/'+pId+'/assets/'+aId);
 await mobile.getByRole('heading',{name:'连接你的真实项目'}).waitFor();
 assert.equal(await mobile.locator('#workspace').isVisible(),false);await mobile.close();
 await page.getByRole('button',{name:'退出'}).click();
 await page.getByRole('heading',{name:'连接你的真实项目'}).waitFor();
 assert.equal(await page.locator('#workspace').isVisible(),false);
 assert.ok(requests.some(x=>x.path.endsWith('/knowledge-bindings')));
 assert.ok(requests.some(x=>x.path.endsWith('/aigc-asset-system')));
 assert.ok(requests.every(x=>x.method==='GET'));
 console.log('M31_MULTI_PAGE_ROUTING_PASS global navigation, project tabs, task+asset detail, deep-link reload, back, logout');

}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
