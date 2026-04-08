declare interface IRecognitionsWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  DescriptionFieldLabel: string;
  DataSourceTypeFieldLabel: string;
  DataSourceSharePointListLabel: string;
  DataSourceJsonUrlLabel: string;
  DataSourceStaticConfigLabel: string;
  ListTitleOrUrlFieldLabel: string;
  MaxItemsFieldLabel: string;
  ShowPhotosFieldLabel: string;
  DefaultWebPartTitle: string;
  DefaultWebPartDescription: string;
  KickerLabel: string;
  RecognitionsCountLabel: string;
  LoadingStateLabel: string;
  EmptyStateMessage: string;
  PartialStateMessage: string;
  ErrorStateMessage: string;
  PartialBadgeLabel: string;
  MissingMessageFallback: string;
  OpenDetailButtonLabel: string;
  DateUnavailableLabel: string;
  ErrorBoundaryTitle: string;
  ErrorBoundaryMessage: string;
}

declare module 'RecognitionsWebPartStrings' {
  const strings: IRecognitionsWebPartStrings;
  export = strings;
}
