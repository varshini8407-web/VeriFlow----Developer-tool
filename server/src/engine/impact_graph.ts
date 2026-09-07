import { DependencyGraph, DependencyNode, DependencyEdge } from '../db/schema.js';

export function generateImpactGraph(
  changedFiles: string[],
  hasTimezoneBug: boolean,
  hasDuplicateBug: boolean
): DependencyGraph {
  const isBuggy = hasTimezoneBug || hasDuplicateBug;

  const nodes: DependencyNode[] = [
    {
      id: 'n1',
      name: 'validate_and_apply()',
      type: 'function',
      path: 'services/coupon_service.py',
      risk: isBuggy ? 'critical' : 'clean',
      changed: true,
      details: isBuggy
        ? 'Modified coupon validation logic. Unhandled timezone shift.'
        : 'Patched UTC normalized timezone comparisons.'
    },
    {
      id: 'n2',
      name: 'CouponService',
      type: 'service',
      path: 'services/coupon_service.py',
      risk: isBuggy ? 'high' : 'clean',
      changed: true,
      details: 'Core discount business service.'
    },
    {
      id: 'n3',
      name: 'POST /api/v1/checkout/apply-coupon',
      type: 'endpoint',
      path: 'controllers/checkout_controller.py',
      risk: isBuggy ? 'medium' : 'clean',
      changed: false,
      details: 'Public HTTP REST checkout endpoint.'
    },
    {
      id: 'n4',
      name: 'OrderRepository (coupon_redemptions)',
      type: 'database',
      path: 'repositories/order_repository.py',
      risk: isBuggy ? 'medium' : 'clean',
      changed: false,
      details: 'Stores customer promotion redemption history.'
    },
    {
      id: 'n5',
      name: 'test_coupon_service.py',
      type: 'test',
      path: 'tests/test_coupon_service.py',
      risk: isBuggy ? 'critical' : 'clean',
      changed: false,
      details: isBuggy ? '2 failing assertions detected.' : '100% test assertions passing.'
    }
  ];

  const edges: DependencyEdge[] = [
    { source: 'n1', target: 'n2', label: 'member_of', type: 'calls' },
    { source: 'n3', target: 'n2', label: 'depends_on', type: 'calls' },
    { source: 'n2', target: 'n4', label: 'queries', type: 'queries' },
    { source: 'n5', target: 'n1', label: 'verifies', type: 'tests' }
  ];

  const affectedSummary = [
    'services/coupon_service.py (Direct Modification)',
    'controllers/checkout_controller.py (Caller Endpoint)',
    'repositories/order_repository.py (Downstream Data Layer)',
    'tests/test_coupon_service.py (Verification Suite)'
  ];

  return { nodes, edges, affectedSummary };
}
