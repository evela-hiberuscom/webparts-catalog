declare interface IUniversalAppLauncherWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  SubtitleFieldLabel: string;
  AudienceModeFieldLabel: string;
  CurrentAudienceTokensFieldLabel: string;
  CurrentAudienceTokensFieldDescription: string;
  LaunchItemsJsonFieldLabel: string;
  DefaultCategoryFieldLabel: string;
  MaxItemsFieldLabel: string;
  OpenInNewTabFieldLabel: string;
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

declare module 'UniversalAppLauncherWebPartStrings' {
  const strings: IUniversalAppLauncherWebPartStrings;
  export = strings;
}
