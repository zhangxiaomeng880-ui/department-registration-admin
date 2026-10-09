export function evaluateHandoff({ auditResult, humanReviewTasks = [], userConfirmationRequired = false, userConfirmed = false }) {
  if (!auditResult) {
    return { handoff_allowed: false, reason: 'AUDIT_RESULT_MISSING' };
  }

  if (!['PASS', 'PASS_WITH_FINDINGS'].includes(auditResult.result) || auditResult.blocking === true) {
    return { handoff_allowed: false, reason: 'AUDIT_GATE_BLOCKED' };
  }

  const unresolvedHumanReview = humanReviewTasks.some(
    (task) => task.responsibility_level === 'HUMAN_REVIEW_REQUIRED' && task.status !== 'RESOLVED'
  );

  if (unresolvedHumanReview) {
    return { handoff_allowed: false, reason: 'HUMAN_REVIEW_BLOCKED' };
  }

  if (userConfirmationRequired && !userConfirmed) {
    return { handoff_allowed: false, reason: 'USER_CONFIRMATION_REQUIRED' };
  }

  return { handoff_allowed: true, reason: 'ALL_REQUIRED_GATES_SATISFIED' };
}

export function nextPhaseState({ handoff_allowed }) {
  return handoff_allowed ? 'READY_FOR_NEXT_PHASE' : 'BLOCKED';
}
