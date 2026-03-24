declare interface IQuickActionsCenterWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  SubtitleFieldLabel: string;
  DataSourceTypeFieldLabel: string;
  SharePointListOptionLabel: string;
  JsonUrlOptionLabel: string;
  StaticConfigOptionLabel: string;
  ListTitleOrUrlFieldLabel: string;
  JsonUrlFieldLabel: string;
  StaticActionsJsonFieldLabel: string;
  DefaultCategoryFieldLabel: string;
  MaxItemsFieldLabel: string;
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

declare module 'QuickActionsCenterWebPartStrings' {
  const strings: IQuickActionsCenterWebPartStrings;
  export = strings;
}
