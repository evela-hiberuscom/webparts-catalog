declare interface IInternalServicesStatusWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  DataSourceTypeFieldLabel: string;
  ListTitleOrUrlFieldLabel: string;
  AutoRefreshFieldLabel: string;
  ShowOnlyCriticalFieldLabel: string;
  StaleThresholdFieldLabel: string;
  DataSourceSharePointListOption: string;
  DataSourceJsonUrlOption: string;
  DataSourceStaticConfigOption: string;
  DefaultDescription: string;
  ErrorBoundaryTitle: string;
  ErrorBoundaryMessage: string;
}

declare module "InternalServicesStatusWebPartStrings" {
  const strings: IInternalServicesStatusWebPartStrings;
  export = strings;
}
