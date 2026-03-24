declare interface IIdeasMailboxWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  SubtitleFieldLabel: string;
  SourceTypeFieldLabel: string;
  ListTitleOrUrlFieldLabel: string;
  ListTitleOrUrlHelpText: string;
  EndpointUrlFieldLabel: string;
  EndpointUrlHelpText: string;
  AllowAnonymousFieldLabel: string;
  ShowCategoryFieldLabel: string;
  SubmitLabelFieldLabel: string;
  CategoryLabelFieldLabel: string;
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

declare module 'IdeasMailboxWebPartStrings' {
  const strings: IIdeasMailboxWebPartStrings;
  export = strings;
}
