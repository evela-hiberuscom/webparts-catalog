import type { IGovernanceDashboardData } from '../models/governanceModels';

export const mockGovernanceDashboardData: IGovernanceDashboardData = {
  initiativeId: 'GOV-15',
  initiativeTitle: "Definir límites de sincronización con OneDrive",
  phase: "Fase 5",
  initiativeType: "Policy visibility + integración endpoint",
  sourceLabel: 'Mock data aligned with Governance Pack GOV-15',
  lastUpdated: '2026-05-28T00:00:00.000Z',
  mockMode: true,
  backendRequired: true,
  limitations: [
    'No backend is connected yet; values are representative and must not be used as tenant evidence.',
    'Real enforcement must remain in Microsoft 365 admin, SharePoint, Purview, SAM or approved backend jobs.',
    'Destructive operations are intentionally not implemented in the SPFx client.'
  ],
  metrics: [
    {
      id: 'coverage',
      label: 'Coverage',
      value: 74,
      unit: '%',
      severity: 'high',
      description: 'Estimated data coverage for the MVP scenario.'
    },
    {
      id: 'open-findings',
      label: 'Open findings',
      value: 8,
      unit: '',
      severity: 'high',
      description: 'Mock findings that require review or validation.'
    },
    {
      id: 'owner-actions',
      label: 'Owner actions',
      value: 4,
      unit: '',
      severity: 'medium',
      description: 'Recommended owner or admin follow-up actions.'
    }
  ],
  findings: [
    {
      id: 'GOV-15-F01',
      title: "Definir límites de sincronización con OneDrive - evidencia parcial",
      severity: 'high',
      confidence: 'medium',
      status: 'pending',
      owner: 'SharePoint Admin',
      entityUrl: '/sites/governance-sample',
      evidence: 'Se requiere integrar backend para confirmar datos reales.',
      recommendation: 'Validar cobertura de fuente, permisos y licencia antes de habilitar acciones.',
      sourceSystem: 'Mock',
      dueDate: '2026-06-30'
    },
    {
      id: 'GOV-15-F02',
      title: "Definir límites de sincronización con OneDrive - campaña de revisión",
      severity: 'high',
      confidence: 'high',
      status: 'inReview',
      owner: 'Site Owner',
      entityUrl: '/sites/owner-review',
      evidence: 'El Governance Pack recomienda revisión humana y trazabilidad.',
      recommendation: 'Crear campaña limitada por oleadas y registrar respuesta del responsable.',
      sourceSystem: 'Manual',
      dueDate: '2026-07-15'
    },
    {
      id: 'GOV-15-F03',
      title: "Definir límites de sincronización con OneDrive - integración pendiente",
      severity: 'medium',
      confidence: 'low',
      status: 'exception',
      owner: 'Governance Team',
      entityUrl: '/sites/integration-backlog',
      evidence: 'Pendiente contrato backend para Graph, CSOM, Purview o SAM.',
      recommendation: 'Mantener modo mock visible hasta disponer de API segura.',
      sourceSystem: 'Mock',
      dueDate: '2026-08-15'
    }
  ],
  recommendations: [
    {
      id: 'GOV-15-R01',
      title: 'Connect read-only backend',
      rationale: 'The webpart must consume audited backend data instead of client-side tenant calls.',
      actionType: 'review',
      destructive: false
    },
    {
      id: 'GOV-15-R02',
      title: 'Run owner validation campaign',
      rationale: 'Human validation reduces false positives before any operational decision.',
      actionType: 'campaign',
      destructive: false
    },
    {
      id: 'GOV-15-R03',
      title: 'Keep remediation outside SPFx',
      rationale: 'High-risk changes require dry-run, approvals, audit and rollback planning.',
      actionType: 'dryRun',
      destructive: false
    }
  ]
};
