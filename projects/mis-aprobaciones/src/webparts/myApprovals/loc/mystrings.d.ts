declare interface IMyApprovalsWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  DescriptionFieldLabel: string;
  DataSourceTypeLabel: string;
  DataSourceTypeApprovals: string;
  DataSourceTypeSharePointList: string;
  DataSourceTypeJsonUrl: string;
  SourceUrlFieldLabel: string;
  ListTitleOrUrlFieldLabel: string;
  ShowCompletedFieldLabel: string;
  MaxItemsFieldLabel: string;
  DefaultSortFieldLabel: string;
  DefaultSortDueDate: string;
  DefaultSortCreatedDate: string;
  DefaultSortSource: string;
  SummaryTitle: string;
  SummaryOverdue: string;
  SummaryToday: string;
  SummaryUpcoming: string;
  SummaryNoDate: string;
  LoadingMessage: string;
  EmptyMessage: string;
  PartialDataMessage: string;
  ErrorMessage: string;
  RetryLabel: string;
  OpenDetailLabel: string;
  RequesterLabel: string;
  SourceLabel: string;
  DueDateLabel: string;
  StatusLabel: string;
  OverdueLabel: string;
  TodayLabel: string;
  UpcomingLabel: string;
  NoDateLabel: string;
  CompletedLabel: string;
  PendingLabel: string;
  UnknownLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppLocalEnvironmentOffice: string;
  AppLocalEnvironmentOutlook: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
  AppOfficeEnvironment: string;
  AppOutlookEnvironment: string;
  UnknownEnvironment: string;
  ErrorBoundaryTitle: string;
  ErrorBoundaryMessage: string;
}

declare module 'MyApprovalsWebPartStrings' {
  const strings: IMyApprovalsWebPartStrings;
  export = strings;
}
