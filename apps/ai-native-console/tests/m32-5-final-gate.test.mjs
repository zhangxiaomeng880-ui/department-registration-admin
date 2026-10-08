import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {generateKeyPairSync,sign} from 'node:crypto';
import {evaluateM325Gate,computeManifestDigest} from '../release/m32-5-final-gate.mjs';

const original=JSON.parse(readFileSync(new URL('../release/M32_5_EVIDENCE_V1_CURRENT.json',import.meta.url)));
const clone=()=>structuredClone(original);
const fakeOnly=()=>{ // Synthetic fixture for contract tests; NEVER a real release receipt.
 const m=clone();
 const sha='a'.repeat(40), old='b'.repeat(40);
 const actions=id=>({
  source:'GITHUB_ACTIONS',runId:id,headSha:sha,conclusion:'success',
  repository:'example.test/fixture',url:'https://github.com/example/test/actions/runs/'+id,
  verification:'EXTERNAL_SOURCE_READBACK',verifiedAt:'2026-10-08T12:00:00Z'
 });
 const names=['M32.1','M32.2','M32.3','M32.4','M32.4.4'];
 for(let i=0;i<names.length;i++)m.upstream[names[i]]={status:'PASS',evidence:actions(37733330000+i)};
 for(const s of Object.values(m.staging.services)){
  s.state='online';s.deploymentStatus='SUCCESS';s.verification='EXTERNAL_SOURCE_READBACK';
 }
 m.trace.release={
  branch:'synthetic-only',version:'TEST_ONLY',environment:'staging',
  commitSha:m.staging.services.console.deployedCommit,
  buildId:'SYNTHETIC_BUILD',testRunId:37733330000,
  deploymentId:m.staging.services.console.deploymentId,
  operator:'synthetic-fixture',timestamp:'2026-10-08T12:00:00Z',result:'SUCCESS'
 };
 m.trace.rollback={
  environment:'staging',oldCommit:old,targetCommit:sha,
  operator:'synthetic-fixture',reason:'fixture',timestamp:'2026-10-08T12:00:00Z',result:'PASS',
  verification:'EXTERNAL_SOURCE_READBACK',verifiedAt:'2026-10-08T12:00:00Z'
 };
 m.production.approvalGranted=true;
 m.production.humanApprovalEvidence='SYNTHETIC_ONLY';
 for(const name of Object.keys(m.flows)){
  m.flows[name]={
   ...actions(37744440000),
   status:'PASS',environment:'staging',evidenceType:'LIVE_END_USER_E2E'
  };
 }
 return m;
};

test('CURRENT evidence must be HOLD, despite prior M31 staging and CI being healthy',()=>{
 const result=evaluateM325Gate(original);
 assert.equal(result.decision,'HOLD');
 assert.equal(result.nonDeploymentEffect,true);
 assert.ok(result.blockers.some(b=>b.code==='UPSTREAM_EVIDENCE_MISSING'&&b.detail.includes('M32.4.4')));
 assert.ok(result.blockers.some(b=>b.code==='LIVE_E2E_NOT_PROVEN'));
 assert.ok(result.blockers.some(b=>b.code==='EXTERNAL_ATTESTATION_REQUIRED'));
 assert.ok(result.blockers.some(b=>b.code==='HUMAN_RELEASE_GATE'));
 assert.ok(result.blockerCount>10);
});

test('missing upstream provenance is not a PASS merely because status text says PASS',()=>{
 const m=clone();m.upstream['M32.2']={status:'PASS',evidence:{source:'GITHUB_ACTIONS',runId:37711111111}};
 assert.ok(evaluateM325Gate(m).blockers.some(x=>x.code==='UPSTREAM_EVIDENCE_MISSING'&&x.detail.includes('M32.2')));
});

test('synthetic full-fixture without signed independent attestation is still HOLD',()=>{
 const m=fakeOnly();
 const r=evaluateM325Gate(m);
 assert.equal(r.decision,'HOLD');
 assert.deepEqual(r.blockers.map(x=>x.code),['EXTERNAL_ATTESTATION_REQUIRED']);
});

test('Ed25519 signed entire evidence digest is required to become release-ready in isolated test',()=>{
 const m=fakeOnly();
 const {privateKey,publicKey}=createKeyPairSync('ed25519');
 const digest=computeManifestDigest(m);
 m.externalAttestation={
  source:'INDEPENDENT_RELEASE_VERIFIER',decision:'APPROVE',humanReviewed:true,
  manifestSha256:digest,signature:sign(null,Buffer.from(digest,'hex'),privateKey).toString('base64'),
  verification:'EXTERNAL_SOURCE_READBACK',verifiedAt:'2026-10-08T12:01:00Z'
 };
 assert.equal(evaluateM325Gate(m).decision,'HOLD','absence of verifier public key keeps the gate closed');
 const ready=evaluateM325Gate(m,{verifierPublicKey:publicKey});
 assert.equal(ready.decision,'RELEASE_READY_PENDING_PROMOTION');
 assert.equal(ready.blockerCount,0);
});

test('after signing a synthetic fixture, any mutation invalidates the release signature',()=>{
 const m=fakeOnly();const {privateKey,publicKey}=createKeyPairSync('ed25519');
 const digest=computeManifestDigest(m);
 m.externalAttestation={
  source:'INDEPENDENT_RELEASE_VERIFIER',decision:'APPROVE',humanReviewed:true,
  manifestSha256:digest,signature:sign(null,Buffer.from(digest,'hex'),privateKey).toString('base64'),
  verification:'EXTERNAL_SOURCE_READBACK',verifiedAt:'2026-10-08T12:01:00Z'
 };
 m.staging.services.console.deployedCommit='c'.repeat(40);
 const r=evaluateM325Gate(m,{verifierPublicKey:publicKey});
 assert.equal(r.decision,'HOLD');
 assert.ok(r.blockers.some(x=>x.code==='RELEASE_COMMIT_DRIFT'));
 assert.ok(r.blockers.some(x=>x.code==='EXTERNAL_ATTESTATION_REQUIRED'));
});

test('tampered HEAD success or missing rollback always leaves release HOLD',()=>{
 const m=fakeOnly();
 m.staging.anonymousFileHttp=200;
 m.trace.rollback=null;
 const r=evaluateM325Gate(m);
 assert.ok(r.blockers.some(x=>x.code==='STAGING_NEGATIVE_GATE'));
 assert.ok(r.blockers.some(x=>x.code==='ROLLBACK_EVIDENCE_MISSING'));
 assert.equal(r.decision,'HOLD');
});

test('production mutation and missing human approval are hard blockers',()=>{
 const m=fakeOnly();
 m.production.changedDuringGate=true;
 m.production.approvalGranted=false;
 m.production.humanApprovalEvidence=null;
 const codes=evaluateM325Gate(m).blockers.map(x=>x.code);
 assert.ok(codes.includes('PRODUCTION_BASELINE_UNVERIFIED'));
 assert.ok(codes.includes('HUMAN_RELEASE_GATE'));
});

test('reused M31 isolated UI test cannot prove M32 real file authorization',()=>{
 const m=fakeOnly();
 m.flows.asset_version_authorized_download_sha256={
  ...m.flows.asset_version_authorized_download_sha256,evidenceType:'ISOLATED_CONTRACT_TEST'
 };
 const r=evaluateM325Gate(m);
 assert.ok(r.blockers.some(x=>x.code==='LIVE_E2E_NOT_PROVEN'&&x.detail.includes('asset_version')));
});
