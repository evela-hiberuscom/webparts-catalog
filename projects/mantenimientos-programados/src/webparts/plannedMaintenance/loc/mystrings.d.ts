declare interface IPlannedMaintenanceWebPartStrings {
  PropertyPaneDescription: string;
  ContentGroupName: string;
  ViewGroupName: string;
  TitleFieldLabel: string;
  DescriptionFieldLabel: string;
  DataSourceTypeFieldLabel: string;
  DataSourceTypeSharePointList: string;
  DataSourceTypeJsonUrl: string;
  ListTitleOrUrlFieldLabel: string;
  JsonUrlFieldLabel: string;
  HideCompletedFieldLabel: string;
  MaxItemsFieldLabel: string;
  ToggleOnLabel: string;
  ToggleOffLabel: string;
  TimelineEyebrow: string;
  SourceLabel: string;
  StatusUpcoming: string;
  StatusInProgress: string;
  StatusCompleted: string;
  StatusUnknown: string;
  ImpactLow: string;
  ImpactMedium: string;
  ImpactHigh: string;
  ImpactUnknown: string;
  ServicesLabel: string;
  NoServicesLabel: string;
  DetailButtonLabel: string;
  RetryButtonLabel: string;
  EmptyStateTitle: string;
  EmptyStateMessage: string;
  ErrorStateTitle: string;
  ErrorStateMessage: string;
  PartialStateTitle: string;
  PartialStateMessage: string;
  PartialBadgeLabel: string;
  UnknownDateLabel: string;
  SummarySectionAriaLabel: string;
  InProgressSummaryLabel: string;
  UpcomingSummaryLabel: string;
  CompletedSummaryLabel: string;
  ReadySummaryLabel: string;
  ErrorBoundaryTitle: string;
  ErrorBoundaryMessage: string;
}

declare module 'PlannedMaintenanceWebPartStrings' {
  const strings: IPlannedMaintenanceWebPartStrings;
  export = strings;
}
