const project=(id='p1',extra={})=>({id,projectKey:'KEY-'+id,name:'Project '+id,projectType:'AIGC_CONTENT',workflowTemplateId:'template1',status:'ACTIVE',currentStageKey:'AIGC_00_INIT',currentWorkflowVersion:'2.4',...extra});
const stage=(id='si1',extra={})=>({id,stageKey:'AIGC_00_INIT',displayName:'Stage '+id,sequenceNo:1,status:'READY',agentCapabilityKey:null,gatePolicyKey:null,lastGateResultId:null,blockedReason:null,startedAt:null,completedAt:null,...extra});
const lifecycle=(id='p1',extra={})=>({project:project(id),template:{id:'template1',templateKey:'STANDARD:AIGC_CONTENT_STANDARD',version:'2.4'},stages:[stage()],...extra});
const item=(id='wi1',extra={})=>({id,itemKey:'TASK-'+id,itemType:'TASK',title:'WorkItem '+id,status:'OPEN',priority:'P1',milestoneId:null,iterationId:null,stageKey:'AIGC_00_INIT',...extra});
const governance=(id='p1',extra={})=>({project:{...project(id),health:null},milestones:[],iterations:[],workItems:[item()],dependencies:[],blockers:[],decisions:[],risks:[],...extra});
const event=(id='ev1',extra={})=>({id,projectId:'p1',projectStageInstanceId:'si1',targetStageInstanceId:null,transitionType:'ADVANCE',fromStageKey:'AIGC_00_INIT',toStageKey:'AIGC_01_DISCOVERY',attemptNo:1,actorKey:'fixture-principal',createdAt:'2026-10-01T10:00:00Z',decision:{status:'SECRET_DECISION'},evidence:{note:'SECRET_EVIDENCE'},runId:'registered-run',taskId:null,gateResultId:'registered-gate',checkpointId:null,...extra});

export {project,stage,lifecycle,item,governance,event};

// Only this synthetic browser suite is assessed. Real Runtime authorization,
// asset access and staging/production release approval remain separate gates.
export const EXPECTED_BROWSER_CASES=Object.freeze(["A0-02", "A0-03", "A0-05", "A0-06", "A1-01", "A1-02", "A1-04", "A2-01", "A2-03", "A2-04", "A3-01", "A3-03", "A3-04", "A3-05", "A3-06", "A3-09", "A3-10", "A3-11", "A4-01", "A4-02", "A4-04", "A4-05"]);
export function summarizeBrowserRegression(checks,errors=[]){
 const rows=Array.isArray(checks)?checks:[];
 const ids=rows.map(row=>row?.id);
 const missing=EXPECTED_BROWSER_CASES.filter(id=>!ids.includes(id));
 const unexpected=ids.filter(id=>!EXPECTED_BROWSER_CASES.includes(id));
 const duplicates=ids.filter((id,index)=>ids.indexOf(id)!==index);
 const nonPassing=rows.filter(row=>row?.status!=='PASS').map(row=>({id:row?.id,status:row?.status}));
 const invalidClassification=rows.filter(row=>row?.classification!=='ACTUAL_CHROMIUM_SYNTHETIC_RUNTIME_BFF').map(row=>row?.id);
 const passed=Array.isArray(checks)&&rows.length===EXPECTED_BROWSER_CASES.length&&
  !missing.length&&!unexpected.length&&!duplicates.length&&!nonPassing.length&&
  !invalidClassification.length&&Array.isArray(errors)&&errors.length===0;
 return {status:passed?'PASS':'FAIL',expectedCount:EXPECTED_BROWSER_CASES.length,
  observedCount:rows.length,missing,unexpected,duplicates,nonPassing,invalidClassification,
  pageErrors:Array.isArray(errors)?errors:['INVALID_PAGE_ERRORS_REPORT']};
}
