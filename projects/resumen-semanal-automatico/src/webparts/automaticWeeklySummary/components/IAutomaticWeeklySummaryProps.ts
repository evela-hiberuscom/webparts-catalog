import type { IWeeklySummaryService, SummaryPeriodMode } from '../models/weeklySummaryTypes';

export interface IAutomaticWeeklySummaryProps {
  title: string;
  subtitle: string;
  periodMode: SummaryPeriodMode;
  maxItems: number;
  customRangeStart?: string;
  customRangeEnd?: string;
  service: IWeeklySummaryService;
}
