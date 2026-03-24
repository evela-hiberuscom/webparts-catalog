declare interface IDailyPulseWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  SubtitleFieldLabel: string;
  SourceTypeFieldLabel: string;
  WebUrlFieldLabel: string;
  ListTitleOrUrlFieldLabel: string;
  JsonUrlFieldLabel: string;
  ApiEndpointFieldLabel: string;
  PromptJsonFieldLabel: string;
  OneResponsePerDayFieldLabel: string;
  SubmitLabelFieldLabel: string;
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

declare module 'DailyPulseWebPartStrings' {
  const strings: IDailyPulseWebPartStrings;
  export = strings;
}
