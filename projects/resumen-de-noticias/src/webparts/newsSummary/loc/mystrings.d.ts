declare interface INewsSummaryWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  DescriptionFieldLabel: string;
  SitePagesListFieldLabel: string;
  MaxItemsFieldLabel: string;
  FeaturedFirstFieldLabel: string;
  ToggleOnLabel: string;
  ToggleOffLabel: string;
  DefaultTitle: string;
  DefaultDescription: string;
  LoadingMessage: string;
  ErrorMessage: string;
  EmptyMessage: string;
  PartialDataMessage: string;
  RetryButtonLabel: string;
  OpenNewsButton: string;
  FeaturedBadgeLabel: string;
  PartialBadgeLabel: string;
  PublishedOnLabel: string;
  ResultsCounterLabel: string;
  MissingSummaryLabel: string;
  MissingLinkLabel: string;
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
