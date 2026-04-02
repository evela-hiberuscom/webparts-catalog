declare interface IAreaGoalsWebPartStrings {
  PropertyPaneDescription: string;
  WebPartTitle: string;
  PropertyPaneGeneralGroupName: string;
  DataSourceFieldLabel: string;
  DataSourceSharePointListLabel: string;
  DataSourceJsonUrlLabel: string;
  DataSourceStaticConfigLabel: string;
  ListTitleOrUrlFieldLabel: string;
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

declare module 'AreaGoalsWebPartStrings' {
  const strings: IAreaGoalsWebPartStrings;
  export = strings;
}
