import type { ScanGlobalStatus } from './siteReport';

export interface IScanConfiguration {
  reportListUrl: string;
  batchSize: number;
  maxRequestsPerSecond: number;
  scope: 'all' | 'manual';
  manualSiteUrls: string[];
}

export interface IScanProgress {
  globalStatus: ScanGlobalStatus;
  totalSites: number;
  completedSites: number;
  currentSiteUrl: string | undefined;
  currentSiteTitle: string | undefined;
  startedAt: string | undefined;
  estimatedRemainingSeconds: number | undefined;
  errors: IScanError[];
  lastThrottleAt: string | undefined;
  isPaused: boolean;
}

export interface IScanError {
  siteUrl: string;
  message: string;
  timestamp: string;
  httpStatus: number | undefined;
}

export interface IScanState {
  configuration: IScanConfiguration;
  progress: IScanProgress;
}

export function createInitialProgress(): IScanProgress {
  return {
    globalStatus: 'idle',
    totalSites: 0,
    completedSites: 0,
    currentSiteUrl: undefined,
    currentSiteTitle: undefined,
    startedAt: undefined,
    estimatedRemainingSeconds: undefined,
    errors: [],
    lastThrottleAt: undefined,
    isPaused: false
  };
}

export function createDefaultConfiguration(): IScanConfiguration {
  return {
    reportListUrl: '',
    batchSize: 10,
    maxRequestsPerSecond: 4,
    scope: 'all',
    manualSiteUrls: []
  };
}
