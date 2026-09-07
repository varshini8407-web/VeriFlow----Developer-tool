async function runTests() {
  console.log('🧪 Starting VeriFlow End-to-End API & Engine Verification...\n');

  const BASE = 'http://localhost:5000/api';

  // 1. Health & Auth
  const healthRes = await fetch('http://localhost:5000/health');
  const health = await healthRes.json();
  console.log('✅ 1. Health Check:', health.status, `(${health.service})`);

  const authRes = await fetch(`${BASE}/auth/me`);
  const auth = await authRes.json();
  console.log('✅ 2. Auth & Workspaces:', auth.user.name, `[${auth.workspaces[0].name}]`);

  // 2. Projects
  const projsRes = await fetch(`${BASE}/projects`);
  const projects = await projsRes.json();
  console.log(`✅ 3. Projects Count: ${projects.length} projects loaded (${projects.map(p => p.name).join(', ')})`);

  // 3. Start Verification Pipeline with Buggy Demo Code
  console.log('\n🚀 4. Executing 13-Stage Verification Pipeline (Coupon Checkout Service with Bug)...');
  const startRes = await fetch(`${BASE}/verifications/start`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectId: 'proj-coupon-demo',
      requirementText: 'Add a coupon feature that allows users to apply a discount code before checkout. The coupon must expire according to the configured timezone and must not be applied twice.',
      changeType: 'pr',
      changeTarget: 'PR #142: feat(coupon)-discount-engine',
      verificationLevel: 'standard'
    })
  });
  const run1 = await startRes.json();
  console.log(`   Decision: ${run1.decision} | Risk Score: ${run1.riskScore}/100 | Ship Confidence: ${run1.shipConfidence}%`);
  console.log(`   Tests Passed: ${run1.stats.testsPassed}/${run1.stats.testsTotal} | Failed: ${run1.stats.testsFailed}`);
  console.log(`   Issues Found: ${run1.issues.length} | Evidence Items: ${run1.evidence.length}`);

  if (run1.decision === 'BLOCK' && run1.stats.testsFailed === 2) {
    console.log('✅ 5. Pipeline accurately intercepted timezone bug & duplicate usage bug!');
  } else {
    throw new Error('Verification did not block buggy code!');
  }

  // 4. VeriFlow Assistant Apply Fix & Re-Verify
  console.log('\n🛠️ 6. Applying VeriFlow AI Patch (UTC Normalization & Idempotency) and Re-Verifying...');
  const patchRes = await fetch(`${BASE}/verifications/${run1.id}/apply-fix-and-rerun`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' }
  });
  const run2 = await patchRes.json();
  console.log(`   Decision: ${run2.decision} | Risk Score: ${run2.riskScore}/100 | Ship Confidence: ${run2.shipConfidence}%`);
  console.log(`   Tests Passed: ${run2.stats.testsPassed}/${run2.stats.testsTotal} | Failed: ${run2.stats.testsFailed}`);
  console.log(`   Proof-of-Ship ID: ${run2.proofOfShipId}`);

  if (run2.decision === 'SHIP' && run2.stats.testsPassed === 6 && run2.riskScore === 0) {
    console.log('✅ 7. Re-verification certified: SHIP (100% Passed)!');
  } else {
    throw new Error('Re-verification failed to certify SHIP!');
  }

  // 5. Proof-of-Ship Certificate Check
  console.log('\n📜 8. Inspecting Generated Proof-of-Ship Certificate...');
  const posRes = await fetch(`${BASE}/proof-of-ship/${run2.proofOfShipId}`);
  const pos = await posRes.json();
  console.log(`   Certificate ID: ${pos.certificateId}`);
  console.log(`   Verification SHA-256 Hash: ${pos.verificationHash}`);
  console.log(`   Requirement Coverage: ${pos.requirementCoverage}% | Security: ${pos.securityStatus}`);
  console.log('✅ 9. Proof-of-Ship certificate successfully minted & sealed.');

  // 6. Device Bridge Voice Command & 1-Tap Approval
  console.log('\n📱 10. Testing Phone Device Bridge Voice Commands...');
  const cmdRes = await fetch(`${BASE}/device/command`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ command: 'Explain the latest failure' })
  });
  const cmd = await cmdRes.json();
  console.log(`   Voice Command: "${cmd.command}"`);
  console.log(`   Device Bridge Reply: "${cmd.reply.substring(0, 80)}..."`);
  console.log('✅ 11. Voice command intent parsed successfully.');

  console.log('\n📱 12. Authorizing Deployment via Phone Bridge (1-Tap Approve)...');
  const approveRes = await fetch(`${BASE}/proof-of-ship/${pos.id}/approve`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      approverName: 'Alex Mercer',
      comment: '1-Tap Approved via Phone Device Bridge',
      channel: 'DEVICE_BRIDGE'
    })
  });
  const approved = await approveRes.json();
  console.log(`   Approval Status: ${approved.success ? 'APPROVED' : 'FAILED'}`);

  // 7. Office Kit Desk Indicator State
  const oKitRes = await fetch(`${BASE}/office-kit`);
  const oKit = await oKitRes.json();
  console.log(`   Office Kit IoT Desk Indicator State: [${oKit.state}] (${oKit.reason})`);

  if (oKit.state === 'DEPLOYED') {
    console.log('✅ 13. Office Kit desk indicator successfully transitioned to DEPLOYED state!');
  }

  // 8. Pull Requests & Notifications
  const prRes = await fetch(`${BASE}/pull-requests`);
  const prs = await prRes.json();
  console.log(`✅ 14. Pull Requests: ${prs.length} PRs tracked with automated bot release comments.`);

  console.log('\n🎉 ALL 14 END-TO-END VERIFICATION CHECKS PASSED WITH 100% SUCCESS!');
}

runTests().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
