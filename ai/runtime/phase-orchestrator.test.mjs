import assert from 'node:assert/strict';
import { runPhase } from './phase-orchestrator.mjs';

const pass = runPhase({
  projectId: 'p1', phaseId: 'design', taskId: 't1', agentId: 'design-agent',
  auditResult: { result: 'PASS', blocking: false },
  humanReviewTasks: [{ responsibility_level: 'HUMAN_REVIEW_REQUIRED', status: 'RESOLVED' }]
});
assert.equal(pass.phaseHandoff.handoff_allowed, true);
assert.equal(pass.phaseHandoff.next_phase_state, 'READY_FOR_NEXT_PHASE');
assert.equal(pass.executionRecord.project_id, 'p1');

const blockedAudit = runPhase({
  projectId: 'p1', phaseId: 'design', taskId: 't2', agentId: 'design-agent',
  auditResult: { result: 'FAIL', blocking: true }
});
assert.equal(blockedAudit.phaseHandoff.handoff_allowed, false);
assert.equal(blockedAudit.phaseHandoff.next_phase_state, 'BLOCKED');

const blockedHuman = runPhase({
  projectId: 'p1', phaseId: 'design', taskId: 't3', agentId: 'design-agent',
  auditResult: { result: 'PASS', blocking: false },
  humanReviewTasks: [{ responsibility_level: 'HUMAN_REVIEW_REQUIRED', status: 'OPEN' }]
});
assert.equal(blockedHuman.phaseHandoff.handoff_allowed, false);
assert.equal(blockedHuman.phaseHandoff.next_phase_state, 'BLOCKED');

console.log('AI Native 2.0 phase orchestrator tests: PASS');
