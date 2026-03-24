declare interface IOnboardingChecklistWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  DescriptionFieldLabel: string;
  DataSourceTypeFieldLabel: string;
  WebUrlFieldLabel: string;
  ListTitleOrUrlFieldLabel: string;
  JsonUrlFieldLabel: string;
  StaticConfigJsonFieldLabel: string;
  DefaultVariantFieldLabel: string;
  DefaultPhaseFieldLabel: string;
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

declare module 'OnboardingChecklistWebPartStrings' {
  const strings: IOnboardingChecklistWebPartStrings;
  export = strings;
}
