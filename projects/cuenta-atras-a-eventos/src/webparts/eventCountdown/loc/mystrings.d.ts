declare interface IEventCountdownWebPartStrings {
  PropertyPaneDescription: string;
  SourceGroupName: string;
  SourceTypeFieldLabel: string;
  SourceTypeStaticLabel: string;
  SourceTypeSharePointListLabel: string;
  SourceTypeJsonUrlLabel: string;
  JsonUrlFieldLabel: string;
  ListTitleOrUrlFieldLabel: string;
  EventGroupName: string;
  EventTitleFieldLabel: string;
  TargetDateFieldLabel: string;
  SubtitleFieldLabel: string;
  DetailUrlFieldLabel: string;
  MappingGroupName: string;
  TitleFieldLabel: string;
  TargetDateFieldLabelList: string;
  SubtitleFieldLabelList: string;
  DetailUrlFieldLabelList: string;
  BehaviorGroupName: string;
  ShowCompletedFieldLabel: string;
  RefreshIntervalFieldLabel: string;
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

declare module 'EventCountdownWebPartStrings' {
  const strings: IEventCountdownWebPartStrings;
  export = strings;
}
