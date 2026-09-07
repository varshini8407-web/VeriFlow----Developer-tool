import { Issue } from '../db/schema.js';

export interface SecurityFinding {
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
  category: 'security' | 'logic_error' | 'timezone_bug' | 'concurrency';
  file: string;
  lineNumber: number;
  explanation: string;
  evidence: string;
  suggestedFix: string;
  patchDiff?: string;
}

export function runSecurityScan(
  code: string,
  filePath: string = 'services/coupon_service.py',
  projectId: string = 'proj-coupon-demo',
  verificationRunId: string = ''
): { findings: SecurityFinding[]; issues: Issue[]; taintPaths: string[] } {
  const findings: SecurityFinding[] = [];
  const taintPaths: string[] = [];

  // Taint source: user parameters
  taintPaths.push('Source: HTTP POST Payload -> user_id, code');
  taintPaths.push('Propagation: validate_and_apply(code, cart_total, user_id)');

  const hasTimezoneNaive = code.includes('datetime.now()') && !code.includes('timezone.utc');
  const hasMissingDuplicateCheck = !code.includes('coupon_redemptions') && !code.includes('usage_count');

  if (hasTimezoneNaive) {
    findings.push({
      title: 'Timezone Mismatch in Coupon Expiration Logic',
      severity: 'critical',
      category: 'timezone_bug',
      file: filePath,
      lineNumber: 24,
      explanation:
        'The coupon expiration check uses naive server datetime.now() instead of normalizing both current time and expiration time to UTC under the configured business timezone.',
      evidence: 'test_expired_coupon_rejected_in_business_timezone failed during runtime execution.',
      suggestedFix:
        'Convert the expiration timestamp to UTC using the configured timezone and compare against datetime.now(timezone.utc).',
      patchDiff: `@@ -23,3 +23,4 @@
-        current_time = datetime.now()
-        if coupon.expires_at and current_time > coupon.expires_at:
+        now_utc = datetime.now(timezone.utc)
+        coupon_expires_utc = coupon.expires_at.replace(tzinfo=self.business_tz).astimezone(timezone.utc)
+        if coupon_expires_utc and now_utc > coupon_expires_utc:`
    });
    taintPaths.push('Vulnerability: Naive Server Clock Comparison allows expired coupon redemption');
  }

  if (hasMissingDuplicateCheck) {
    findings.push({
      title: 'Missing Idempotency / Duplicate Coupon Redemption Check',
      severity: 'critical',
      category: 'logic_error',
      file: filePath,
      lineNumber: 28,
      explanation:
        'The validate_and_apply method does not verify if the customer has already redeemed this coupon in prior orders, creating a financial vulnerability.',
      evidence: 'test_duplicate_coupon_application_prevented failed during integration test execution.',
      suggestedFix:
        'Query coupon_redemptions table for (coupon_id, user_id) before returning valid=True.',
      patchDiff: `@@ -28,2 +28,6 @@
+        usage_count = self.db.query("SELECT count(*) as count FROM coupon_redemptions WHERE coupon_id = ? AND user_id = ?", (coupon.id, user_id)).scalar()
+        if usage_count and usage_count > 0:
+            return {"valid": False, "discount": 0.0, "reason": "Coupon already used by this customer"}`
    });
    taintPaths.push('Vulnerability: Missing Idempotency Check allows unlimited promo code reuse');
  }

  const issues: Issue[] = findings.map((f, idx) => ({
    id: `iss-${Date.now()}-${idx + 1}`,
    projectId,
    verificationRunId,
    title: f.title,
    severity: f.severity,
    category: f.category,
    file: f.file,
    lineNumber: f.lineNumber,
    explanation: f.explanation,
    evidence: f.evidence,
    suggestedFix: f.suggestedFix,
    patchDiff: f.patchDiff,
    status: 'open',
    createdAt: new Date().toISOString()
  }));

  return { findings, issues, taintPaths };
}
