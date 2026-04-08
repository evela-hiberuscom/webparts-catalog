declare interface ITeamAgendaWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  DescriptionFieldLabel: string;
  DataSourceTypeFieldLabel: string;
  DataSourceCalendarLabel: string;
  DataSourceSharePointListLabel: string;
  DataSourceJsonUrlLabel: string;
  DataSourceStaticConfigLabel: string;
  ListTitleOrUrlFieldLabel: string;
  MaxItemsFieldLabel: string;
  ShowPastFieldLabel: string;
  DefaultTypeFilterFieldLabel: string;
  DefaultWebPartTitle: string;
  DefaultWebPartDescription: string;
  KickerLabel: string;
  EventsCountLabel: string;
  FilterLabel: string;
  AllTypesOptionLabel: string;
  LoadingStateLabel: string;
  EmptyStateMessage: string;
  PartialStateMessage: string;
  ErrorStateMessage: string;
  TodayGroupLabel: string;
  TomorrowGroupLabel: string;
  UpcomingGroupLabel: string;
  PastGroupLabel: string;
  PartialBadgeLabel: string;
  JoinActionLabel: string;
  OpenActionLabel: string;
  DateUnavailableLabel: string;
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

declare module 'TeamAgendaWebPartStrings' {
  const strings: ITeamAgendaWebPartStrings;
  export = strings;
}
