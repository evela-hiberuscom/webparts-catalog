declare interface INewsSummaryWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
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

declare module 'NewsSummaryWebPartStrings' {
  const strings: INewsSummaryWebPartStrings;
  export = strings;
}
