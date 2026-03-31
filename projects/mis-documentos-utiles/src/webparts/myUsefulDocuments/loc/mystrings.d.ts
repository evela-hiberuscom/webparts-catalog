declare interface IMyUsefulDocumentsWebPartStrings {
  PropertyPaneDescription: string;
  WebPartTitle: string;
  PropertyPaneGeneralGroupName: string;
  DataSourceFieldLabel: string;
  DataSourceSharePointListLabel: string;
  DataSourceJsonUrlLabel: string;
  DataSourceStaticConfigLabel: string;
  ListTitleOrUrlFieldLabel: string;
  MaxItemsFieldLabel: string;
  DefaultCategoryFieldLabel: string;
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

declare module 'MyUsefulDocumentsWebPartStrings' {
  const strings: IMyUsefulDocumentsWebPartStrings;
  export = strings;
}