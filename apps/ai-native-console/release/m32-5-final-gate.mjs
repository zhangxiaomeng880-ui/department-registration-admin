// M32.5 release evidence contract. A green CI contract check is NOT a
// Production Release Gate PASS; missing independently verified evidence is HOLD.
import {readFileSync} from 'node:fs';
import {createHash,verify as verifySignature} from 'node:crypto';
import {fileURLToPath} from 'node:url';

const sha=/^[a-f0-9]{40}$/i;
const runId=/^[1-9]\d{6,14}$/;
const uuid=/^[a-f0-9]{8}-[a-f0-9]{4}-[1-8][a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/i;
const upstreamStages=['M32.1','M32.2','M32.3','M32.4','M32.4.4'];
const liveFlowNames=[
 'authenticated_personal_login',
 'project_crud_reload_original_audit',
 'asset_version_authorized_download_sha256',
 'revoked_access_denied',
 'aigc_publish_performance_review_next_round',
 'release_evidence_trace',
 'rollback_execution_or_verified_safe_rehearsal'
];
const issue=(code,detail)=>({code,detail});
const validRun=e=>e?.source==='GITHUB_ACTIONS'&&runId.test(String(e.runId||''))&&
 sha.test(String(e.headSha||''))&&e.conclusion==='success'&&
 typeof e.repository==='string'&&/^https:\/\/github\.com\/[^/]+\/[^/]+\/actions\/runs\/\d+$/.test(e.url||'')&&
 e.url.endsWith('/'+e.runId);
const independent=e=>e?.verification==='EXTERNAL_SOURCE_READBACK'&&
 typeof e.verifiedAt==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d/.test(e.verifiedAt);
const allLiveProof=e=>e?.status==='PASS'&&e?.environment==='staging'&&
 e.evidenceType==='LIVE_END_USER_E2E'&&validRun(e)&&independent(e);
const validReleaseTrace=e=>e?.branch&&e?.version&&e?.environment==='staging'&&
 sha.test(e.commitSha||'')&&e?.buildId&&runId.test(String(e?.testRunId||''))&&
 uuid.test(e?.deploymentId||'')&&e?.operator&&e?.timestamp&&e?.result==='SUCCESS';
const validRollback=e=>e?.environment==='staging'&&sha.test(e.oldCommit||'')&&
 sha.test(e.targetCommit||'')&&e.oldCommit!==e.targetCommit&&
 e?.operator&&e?.reason&&e?.timestamp&&e?.result==='PASS'&&independent(e);

export const computeManifestDigest=manifest=>createHash('sha256').update(JSON.stringify({...manifest,externalAttestation:null})).digest('hex');

export const evaluateM325Gate=(manifest,{verifierPublicKey=null}={})=>{
 const blockers=[];
 if(!manifest||manifest.schemaVersion!=='M32.5_RELEASE_GATE_V1')blockers.push(issue('SCHEMA_INVALID','Missing frozen M32.5 schema'));
 if(manifest?.releaseScope!=='STAGING_PREPRODUCTION')blockers.push(issue('SCOPE_INVALID','Must use isolated staging'));
 const upstream=manifest?.upstream||{};
 for(const stage of upstreamStages){
  const entry=upstream[stage];
  if(entry?.status!=='PASS'||!validRun(entry?.evidence)||!independent(entry?.evidence))
   blockers.push(issue('UPSTREAM_EVIDENCE_MISSING',stage+' requires independently read-back PASS evidence'));
 }
 const services=manifest?.staging?.services||{};
 for(const component of ['runtime','console','mysql']){
  const s=services[component];
  if(!s||s.state!=='online'||s.deploymentStatus!=='SUCCESS'||!uuid.test(s.deploymentId||'')||
     !independent(s))
   blockers.push(issue('STAGING_SERVICE_UNVERIFIED',component+' live deployment not independently verified'));
 }
 if(manifest?.staging?.runtimeReadyHttp!==200||manifest?.staging?.anonymousFileHttp!==401||
    manifest?.staging?.writesEnabled!==false||manifest?.staging?.pendingDeploys!==0)
  blockers.push(issue('STAGING_NEGATIVE_GATE','/ready, anonymous 401, write-lock or pending patch failed'));
 if(manifest?.production?.changedDuringGate!==false)
  blockers.push(issue('PRODUCTION_BASELINE_UNVERIFIED','Production must remain untouched'));
 if(manifest?.production?.approvalGranted!==true||!manifest?.production?.humanApprovalEvidence)
  blockers.push(issue('HUMAN_RELEASE_GATE','No explicit production promotion approval in this release scope'));
 const release=manifest?.trace?.release;
 if(!validReleaseTrace(release))
  blockers.push(issue('RELEASE_TRACE_INCOMPLETE','Build/test/commit/version/environment/deployment/operator/timestamp must correlate'));
 else {
  const app=services.console;
  if(release.commitSha!==app?.deployedCommit)
   blockers.push(issue('RELEASE_COMMIT_DRIFT','Release record does not match the deployed Console SHA'));
  if(!Object.values(upstream).some(x=>x?.evidence?.runId===release.testRunId))
   blockers.push(issue('RELEASE_TEST_NOT_CORRELATED','Test run is not bound to upstream evidence'));
 }
 if(!validRollback(manifest?.trace?.rollback))
  blockers.push(issue('ROLLBACK_EVIDENCE_MISSING','Tested rollback/rehearsal with old/new commit and human operator is mandatory'));
 for(const flow of liveFlowNames){
  if(!allLiveProof(manifest?.flows?.[flow]))
   blockers.push(issue('LIVE_E2E_NOT_PROVEN',flow+' requires an actual end-user evidence run'));
 }
 // Schema validation alone can never verify CI, Railway, provider data or signatures.
 // The gate may only be RELEASE_PASS if a trusted external verifier has read
 // every source and attached a matching attestation over this frozen manifest.
 const att=manifest?.externalAttestation;
 let signatureVerified=false;
 if(att?.source==='INDEPENDENT_RELEASE_VERIFIER'&&att?.decision==='APPROVE'&&
    att?.humanReviewed===true&&independent(att)&&
    /^[a-f0-9]{64}$/i.test(att.manifestSha256||'')&&
    att.manifestSha256===computeManifestDigest(manifest)&&
    typeof att.signature==='string'&&verifierPublicKey){
  try{
   signatureVerified=verifySignature(null,Buffer.from(att.manifestSha256,'hex'),verifierPublicKey,Buffer.from(att.signature,'base64'));
  }catch{signatureVerified=false;}
 }
 if(!signatureVerified)
  blockers.push(issue('EXTERNAL_ATTESTATION_REQUIRED','Independent signed manifest + human review required; self-reported PASS is insufficient'));
 return {
  gate:'M32.5_WORKBENCH_FINAL_RELEASE',
  decision:blockers.length?'HOLD':'RELEASE_READY_PENDING_PROMOTION',
  structuralEvaluation:'COMPLETE',
  blockers,blockerCount:blockers.length,
  nonDeploymentEffect:true
 };
};

if(process.argv[1]&&fileURLToPath(import.meta.url)===process.argv[1]){
 const file=new URL('./M32_5_EVIDENCE_V1_CURRENT.json',import.meta.url);
 const raw=JSON.parse(readFileSync(file,'utf8'));
 const result=evaluateM325Gate(raw);
 console.log(JSON.stringify(result,null,2));
 // Regular evidence refresh may remain HOLD, but --require-pass makes a
 // production promotion job fail closed without release evidence.
 if(process.argv.includes('--require-pass')&&result.decision!=='RELEASE_READY_PENDING_PROMOTION')process.exitCode=2;
}
