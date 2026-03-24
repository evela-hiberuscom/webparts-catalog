define([], function() {
  return {
    // Property pane
    "PropertyPaneDescription": "Analyzes size and historical versions of documents in a SharePoint library.",
    "BasicGroupName": "Configuration",
    "SubtitleFieldLabel": "Web part subtitle",
    "DefaultLibraryFieldLabel": "Default library (title or URL)",
    "DefaultScanModeFieldLabel": "Default scan mode",
    "QuickScanOptionLabel": "Quick scan",
    "DeepScanOptionLabel": "Deep scan",
    "MaxVersionConcurrencyFieldLabel": "Version concurrency",
    "IncludeHiddenLibrariesFieldLabel": "Include hidden libraries",
    "YesLabel": "Yes",
    "NoLabel": "No",
    // Web part title and hero
    "WebPartTitle": "Historical document size and volume analyzer",
    // Scan mode options
    "ScanModeQuickLabel": "Quick scan — Only the heaviest documents (fast, partial)",
    "ScanModeDeepLabel": "Deep scan — All documents and all their versions (complete, slower)",
    // Column headers
    "ColumnDocumentLabel": "Document",
    "ColumnCurrentSizeLabel": "Current size",
    "ColumnVersionsLabel": "Versions",
    "ColumnHistoricalSizeLabel": "Historical size",
    "ColumnRatioLabel": "Ratio",
    "ColumnPrecisionLabel": "Precision",
    // Precision badge labels
    "PrecisionExactLabel": "Exact",
    "PrecisionPartialThrottledLabel": "Partial (throttled)",
    "PrecisionPartialErrorLabel": "Partial (error)",
    "PrecisionEstimatedLabel": "Estimated",
    // Precision tooltips
    "PrecisionExactTooltip": "All historical versions were retrieved successfully.",
    "PrecisionPartialThrottledTooltip": "SharePoint throttled the requests. It was not possible to obtain the full version history for this document.",
    "PrecisionPartialErrorTooltip": "An error occurred while querying the version history for this document. The data shown is incomplete.",
    "PrecisionEstimatedTooltip": "This document was outside the defined analysis range. Historical values are estimates based on the document's current size.",
    // Action buttons
    "RefreshButton": "Refresh",
    "ExportJsonButton": "Export JSON",
    "OpenLibraryButton": "Open library",
    // Library selector
    "LibraryComboBoxPlaceholder": "Search library",
    "LibraryControlLabel": "Site library",
    "NoLibrarySelectedLabel": "No library selected",
    "LibraryItemCountSuffix": " · {0} items",
    // Scan mode control
    "ScanModeControlLabel": "Analysis mode",
    // Documents to scan control
    "MaxDocumentsControlLabel": "Documents to scan",
    "AllDocumentsCheckboxLabel": "All documents",
    "AllDocumentsHelperText": "All document versions in the library will be analyzed.",
    "TopDocumentsHelperText": "The versions of the {0} heaviest documents will be analyzed.",
    // Progress and loading
    "ProgressListingLabel": "Retrieving document list...",
    "ProgressAnalyzingLabel": "Analyzing versions: {0} of {1}",
    "SpinnerAnalyzingLabel": "Analyzing library...",
    // Status messages
    "StatusEmptyLabel": "The selected library contains no analyzable documents.",
    "StatusThrottledLabel": "SharePoint throttled some queries. The result may be partial.",
    "StatusPartialDataLabel": "The result is partial. Coverage is not complete.",
    // KPI labels
    "KpiDocumentsLabel": "Documents",
    "KpiCurrentSizeLabel": "Current size",
    "KpiHistoricalVersionsLabel": "Historical versions",
    "KpiHistoricalSizeLabel": "Historical size",
    "KpiRatioLabel": "Historical/current ratio",
    "KpiCoverageLabel": "Coverage",
    "KpiDurationLabel": "Duration",
    // Section and table
    "AnalyzedDocumentsSectionLabel": "Analyzed documents",
    "SortHintLabel": "{0} documents · Click on the column headers to sort.",
    // Pagination
    "PreviousPageAriaLabel": "Previous page",
    "NextPageAriaLabel": "Next page",
    // Retry
    "RetryButtonTitle": "Retry",
    "RetryButtonAriaLabel": "Retry analysis for this document",
    // Error messages
    "LoadLibrariesErrorMessage": "Could not load the site libraries.",
    "AnalyzeLibraryErrorMessage": "Could not complete the analysis.",
    // Environment
    "AppLocalEnvironmentSharePoint": "The app is running on your local environment as SharePoint web part",
    "AppLocalEnvironmentTeams": "The app is running on your local environment as Microsoft Teams app",
    "AppLocalEnvironmentOffice": "The app is running on your local environment in office.com",
    "AppLocalEnvironmentOutlook": "The app is running on your local environment in Outlook",
    "AppSharePointEnvironment": "The app is running on SharePoint page",
    "AppTeamsTabEnvironment": "The app is running in Microsoft Teams",
    "AppOfficeEnvironment": "The app is running in office.com",
    "AppOutlookEnvironment": "The app is running in Outlook",
    "UnknownEnvironment": "The app is running in an unknown environment",
    ErrorBoundaryTitle: "Something went wrong",
    ErrorBoundaryMessage: "This web part encountered an unexpected error. Please reload the page or contact your administrator."
  }
});
