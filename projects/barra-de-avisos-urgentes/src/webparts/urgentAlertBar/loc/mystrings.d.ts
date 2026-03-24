declare interface IUrgentAlertBarWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DataSourceTypeFieldLabel: string;
  DataSourceTypeSharePointList: string;
  DataSourceTypeJsonUrl: string;
  DataSourceTypeStaticConfig: string;
  ListTitleOrUrlFieldLabel: string;
  JsonUrlFieldLabel: string;
  StaticConfigFieldLabel: string;
  MaxAlertsFieldLabel: string;
  DismissibleFieldLabel: string;
  TitleLabel: string;
  TitleHeading: string;
  TitleSubtitle: string;
  PartialDataLabel: string;
  LoadingMessage: string;
  EmptyHeading: string;
  EmptyMessage: string;
  ErrorHeading: string;
  ErrorMessage: string;
  RetryButtonLabel: string;
}

declare module 'UrgentAlertBarWebPartStrings' {
  const strings: IUrgentAlertBarWebPartStrings;
  export = strings;
}
