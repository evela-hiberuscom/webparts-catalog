declare interface IProfileBasedComponentWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  DescriptionFieldLabel: string;
  DataSourceTypeFieldLabel: string;
  ListTitleOrUrlFieldLabel: string;
  JsonUrlFieldLabel: string;
  StaticConfigJsonFieldLabel: string;
  AudienceModeFieldLabel: string;
  FallbackModeFieldLabel: string;
  ProfileTokensFieldLabel: string;
  MaxItemsFieldLabel: string;
  ErrorBoundaryTitle: string;
  ErrorBoundaryMessage: string;
}

declare module 'ProfileBasedComponentWebPartStrings' {
  const strings: IProfileBasedComponentWebPartStrings;
  export = strings;
}
