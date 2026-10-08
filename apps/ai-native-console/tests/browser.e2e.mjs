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
const stages=[
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
 if(path==='/api/runtime/projects')return reply({data:{workspaceId:wsId,total:1,items:[{id:pId,name:'真实 API 形态样例（仅测试）',projectKey:'BROWSER_TEST_1',projectType:'AIGC_CONTENT',status:'ACTIVE',currentStageKey:'AIGC_06_ASSET',currentWorkflowVersion:'test-only'}]}});
 if(path.endsWith('/lifecycle'))return reply({data:{stages,milestones:[]}});
 if(path.endsWith('/governance'))return reply({data:{workItems:[]}});
 if(path.endsWith('/stage-transitions'))return reply({data:[]});
 if(path.endsWith('/audit-events'))return reply({data:{source:'AUDIT_LOGS_PRIMARY',items:[{id:'123',eventType:'READ_ONLY_AUDIT_TEST',actorKey:'browser-test'}]}});
 if(path.endsWith('/audit-evidence'))return reply({data:{items:[]}});
 if(path.endsWith('/aigc-foundation'))return reply({data:{projectId:pId}});
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
 await page.goto(host+'/');
 await page.getByRole('heading',{name:'连接你的真实项目'}).waitFor();
 assert.equal(await page.locator('#workspace').isVisible(),false);
 await page.locator('#loginMode').selectOption('shared');
 await page.locator('#password').fill('local-playwright-password');
 await page.getByRole('button',{name:'进入工作台'}).click();
 await page.locator('#projectTitle').getByText('真实 API 形态样例（仅测试）').waitFor();
 await page.getByRole('button',{name:'阶段与 Gate'}).click();
 await page.getByText('正式资产与版本',{exact:true}).first().waitFor();
 assert.match(await page.locator('#stageCount').innerText(),/2/);
 await page.getByRole('button',{name:'业务与资产'}).click();
 assert.equal(new URL(page.url()).pathname,'/projects/'+pId+'/assets');
 await page.getByLabel('读取阶段真实领域数据').selectOption('aigc-asset-system');
 await page.getByText('测试用造型母版').waitFor();
 await page.getByText('已登记源引用，待授权解析').waitFor();
 assert.equal(await page.getByRole('button',{name:'查看文档'}).count(),0);
 assert.equal(await page.locator('#newProject').isDisabled(),true);
 await page.getByRole('button',{name:'审计证据'}).click();
 assert.equal(new URL(page.url()).pathname,'/projects/'+pId+'/audit');
 await page.goBack();
 assert.equal(new URL(page.url()).pathname,'/projects/'+pId+'/assets');
 assert.equal(await page.locator('#assets').isVisible(),true);
 await page.getByRole('button',{name:'审计证据'}).click();
 await page.getByText('READ_ONLY_AUDIT_TEST').waitFor();
 await page.getByRole('button',{name:'刷新服务端'}).click();
 await page.locator('#projectTitle').getByText('真实 API 形态样例（仅测试）').waitFor();
 await page.reload();
 await page.locator('#projectTitle').getByText('真实 API 形态样例（仅测试）').waitFor();
 assert.equal(new URL(page.url()).pathname,'/projects/'+pId+'/audit');
 assert.equal(await page.locator('#audit').isVisible(),true);
 const mobile=await browser.newPage({viewport:{width:390,height:844}});
 await mobile.goto(host+'/projects/'+pId+'/assets');
 await mobile.getByRole('heading',{name:'连接你的真实项目'}).waitFor();
 assert.equal(await mobile.locator('#workspace').isVisible(),false);
 await mobile.close();
 await page.getByRole('button',{name:'退出'}).click();
 await page.getByRole('heading',{name:'连接你的真实项目'}).waitFor();
 assert.equal(await page.locator('#workspace').isVisible(),false);
 assert.ok(requests.some(x=>x.path.endsWith('/aigc-asset-system')));
 assert.ok(requests.some(x=>x.path.endsWith('/audit-events')));
 assert.ok(requests.every(x=>x.method==='GET'));
 console.log('M31_BROWSER_INTERACTION_PASS: login/tabs/real-data-shape/render/refresh/reload/logout; fixture backend only; no staging mutation');
}finally{
 await browser.close();
 await new Promise(resolve=>server.close(resolve));
}
