declare interface IHighlightedIncidentsWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  SubtitleFieldLabel: string;
  DataSourceTypeFieldLabel: string;
  SharePointListOptionLabel: string;
  JsonUrlOptionLabel: string;
  ListTitleOrUrlFieldLabel: string;
  ShowResolvedFieldLabel: string;
  MaxItemsFieldLabel: string;
  TitlePlaceholder: string;
  SubtitlePlaceholder: string;
  EmptyStateTitle: string;
  EmptyStateMessage: string;
  ErrorStateTitle: string;
  PartialNotice: string;
  LoadingStateTitle: string;
  LoadingStateMessage: string;
  RetryLabel: string;
}

declare module 'HighlightedIncidentsWebPartStrings' {
  const strings: IHighlightedIncidentsWebPartStrings;
  export = strings;
}
