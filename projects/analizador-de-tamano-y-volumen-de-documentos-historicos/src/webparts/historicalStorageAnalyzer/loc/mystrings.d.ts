declare interface IHistoricalStorageAnalyzerWebPartStrings {
  // Property pane
  PropertyPaneDescription: string;
  BasicGroupName: string;
  SubtitleFieldLabel: string;
  DefaultLibraryFieldLabel: string;
  DefaultScanModeFieldLabel: string;
  QuickScanOptionLabel: string;
  DeepScanOptionLabel: string;
  MaxVersionConcurrencyFieldLabel: string;
  IncludeHiddenLibrariesFieldLabel: string;
  YesLabel: string;
  NoLabel: string;
  // Web part title and hero
  WebPartTitle: string;
  // Scan mode options
  ScanModeQuickLabel: string;
  ScanModeDeepLabel: string;
  // Column headers
  ColumnDocumentLabel: string;
  ColumnCurrentSizeLabel: string;
  ColumnVersionsLabel: string;
  ColumnHistoricalSizeLabel: string;
  ColumnRatioLabel: string;
  ColumnPrecisionLabel: string;
  // Precision badge labels
  PrecisionExactLabel: string;
  PrecisionPartialThrottledLabel: string;
  PrecisionPartialErrorLabel: string;
  PrecisionEstimatedLabel: string;
  // Precision tooltips
  PrecisionExactTooltip: string;
  PrecisionPartialThrottledTooltip: string;
  PrecisionPartialErrorTooltip: string;
  PrecisionEstimatedTooltip: string;
  // Action buttons
  RefreshButton: string;
  ExportJsonButton: string;
  OpenLibraryButton: string;
  // Library selector
  LibraryComboBoxPlaceholder: string;
  LibraryControlLabel: string;
  NoLibrarySelectedLabel: string;
  LibraryItemCountSuffix: string;
  // Scan mode control
  ScanModeControlLabel: string;
  // Documents to scan control
  MaxDocumentsControlLabel: string;
  AllDocumentsCheckboxLabel: string;
  AllDocumentsHelperText: string;
  TopDocumentsHelperText: string;
  // Progress and loading
  ProgressListingLabel: string;
  ProgressAnalyzingLabel: string;
  SpinnerAnalyzingLabel: string;
  // Status messages
  StatusEmptyLabel: string;
  StatusThrottledLabel: string;
  StatusPartialDataLabel: string;
  // KPI labels
  KpiDocumentsLabel: string;
  KpiCurrentSizeLabel: string;
  KpiHistoricalVersionsLabel: string;
  KpiHistoricalSizeLabel: string;
  KpiRatioLabel: string;
  KpiCoverageLabel: string;
  KpiDurationLabel: string;
  // Section and table
  AnalyzedDocumentsSectionLabel: string;
  SortHintLabel: string;
  // Pagination
  PreviousPageAriaLabel: string;
  NextPageAriaLabel: string;
  // Retry
  RetryButtonTitle: string;
  RetryButtonAriaLabel: string;
  // Error messages
  LoadLibrariesErrorMessage: string;
  AnalyzeLibraryErrorMessage: string;
  // Environment
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

declare module 'HistoricalStorageAnalyzerWebPartStrings' {
  const strings: IHistoricalStorageAnalyzerWebPartStrings;
  export = strings;
}
