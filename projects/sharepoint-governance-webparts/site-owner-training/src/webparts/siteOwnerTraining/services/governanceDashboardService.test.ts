import type { IGovernanceFinding } from '../models/governanceModels';
import { GovernanceDashboardService, normalizeMaxItems, selectVisibleFindings } from './governanceDashboardService';

const findings: IGovernanceFinding[] = [
  {
    id: 'low',
    title: 'Low risk',
    severity: 'low',
    confidence: 'high',
    status: 'pending',
    owner: 'Owner',
    entityUrl: '/sites/low',
    evidence: 'Low evidence',
    recommendation: 'Review later',
    sourceSystem: 'Mock',
    dueDate: '2026-08-01'
  },
  {
    id: 'critical',
    title: 'Critical risk',
    severity: 'critical',
    confidence: 'medium',
    status: 'pending',
    owner: 'Owner',
    entityUrl: '/sites/critical',
    evidence: 'Critical evidence',
    recommendation: 'Review now',
    sourceSystem: 'Mock',
    dueDate: '2026-06-01'
  }
];

describe('governanceDashboardService', () => {
  it('normalizes invalid limits to the safe default', () => {
    expect(normalizeMaxItems(0)).toBe(5);
    expect(normalizeMaxItems(99)).toBe(10);
  });

  it('prioritizes higher risk findings before lower risk findings', () => {
    expect(selectVisibleFindings(findings, 2)[0].id).toBe('critical');
  });

  it('returns a mock-backed view model with visible findings', async () => {
    const service = new GovernanceDashboardService();
    const result = await service.loadDashboard({
      title: 'Governance',
      subtitle: 'Mock',
      maxItems: 2,
      showDetails: true
    });

    expect(result.mockMode).toBe(true);
    expect(result.backendRequired).toBe(true);
    expect(result.visibleFindings.length).toBeGreaterThan(0);
  });
});
