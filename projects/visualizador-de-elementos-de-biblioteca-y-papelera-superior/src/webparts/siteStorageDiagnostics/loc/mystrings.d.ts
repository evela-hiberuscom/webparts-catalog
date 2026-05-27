declare interface ISiteStorageDiagnosticsWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  ReportListUrlFieldLabel: string;
  BatchSizeFieldLabel: string;
  MaxRequestsPerSecondFieldLabel: string;
  ScopeFieldLabel: string;
  ManualSiteUrlsFieldLabel: string;
  ErrorBoundaryTitle: string;
  ErrorBoundaryMessage: string;
}

declare module 'SiteStorageDiagnosticsWebPartStrings' {
  const strings: ISiteStorageDiagnosticsWebPartStrings;
  export = strings;
}
