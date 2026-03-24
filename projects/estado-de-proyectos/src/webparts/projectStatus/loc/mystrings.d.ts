declare interface IProjectStatusWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  SubtitleFieldLabel: string;
  DataSourceTypeFieldLabel: string;
  ListTitleOrUrlFieldLabel: string;
  JsonUrlFieldLabel: string;
  DefaultStatusFilterFieldLabel: string;
  MaxItemsFieldLabel: string;
  ShowOwnerFieldLabel: string;
  AppLocalEnvironmentSharePoint: string;
  AppLocalEnvironmentTeams: string;
  AppLocalEnvironmentOffice: string;
  AppLocalEnvironmentOutlook: string;
  AppSharePointEnvironment: string;
  AppTeamsTabEnvironment: string;
  AppOfficeEnvironment: string;
  AppOutlookEnvironment: string;
  UnknownEnvironment: string;
}

declare module 'ProjectStatusWebPartStrings' {
  const strings: IProjectStatusWebPartStrings;
  export = strings;
}
