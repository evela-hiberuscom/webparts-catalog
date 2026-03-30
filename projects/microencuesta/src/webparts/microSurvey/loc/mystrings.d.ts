declare interface IMicroSurveyWebPartStrings {
  PropertyPaneDescription: string;
  PropertyPaneGeneralGroupName: string;
  PropertyPaneSharePointGroupName: string;
  PropertyPaneApiGroupName: string;
  PropertyPaneStaticGroupName: string;
  DescriptionFieldLabel: string;
  DataSourceFieldLabel: string;
  DataSourceSharePointListLabel: string;
  DataSourceApiEndpointLabel: string;
  DataSourceStaticConfigLabel: string;
  OneResponsePerUserFieldLabel: string;
  ToggleOnLabel: string;
  ToggleOffLabel: string;
  ListTitleOrUrlFieldLabel: string;
  ResponsesListTitleOrUrlFieldLabel: string;
  ApiEndpointUrlFieldLabel: string;
  QuestionTextFieldLabel: string;
  OptionsCsvFieldLabel: string;
  WebPartEyebrow: string;
  WebPartTitle: string;
  WebPartSubtitle: string;
  LoadingLabel: string;
  SourceLabel: string;
  OptionsGroupLabel: string;
  SubmitAction: string;
  SubmittingAction: string;
  RefreshAction: string;
  SuccessStateTitle: string;
  SuccessStateMessage: string;
  SelectedOptionLabel: string;
  ErrorStateTitle: string;
  ErrorStateMessage: string;
  EmptyStateTitle: string;
  EmptyStateMessage: string;
  PartialStateTitle: string;
  PartialStateMessage: string;
  InteractionErrorTitle: string;
  SelectionRequiredMessage: string;
  AlreadyAnsweredMessage: string;
  QuestionUnavailableMessage: string;
  SubmitErrorMessage: string;
  ErrorBoundaryTitle: string;
  ErrorBoundaryMessage: string;
}

declare module 'MicroSurveyWebPartStrings' {
  const strings: IMicroSurveyWebPartStrings;
  export = strings;
}
