import assert from 'node:assert/strict';
import { evaluateHandoff, nextPhaseState } from './phase-handoff-gate.mjs';

const auditPass = { result: 'PASS', blocking: false };
const auditFail = { result: 'FAIL', blocking: true };

let result = evaluateHandoff({ auditResult: auditFail });
assert.equal(result.handoff_allowed, false);
assert.equal(result.reason, 'AUDIT_GATE_BLOCKED');
assert.equal(nextPhaseState(result), 'BLOCKED');

result = evaluateHandoff({ auditResult: auditPass, humanReviewTasks: [{ responsibility_level: 'HUMAN_REVIEW_REQUIRED', status: 'OPEN' }] });
assert.equal(result.handoff_allowed, false);
assert.equal(result.reason, 'HUMAN_REVIEW_BLOCKED');

result = evaluateHandoff({ auditResult: auditPass, humanReviewTasks: [{ responsibility_level: 'HUMAN_REVIEW_REQUIRED', status: 'RESOLVED' }] });
assert.equal(result.handoff_allowed, true);
assert.equal(nextPhaseState(result), 'READY_FOR_NEXT_PHASE');

result = evaluateHandoff({ auditResult: auditPass, userConfirmationRequired: true, userConfirmed: false });
assert.equal(result.handoff_allowed, false);
assert.equal(result.reason, 'USER_CONFIRMATION_REQUIRED');

result = evaluateHandoff({ auditResult: auditPass, userConfirmationRequired: true, userConfirmed: true });
assert.equal(result.handoff_allowed, true);

console.log('AI Native 2.0 handoff gate tests: PASS');
