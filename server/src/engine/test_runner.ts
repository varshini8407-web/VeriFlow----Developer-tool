import { TestCase } from '../db/schema.js';

export interface TestExecutionResult {
  testCases: TestCase[];
  passedCount: number;
  failedCount: number;
  durationMs: number;
  rawOutput: string[];
}

export function executeTestSuite(
  code: string,
  verificationRunId: string = ''
): TestExecutionResult {
  const hasTimezoneBug = code.includes('datetime.now()') && !code.includes('timezone.utc');
  const hasDuplicateBug = !code.includes('coupon_redemptions') && !code.includes('usage_count');

  const testCases: TestCase[] = [
    {
      id: `tc-1-${Date.now()}`,
      verificationRunId,
      name: 'test_apply_valid_coupon',
      category: 'positive',
      description: 'Ensures 20% discount applies correctly on $100 cart yielding $80 total.',
      file: 'tests/test_coupon_service.py',
      code: `def test_apply_valid_coupon(mock_db, mock_config):
    service = CouponService(mock_db, mock_config)
    result = service.validate_and_apply("SUMMER20", 100.0, "user_123")
    assert result["valid"] is True
    assert result["discount"] == 20.0
    assert result["final_total"] == 80.0`,
      status: 'passed',
      durationMs: 14,
      stdout: '[PASS] validate_and_apply returned valid=True, discount=20.0'
    },
    {
      id: `tc-2-${Date.now()}`,
      verificationRunId,
      name: 'test_expired_coupon_rejected_in_business_timezone',
      category: 'boundary',
      description: 'Validates coupon expiration under configured America/New_York timezone boundary.',
      file: 'tests/test_coupon_service.py',
      code: `def test_expired_coupon_rejected_in_business_timezone(mock_db, mock_config):
    service = CouponService(mock_db, mock_config)
    result = service.validate_and_apply("FLASH50", 100.0, "user_123")
    assert result["valid"] is False
    assert "expired" in result["reason"].lower()`,
      status: hasTimezoneBug ? 'failed' : 'passed',
      durationMs: 31,
      errorMessage: hasTimezoneBug
        ? 'AssertionError: assert result["valid"] is False, Got True!'
        : undefined,
      stackTrace: hasTimezoneBug
        ? `Traceback (most recent call last):
  File "tests/test_coupon_service.py", line 18, in test_expired_coupon_rejected_in_business_timezone
    assert result["valid"] is False
AssertionError: Coupon was accepted after expiration time due to naive server clock comparison.`
        : undefined,
      stdout: hasTimezoneBug
        ? '[FAIL] Expected valid=False, received valid=True'
        : '[PASS] Coupon properly rejected when current UTC time exceeds expiration.'
    },
    {
      id: `tc-3-${Date.now()}`,
      verificationRunId,
      name: 'test_duplicate_coupon_application_prevented',
      category: 'security',
      description: 'Checks idempotency so a single customer cannot redeem same promo code multiple times.',
      file: 'tests/test_coupon_service.py',
      code: `def test_duplicate_coupon_application_prevented(mock_db, mock_config):
    service = CouponService(mock_db, mock_config)
    res1 = service.validate_and_apply("WELCOME10", 100.0, "user_999")
    assert res1["valid"] is True
    res2 = service.validate_and_apply("WELCOME10", 100.0, "user_999")
    assert res2["valid"] is False
    assert "already used" in res2["reason"].lower()`,
      status: hasDuplicateBug ? 'failed' : 'passed',
      durationMs: 22,
      errorMessage: hasDuplicateBug
        ? 'AssertionError: Second redemption succeeded when it should fail.'
        : undefined,
      stackTrace: hasDuplicateBug
        ? `Traceback (most recent call last):
  File "tests/test_coupon_service.py", line 26, in test_duplicate_coupon_application_prevented
    assert res2["valid"] is False
AssertionError: validate_and_apply did not query previous coupon_redemptions records.`
        : undefined,
      stdout: hasDuplicateBug
        ? '[FAIL] User allowed to apply one-time coupon multiple times'
        : '[PASS] Subsequent redemption blocked with "already used" reason.'
    },
    {
      id: `tc-4-${Date.now()}`,
      verificationRunId,
      name: 'test_invalid_coupon_rejected',
      category: 'negative',
      description: 'Verifies unknown code returns valid=False without throwing unexpected exceptions.',
      file: 'tests/test_coupon_service.py',
      code: `def test_invalid_coupon_rejected(mock_db, mock_config):
    service = CouponService(mock_db, mock_config)
    result = service.validate_and_apply("NONEXISTENT", 100.0, "user_123")
    assert result["valid"] is False
    assert "does not exist" in result["reason"].lower()`,
      status: 'passed',
      durationMs: 9,
      stdout: '[PASS] Nonexistent coupon handled gracefully with 422 reason.'
    },
    {
      id: `tc-5-${Date.now()}`,
      verificationRunId,
      name: 'test_sql_injection_sanitization',
      category: 'regression',
      description: 'Ensures code input parameter containing SQL escape quotes is bound safely.',
      file: 'tests/test_coupon_service.py',
      code: `def test_sql_injection_sanitization(mock_db, mock_config):
    service = CouponService(mock_db, mock_config)
    result = service.validate_and_apply("' OR '1'='1", 100.0, "user_123")
    assert result["valid"] is False`,
      status: 'passed',
      durationMs: 11,
      stdout: '[PASS] Parameterized SQL prevented injection attempt.'
    },
    {
      id: `tc-6-${Date.now()}`,
      verificationRunId,
      name: 'test_cart_zero_floor_boundary',
      category: 'boundary',
      description: 'Asserts discount cannot exceed cart total into negative invoice values.',
      file: 'tests/test_coupon_service.py',
      code: `def test_cart_zero_floor_boundary(mock_db, mock_config):
    service = CouponService(mock_db, mock_config)
    result = service.validate_and_apply("SUPER150", 50.0, "user_123")
    assert result["final_total"] >= 0.0`,
      status: 'passed',
      durationMs: 10,
      stdout: '[PASS] Final total floored cleanly at 0.0.'
    }
  ];

  const passedCount = testCases.filter((t) => t.status === 'passed').length;
  const failedCount = testCases.filter((t) => t.status === 'failed').length;
  const durationMs = testCases.reduce((acc, t) => acc + t.durationMs, 0);

  const rawOutput = testCases.map(
    (t) => `[${t.status.toUpperCase()}] ${t.name} (${t.durationMs}ms) - ${t.status === 'passed' ? 'OK' : t.errorMessage}`
  );

  return { testCases, passedCount, failedCount, durationMs, rawOutput };
}
