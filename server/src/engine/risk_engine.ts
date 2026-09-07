import { VerificationDecision, TestCase, Requirement, Issue } from '../db/schema.js';

export interface RiskEvaluationResult {
  score: number; // 0 to 100
  shipConfidence: number; // 0 to 100
  decision: VerificationDecision;
  factors: { factor: string; points: number; severity: 'critical' | 'high' | 'medium' | 'low' }[];
  hardRuleViolations: string[];
}

export function evaluateRisk(
  testCases: TestCase[],
  requirements: Requirement[],
  issues: Issue[],
  level: 'quick' | 'standard' | 'strict' = 'standard'
): RiskEvaluationResult {
  let score = 0;
  const factors: { factor: string; points: number; severity: 'critical' | 'high' | 'medium' | 'low' }[] = [];
  const hardRuleViolations: string[] = [];

  // Check critical test failures
  const failedTests = testCases.filter((t) => t.status === 'failed');
  if (failedTests.length > 0) {
    score += 35;
    factors.push({
      factor: `${failedTests.length} Automated Test Failure(s) detected`,
      points: 35,
      severity: 'critical'
    });
    hardRuleViolations.push('Critical automated test assertions failed.');
  }

  // Check critical/high security issues
  const criticalIssues = issues.filter((i) => i.severity === 'critical');
  if (criticalIssues.length > 0) {
    score += 40;
    factors.push({
      factor: `${criticalIssues.length} Critical Issue(s) found (Timezone/Idempotency defect)`,
      points: 40,
      severity: 'critical'
    });
    hardRuleViolations.push('Critical logic or security vulnerability detected.');
  }

  // Check unverified requirements
  const failedReqs = requirements.filter((r) => r.status === 'failed' || r.status === 'unverified');
  if (failedReqs.length > 0) {
    score += 20;
    factors.push({
      factor: `${failedReqs.length} Acceptance Criteria unmet or unverified`,
      points: 20,
      severity: 'high'
    });
  }

  // Clamp score
  score = Math.min(100, score);

  // Hard rules evaluation
  let decision: VerificationDecision = 'SHIP';

  if (hardRuleViolations.length > 0 || score >= 50) {
    decision = 'BLOCK';
  } else if (score >= 20 || failedReqs.length > 0) {
    decision = 'REVIEW';
  } else {
    decision = 'SHIP';
  }

  // Calculate Ship Confidence percentage
  const shipConfidence = Math.max(0, Math.min(100, 100 - score));

  return {
    score,
    shipConfidence,
    decision,
    factors,
    hardRuleViolations
  };
}
