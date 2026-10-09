import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const url='https://ai-native-console-m31-staging.up.railway.app';
const browser=await chromium.launch({headless:true,args:['--no-sandbox']});
try{
 for(const viewport of [{width:1366,height:900},{width:390,height:844}]){
  const page=await browser.newPage({viewport});
  try{
   const response=await page.goto(url,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(response.status(),200);
   await page.getByRole('heading',{name:'连接你的真实项目'}).waitFor();
   assert.equal(await page.locator('#workspace').isVisible(),false);
   assert.equal(await page.getByRole('button',{name:'进入工作台'}).isVisible(),true);
   const modes=await page.locator('#loginMode option').allTextContents();
   assert.deepEqual(modes,['个人受限凭据（推荐）','预发共享验证（只读）','凭证管理员（仅预发）']);
   assert.equal(await page.locator('#loginMode').inputValue(),'scoped');
   const check=await page.request.get(url+'/api/runtime/workspaces');
   assert.equal(check.status(),401);
   const session=await page.request.get(url+'/auth/session');
   const data=await session.json();
   assert.equal(data.authenticated,false);
   assert.equal(data.writesEnabled,false);
   assert.equal(data.sharedLoginEnabled,true);
   assert.equal(data.mode,null);
   await page.waitForFunction(enabled=>document.querySelector('#loginMode option[value="credential-admin"]').hidden===!enabled,data.credentialAdminLoginEnabled);
   assert.equal(await page.locator('#loginMode option[value="credential-admin"]').evaluate(option=>option.hidden),!data.credentialAdminLoginEnabled);
   const adminAttempt=await page.request.get(url+'/api/runtime/api-credentials');
   assert.equal(adminAttempt.status(),401);
   // Invalid input cannot create a browser session; do not use real secrets.
   if(viewport.width>500){
    await page.locator('#password').fill('invalid-test-credential');
    await page.getByRole('button',{name:'进入工作台'}).click();
    await page.locator('#loginError').getByText('INVALID_CREDENTIALS').waitFor();
    assert.equal(await page.locator('#workspace').isVisible(),false);
   }
   // A non-existent project ID is used only to verify addressable page shell.
   // It must never surface project data without an authenticated session.
   const deep='/projects/00000000-0000-4000-8000-000000000999/assets';
   const routed=await page.goto(url+deep,{waitUntil:'domcontentloaded',timeout:30000});
   assert.equal(routed.status(),200);
   await page.getByRole('heading',{name:'连接你的真实项目'}).waitFor();
   assert.equal(await page.locator('#workspace').isVisible(),false);
   // These are actual deployed HTML route responses, not a claim of access to private project data.
   for(const route of [
     '/projects','/capabilities','/knowledge',
     '/projects/00000000-0000-4000-8000-000000000999/overview',
     '/projects/00000000-0000-4000-8000-000000000999/tasks',
     '/projects/00000000-0000-4000-8000-000000000999/assets',
     '/projects/00000000-0000-4000-8000-000000000999/data',
     '/projects/00000000-0000-4000-8000-000000000999/stages',
     '/projects/00000000-0000-4000-8000-000000000999/audit',
     '/projects/00000000-0000-4000-8000-000000000999/tasks/00000000-0000-4000-8000-000000000777',
     '/projects/00000000-0000-4000-8000-000000000999/assets/00000000-0000-4000-8000-000000000666'
   ]){
     const response=await page.goto(url+route,{waitUntil:'domcontentloaded',timeout:30000});
     assert.equal(response.status(),200,route+' must be a routed shell');
     await page.getByRole('heading',{name:'连接你的真实项目'}).waitFor();
     assert.equal(await page.locator('#workspace').isVisible(),false);
   }
   console.log('STAGING_MULTIPAGE_DEEP_LINK_PASS: all 11 routed shells, authenticated data blocked without login');
   console.log('STAGING_BROWSER_LOGIN_SHELL_PASS viewport='+viewport.width+'x'+viewport.height+' real_https=true writes=false');
  }finally{await page.close();}
 }
 console.log('M31_LIVE_BROWSER_UNAUTH_PASS desktop+mobile, no user login or write tested');
}finally{await browser.close();}
