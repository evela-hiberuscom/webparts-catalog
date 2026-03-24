declare interface IAudienceQuickLinksWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  TitleFieldLabel: string;
  DescriptionFieldLabel: string;
  DataSourceTypeFieldLabel: string;
  SharePointListLabel: string;
  JsonUrlLabel: string;
  StaticConfigLabel: string;
  ListTitleOrUrlFieldLabel: string;
  AudienceModeFieldLabel: string;
  GroupLabel: string;
  DepartmentLabel: string;
  CountryLabel: string;
  RoleLabel: string;
  HybridLabel: string;
  DefaultCategoryFieldLabel: string;
  MaxItemsFieldLabel: string;
  ShowAudienceHintFieldLabel: string;
  // Component strings
  LoadingSpinnerLabel: string;
  LoadingStatePanelTitle: string;
  LoadingStatePanelMessage: string;
  ErrorStatePanelTitle: string;
  ErrorStatePanelMessage: string;
  PartialDataStatePanelTitle: string;
  PartialDataStatePanelMessage: string;
  EmptyStatePanelTitle: string;
  EmptyStatePanelMessageNoCategory: string;
  EmptyStatePanelMessageDefault: string;
  RetryActionLabel: string;
  AudienceHintAriaLabel: string;
  FilterToolbarAriaLabel: string;
  BadgePersonalizadoLabel: string;
  BadgeGenericoLabel: string;
  BadgePartialLabel: string;
  OpenLinkLabel: string;
  ContextualNavigationLabel: string;
  SourceMetaLabel: string;
  AudienceMetaLabel: string;
  FooterStatusLabel: string;
  FooterNotesLabel: string;
  FooterNoIncidenciasLabel: string;
  // Hook and service labels
  AllCategoriesLabel: string;
  DefaultWebPartTitle: string;
  LoadingCatalogLabel: string;
  LoadingAudienceLabel: string;
  NoDataSourceLabel: string;
  CouldNotResolveAudienceLabel: string;
  AudienceGeneralLabel: string;
  AudienceHybridPrefix: string;
  AudienceNamedPrefix: string;
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

declare module 'AudienceQuickLinksWebPartStrings' {
  const strings: IAudienceQuickLinksWebPartStrings;
  export = strings;
}
