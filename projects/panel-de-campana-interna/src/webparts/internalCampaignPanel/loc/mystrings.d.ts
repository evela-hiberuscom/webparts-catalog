declare interface IInternalCampaignPanelWebPartStrings {
  PropertyPaneDescription: string;
  WebPartTitle: string;
  PropertyPaneGeneralGroupName: string;
  DataSourceFieldLabel: string;
  DataSourceSharePointListLabel: string;
  DataSourceJsonUrlLabel: string;
  DataSourceStaticConfigLabel: string;
  ListTitleOrUrlFieldLabel: string;
  MaxItemsFieldLabel: string;
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

declare module 'InternalCampaignPanelWebPartStrings' {
  const strings: IInternalCampaignPanelWebPartStrings;
  export = strings;
}
