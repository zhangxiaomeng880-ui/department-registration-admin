import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const root=new URL('../public/',import.meta.url);
test('requirement workbench exposes one-line intake and four level tips',async()=>{
  const html=await readFile(new URL('requirements.html',root),'utf8');
  for(const text of ['一句话需求','页面级','模块级','指标级','功能点','生成 PRD 交接包'])assert.match(html,new RegExp(text));
});
test('browser bundle persists execution, decisions and handoff through Runtime API',async()=>{
  const js=await readFile(new URL('requirements.js',root),'utf8');
  assert.match(js,/requirement-completions/);assert.match(js,/\/decisions/);assert.match(js,/\/handoff/);
  assert.ok(!js.includes('localStorage'));assert.ok(!js.includes('RUNTIME_API_TOKEN'));
});
