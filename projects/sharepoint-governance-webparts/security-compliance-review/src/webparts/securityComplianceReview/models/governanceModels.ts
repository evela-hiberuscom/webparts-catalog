export type GovernanceSeverity = 'low' | 'medium' | 'high' | 'critical';
export type GovernanceConfidence = 'low' | 'medium' | 'high';
export type GovernanceFindingStatus = 'pending' | 'inReview' | 'approved' | 'rejected' | 'remediated' | 'exception';
export type GovernanceActionType = 'review' | 'campaign' | 'dryRun' | 'export' | 'configure';

export interface IGovernanceMetric {
  id: string;
  label: string;
  value: number | string;
  unit: string;
  severity: GovernanceSeverity;
  description: string;
}

export interface IGovernanceFinding {
  id: string;
  title: string;
  severity: GovernanceSeverity;
  confidence: GovernanceConfidence;
  status: GovernanceFindingStatus;
  owner: string;
  entityUrl: string;
  evidence: string;
  recommendation: string;
  sourceSystem: string;
  dueDate: string;
}

export interface IGovernanceRecommendation {
  id: string;
  title: string;
  rationale: string;
  actionType: GovernanceActionType;
  destructive: boolean;
}

export interface IGovernanceDashboardData {
  initiativeId: string;
  initiativeTitle: string;
  phase: string;
  initiativeType: string;
  sourceLabel: string;
  lastUpdated: string;
  mockMode: boolean;
  backendRequired: boolean;
  limitations: string[];
  metrics: IGovernanceMetric[];
  findings: IGovernanceFinding[];
  recommendations: IGovernanceRecommendation[];
}

export interface IGovernanceDashboardConfig {
  title: string;
  subtitle: string;
  maxItems: number;
  showDetails: boolean;
}

export interface IGovernanceDashboardLabels {
  loadingLabel: string;
  emptyTitle: string;
  emptyMessage: string;
  errorTitle: string;
  errorMessage: string;
  retryButtonLabel: string;
  sourceLabel: string;
  mockModeLabel: string;
  backendRequiredLabel: string;
  riskLabel: string;
  recommendationsLabel: string;
  evidenceLabel: string;
  statusLabel: string;
  severityLabel: string;
  confidenceLabel: string;
  lastUpdatedLabel: string;
  limitationsLabel: string;
}

export interface IGovernanceDashboardViewModel extends IGovernanceDashboardData {
  visibleFindings: IGovernanceFinding[];
}
