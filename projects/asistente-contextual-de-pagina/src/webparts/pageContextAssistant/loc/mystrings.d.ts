declare interface IPageContextAssistantWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  WebPartTitleFieldLabel: string;
  WebPartDescriptionFieldLabel: string;
  DataSourceTypeFieldLabel: string;
  ListTitleOrUrlFieldLabel: string;
  FallbackModeFieldLabel: string;
  CollapsedByDefaultFieldLabel: string;
  ContextKeyOverrideFieldLabel: string;
}

declare module "PageContextAssistantWebPartStrings" {
  const strings: IPageContextAssistantWebPartStrings;
  export = strings;
}
