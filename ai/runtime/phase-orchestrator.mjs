import { evaluateHandoff, nextPhaseState } from './phase-handoff-gate.mjs';

export function runPhase({ projectId, phaseId, taskId, agentId, auditResult, humanReviewTasks = [], userConfirmationRequired = false, userConfirmed = false }) {
  const start = new Date().toISOString();
  const gate = evaluateHandoff({ auditResult, humanReviewTasks, userConfirmationRequired, userConfirmed });
  const status = nextPhaseState(gate);
  const end = new Date().toISOString();

  return {
    executionRecord: {
      execution_id: `${projectId}:${phaseId}:${taskId}`,
      project_id: projectId,
      phase_id: phaseId,
      task_id: taskId,
      agent_id: agentId,
      start_at: start,
      end_at: end,
      status,
      audit_result: auditResult,
      gate_result: gate
    },
    phaseHandoff: {
      phase_id: phaseId,
      audit_gate_result: auditResult,
      handoff_allowed: gate.handoff_allowed,
      next_phase_state: status
    }
  };
}
