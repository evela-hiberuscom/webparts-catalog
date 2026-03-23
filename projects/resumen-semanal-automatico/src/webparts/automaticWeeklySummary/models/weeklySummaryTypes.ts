export type SummaryPeriodMode = 'currentWeek' | 'previousWeek' | 'customRange';

export type WeeklyHighlightType = 'news' | 'milestone' | 'incident' | 'task' | 'generic';

export type WeeklySummaryStatus = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface IWeeklySummaryRange {
  start: Date;
  end: Date;
  label: string;
  isCustom: boolean;
}

export interface IWeeklyHighlight {
  id: string;
  title: string;
  highlightType: WeeklyHighlightType;
  date?: string;
  openUrl?: string;
  priority?: number;
  sourceName: string;
  summary?: string;
  isPartial?: boolean;
}

export interface IWeeklySummaryRequest {
  periodMode: SummaryPeriodMode;
  maxItems: number;
  customRangeStart?: string;
  customRangeEnd?: string;
  referenceDate?: Date;
}

export interface IWeeklySummaryResult {
  items: IWeeklyHighlight[];
  periodLabel: string;
  hasPartialData: boolean;
  status: WeeklySummaryStatus;
  sourceCount: number;
  range: IWeeklySummaryRange;
}

export interface IWeeklySummarySourceRepository {
  loadHighlights(request: IWeeklySummaryRequest): Promise<IWeeklyHighlight[]>;
}

export interface IWeeklySummaryService {
  loadSummary(request: IWeeklySummaryRequest): Promise<IWeeklySummaryResult>;
}

export interface IWeeklySummaryViewState {
  status: WeeklySummaryStatus;
  result?: IWeeklySummaryResult;
  error?: string;
}
