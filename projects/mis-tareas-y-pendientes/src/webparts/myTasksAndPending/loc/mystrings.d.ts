declare interface IMyTasksAndPendingWebPartStrings {
  PropertyPaneDescription: string;
  WebPartTitle: string;
  PropertyPaneGeneralGroupName: string;
  DataSourceFieldLabel: string;
  DataSourceSharePointListLabel: string;
  DataSourceJsonUrlLabel: string;
  DataSourceStaticConfigLabel: string;
  ListTitleOrUrlFieldLabel: string;
  MaxItemsFieldLabel: string;
  ShowCompletedFieldLabel: string;
  ToggleOnLabel: string;
  ToggleOffLabel: string;
  DefaultSortFieldLabel: string;
  SortDueDateLabel: string;
  SortPriorityLabel: string;
  SortSourceLabel: string;
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

declare module 'MyTasksAndPendingWebPartStrings' {
  const strings: IMyTasksAndPendingWebPartStrings;
  export = strings;
}
