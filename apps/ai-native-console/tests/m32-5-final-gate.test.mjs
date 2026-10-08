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
 // The following is an isolated synthetic fixture, never an actual C19 receipt.
 m.criterion19['C19-A1']={
  status:'PASS_CLOSED',exactSourceMp4Sha256:'f'.repeat(64),
  publishedSourceBinding:{sha256:'f'.repeat(64),humanConfirmedUploadSource:true,evidenceRef:'SYNTHETIC_UPLOAD_EVIDENCE'},
  humanReviewAttestation:{mode:'HUMAN',decision:'APPROVED',synthetic:false},
  reviewArchive:{id:'SYNTHETIC_TEST_RECEIPT'}
 };
 m.criterion19['C19-A2']={
  status:'PASS_CLOSED',executedNextRound:{id:'SYNTHETIC_TEST_NEXT_ROUND'},
  attestation:{mode:'HUMAN',decision:'APPROVED',synthetic:false,realExternalOutcome:true}
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
 const {privateKey,publicKey}=generateKeyPairSync('ed25519');
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
 const m=fakeOnly();const {privateKey,publicKey}=generateKeyPairSync('ed25519');
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

test('recovered C19 Product evidence stays accepted without rerun; actual AIGC closure still blocked',()=>{
 const r=evaluateM325Gate(original);
 const codes=r.businessAcceptance.blockers.map(x=>x.code);
 assert.ok(!codes.includes('C19_PRODUCT_E2E_EVIDENCE_UNVERIFIED'));
 assert.ok(!codes.includes('C19_PRODUCT_SELF_LOOP_EVIDENCE_UNVERIFIED'));
 assert.ok(codes.includes('C19_AIGC_REAL_E2E_HOLD'));
 assert.ok(codes.includes('C19_AIGC_REAL_NEXT_ROUND_HOLD'));
});
test('real AIGC evidence is not equivalent to publication alone',()=>{
 const m=fakeOnly();
 m.criterion19['C19-A1']={
  status:'PASS_CLOSED',exactSourceMp4Sha256:null,
  humanReviewAttestation:{mode:'HUMAN',decision:'APPROVED',synthetic:false},
  reviewArchive:{id:'fixture'}
 };
 assert.equal(evaluateM325Gate(m).decision,'HOLD');
 assert.ok(evaluateM325Gate(m).businessAcceptance.blockers.some(x=>x.code==='C19_AIGC_REAL_E2E_HOLD'));
});

test('real candidate original hash cannot automatically become published Master without Human Source Binding',()=>{
 const m=fakeOnly();
 m.criterion19['C19-A1'].sourceCandidate=original.criterion19['C19-A1'].sourceCandidate;
 m.criterion19['C19-A1'].exactSourceMp4Sha256=original.criterion19['C19-A1'].sourceCandidate.sha256;
 delete m.criterion19['C19-A1'].publishedSourceBinding;
 let gate=evaluateM325Gate(m);
 assert.equal(gate.decision,'HOLD');
 assert.ok(gate.businessAcceptance.blockers.some(x=>x.code==='C19_AIGC_REAL_E2E_HOLD'));
 m.criterion19['C19-A1'].publishedSourceBinding={sha256:m.criterion19['C19-A1'].exactSourceMp4Sha256,humanConfirmedUploadSource:false,evidenceRef:'candidate only'};
 gate=evaluateM325Gate(m);
 assert.ok(gate.businessAcceptance.blockers.some(x=>x.code==='C19_AIGC_REAL_E2E_HOLD'));
});

test('author-confirmed published captioned visuals do not assert uploaded file byte identity or grant Review/Archive',()=>{
 const a1=original.criterion19['C19-A1'];
 assert.equal(a1.visualIdentityConfirmation.status,'PASS');
 assert.equal(a1.visualIdentityConfirmation.mode,'HUMAN');
 assert.equal(a1.visualIdentityConfirmation.scope,'CAPTIONED_VIDEO_VISUAL_CONTENT_MATCH_ONLY');
 assert.equal(a1.visualIdentityConfirmation.literalAnswer,'是的');
 assert.equal(a1.sourceCandidate.userConfirmedVisualMatch,true);
 assert.equal(a1.sourceCandidate.userConfirmedExactPublishedBytes,false);
 assert.equal(a1.exactSourceMp4Sha256,null);
 assert.equal(a1.publishedSourceBinding,null);
 assert.equal(a1.humanReviewAttestation,null);
 assert.equal(a1.reviewArchive,null);
 const gate=evaluateM325Gate(original);
 assert.equal(gate.decision,'HOLD');
 assert.ok(gate.businessAcceptance.blockers.some(b=>b.code==='C19_AIGC_REAL_E2E_HOLD'));
 assert.ok(gate.businessAcceptance.blockers.some(b=>b.code==='C19_AIGC_REAL_NEXT_ROUND_HOLD'));
});

test('real internally edited A2 preview with identical audio remains HOLD without Human approval or external results',()=>{
 const m=clone();
 assert.equal(m.criterion19['C19-A2'].privatePreview?.originalAudioBitstreamMatched,true);
 assert.equal(m.criterion19['C19-A2'].privatePreview?.humanCreativeDecision,null);
 const r=evaluateM325Gate(m);
 assert.equal(r.decision,'HOLD');
 assert.ok(r.businessAcceptance.blockers.some(x=>x.code==='C19_AIGC_REAL_NEXT_ROUND_HOLD'));
 assert.ok(r.businessAcceptance.blockers.some(x=>x.code==='C19_AIGC_REAL_E2E_HOLD'));
});

test('internal A0 preview must not become a real externally executed AIGC next round',()=>{
 const a1=original.criterion19['C19-A1'];
 const a2=original.criterion19['C19-A2'];
 assert.equal(a1.internalReviewCandidate?.externallyPublished,false);
 assert.equal(a1.internalReviewCandidate?.humanCreativeReviewApproval,false);
 assert.equal(a1.internalReviewCandidate?.registeredAsFormalMaster,false);
 assert.equal(a1.exactSourceMp4Sha256,null);
 assert.equal(a1.humanReviewAttestation,null);
 assert.equal(a2.executedNextRound,null);
 assert.equal(a2.attestation,null);
 const r=evaluateM325Gate(original);
 assert.equal(r.decision,'HOLD');
 assert.ok(r.businessAcceptance.blockers.some(b=>b.code==='C19_AIGC_REAL_E2E_HOLD'));
 assert.ok(r.businessAcceptance.blockers.some(b=>b.code==='C19_AIGC_REAL_NEXT_ROUND_HOLD'));
});


test('AIGC real-world publication is independent of platform release readiness',()=>{
 const m=fakeOnly();const platform=evaluateM325Gate(m);
 assert.equal(platform.businessAcceptance.decision,'PASS');
 m.criterion19['C19-A1'].status='HOLD';m.criterion19['C19-A2'].status='HOLD';
 m.flows.aigc_publish_performance_review_next_round={status:'HOLD'};
 const split=evaluateM325Gate(m);
 assert.deepEqual(split.blockers,platform.blockers);
 assert.equal(split.businessAcceptance.decision,'HOLD');
 assert.ok(split.businessAcceptance.blockerCount>=3);
});
