declare interface IFeaturedQuestionWebPartStrings {
  PropertyPaneDescription: string;
  WebPartTitle: string;
  PropertyPaneGeneralGroupName: string;
  DataSourceFieldLabel: string;
  DataSourceSharePointListLabel: string;
  DataSourceJsonUrlLabel: string;
  DataSourceStaticConfigLabel: string;
  ListTitleOrUrlFieldLabel: string;
  ShowVotesFieldLabel: string;
  ToggleOnLabel: string;
  ToggleOffLabel: string;
  LoadingMessage: string;
  EmptyMessage: string;
  ErrorMessage: string;
  PartialDataMessage: string;
  QuestionOfTheDayLabel: string;
  SelectAnswerLabel: string;
  QuestionFromLabel: string;
  VotesLabel: string;
  ExpiresLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppSharePointEnvironment: string;
  UnknownEnvironment: string;
  ErrorBoundaryTitle: string;
  ErrorBoundaryMessage: string;
}

declare module 'FeaturedQuestionWebPartStrings' {
  const strings: IFeaturedQuestionWebPartStrings;
  export = strings;
}
