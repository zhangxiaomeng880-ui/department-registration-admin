import test from 'node:test';
import assert from 'node:assert/strict';
import {isCurrentAssetRead,isCurrentKnowledgeRead,isCurrentProjectList} from '../public/read-guards.mjs';

test('old workspace pagination may not replace the newly selected real project list',()=>{
 const old={nonce:1,workspaceId:'w-old'};
 assert.equal(isCurrentProjectList(old,{nonce:1,workspaceId:'w-old'}),true);
 assert.equal(isCurrentProjectList(old,{nonce:2,workspaceId:'w-new'}),false);
 assert.equal(isCurrentProjectList(old,{nonce:2,workspaceId:'w-old'}),false);
 assert.equal(isCurrentProjectList(old,{nonce:1,workspaceId:'w-new'}),false);
});

test('out-of-order real asset responses never overwrite changed project, domain or route',()=>{
 const request={routeVersion:7,nonce:3,projectId:'p-a',domain:'aigc-asset-system'};
 const view={...request,page:'project',tab:'assets'};
 assert.equal(isCurrentAssetRead(request,view),true);
 assert.equal(isCurrentAssetRead(request,{...view,nonce:4}),false,'newer domain request wins');
 assert.equal(isCurrentAssetRead(request,{...view,projectId:'p-b'}),false,'another project cannot inherit assets');
 assert.equal(isCurrentAssetRead(request,{...view,domain:'aigc-script-domain'}),false,'old domain cannot overwrite new domain');
 assert.equal(isCurrentAssetRead(request,{...view,tab:'audit'}),false,'audit tab cannot receive stale asset results');
 assert.equal(isCurrentAssetRead(request,{...view,routeVersion:8}),false,'back-forward navigation invalidates old request');
});

test('out-of-order knowledge binding responses require same project, workspace, route and nonce',()=>{
 const request={routeVersion:10,nonce:2,workspaceId:'w-a',projectId:'p-1'};
 const view={...request,page:'knowledge'};
 assert.equal(isCurrentKnowledgeRead(request,view),true);
 assert.equal(isCurrentKnowledgeRead(request,{...view,projectId:'p-2'}),false);
 assert.equal(isCurrentKnowledgeRead(request,{...view,workspaceId:'w-b'}),false);
 assert.equal(isCurrentKnowledgeRead(request,{...view,page:'projects'}),false);
 assert.equal(isCurrentKnowledgeRead(request,{...view,nonce:3}),false);
 assert.equal(isCurrentKnowledgeRead(request,{...view,routeVersion:11}),false);
});
