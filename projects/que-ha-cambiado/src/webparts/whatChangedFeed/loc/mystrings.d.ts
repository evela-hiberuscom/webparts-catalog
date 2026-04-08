declare interface IWhatChangedFeedWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  DescriptionFieldLabel: string;
  SourceKindFieldLabel: string;
  SourceKindListLabel: string;
  SourceKindLibraryLabel: string;
  ListTitleFieldLabel: string;
  DefaultTypeFilterFieldLabel: string;
  MaxItemsFieldLabel: string;
  DefaultTitle: string;
  DefaultDescription: string;
  LoadingMessage: string;
  ErrorMessage: string;
  EmptyMessage: string;
  PartialDataMessage: string;
  RetryButtonLabel: string;
  OpenItemButton: string;
  UpdatedBadgeLabel: string;
  PartialBadgeLabel: string;
  ChangedAtLabel: string;
  ResultsCounterLabel: string;
  MissingSummaryLabel: string;
  MissingLinkLabel: string;
  AllTypesLabel: string;
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

declare module 'WhatChangedFeedWebPartStrings' {
  const strings: IWhatChangedFeedWebPartStrings;
  export = strings;
}
