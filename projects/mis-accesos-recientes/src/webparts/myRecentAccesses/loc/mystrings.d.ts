declare interface IMyRecentAccessesWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  DataSourceModeFieldLabel: string;
  RecentItemsJsonUrlFieldLabel: string;
  MaxItemsFieldLabel: string;
  ResourceTypeFilterFieldLabel: string;
  DefaultDescription: string;
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

declare module 'MyRecentAccessesWebPartStrings' {
  const strings: IMyRecentAccessesWebPartStrings;
  export = strings;
}
