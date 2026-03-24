declare interface IAutomaticWeeklySummaryWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  SubtitleFieldLabel: string;
  PeriodModeFieldLabel: string;
  CurrentWeekLabel: string;
  PreviousWeekLabel: string;
  CustomRangeLabel: string;
  MaxItemsFieldLabel: string;
  CustomRangeStartFieldLabel: string;
  CustomRangeEndFieldLabel: string;
  CustomRangeHelpText: string;
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

declare module 'AutomaticWeeklySummaryWebPartStrings' {
  const strings: IAutomaticWeeklySummaryWebPartStrings;
  export = strings;
}
