define([], function() {
  return {
    // Panel de propiedades
    "PropertyPaneDescription": "Analiza el tamaño y las versiones históricas de documentos en una biblioteca de SharePoint.",
    "BasicGroupName": "Configuración",
    "SubtitleFieldLabel": "Subtítulo de la web part",
    "DefaultLibraryFieldLabel": "Biblioteca por defecto (título o URL)",
    "DefaultScanModeFieldLabel": "Modo por defecto",
    "QuickScanOptionLabel": "Quick scan",
    "DeepScanOptionLabel": "Deep scan",
    "MaxVersionConcurrencyFieldLabel": "Concurrencia de versiones",
    "IncludeHiddenLibrariesFieldLabel": "Incluir bibliotecas ocultas",
    "YesLabel": "Sí",
    "NoLabel": "No",
    // Título y cabecera
    "WebPartTitle": "Analizador de tamaño y volumen de documentos históricos",
    // Opciones de modo de análisis
    "ScanModeQuickLabel": "Quick scan — Solo los documentos más pesados (rápido, parcial)",
    "ScanModeDeepLabel": "Deep scan — Todos los documentos y todas sus versiones (completo, más lento)",
    // Cabeceras de columna
    "ColumnDocumentLabel": "Documento",
    "ColumnCurrentSizeLabel": "Tamaño actual",
    "ColumnVersionsLabel": "Versiones",
    "ColumnHistoricalSizeLabel": "Tamaño histórico",
    "ColumnRatioLabel": "Ratio",
    "ColumnPrecisionLabel": "Precisión",
    // Etiquetas de precisión
    "PrecisionExactLabel": "Exacto",
    "PrecisionPartialThrottledLabel": "Parcial (límite)",
    "PrecisionPartialErrorLabel": "Parcial (error)",
    "PrecisionEstimatedLabel": "Estimado",
    // Tooltips de precisión
    "PrecisionExactTooltip": "Todas las versiones históricas se obtuvieron correctamente.",
    "PrecisionPartialThrottledTooltip": "SharePoint limitó las solicitudes (throttling). No fue posible obtener el historial completo de versiones para este documento.",
    "PrecisionPartialErrorTooltip": "Hubo un error al consultar el historial de versiones de este documento. Los datos mostrados son incompletos.",
    "PrecisionEstimatedTooltip": "Este documento no entró en el rango de análisis definido. Los valores históricos son estimaciones basadas en el tamaño actual del documento.",
    // Botones de acción
    "RefreshButton": "Refrescar",
    "ExportJsonButton": "Exportar JSON",
    "OpenLibraryButton": "Abrir biblioteca",
    // Selector de biblioteca
    "LibraryComboBoxPlaceholder": "Buscar biblioteca",
    "LibraryControlLabel": "Biblioteca del sitio",
    "NoLibrarySelectedLabel": "Ninguna biblioteca seleccionada",
    "LibraryItemCountSuffix": " · {0} elementos",
    // Control de modo de análisis
    "ScanModeControlLabel": "Modo de análisis",
    // Control de documentos a escanear
    "MaxDocumentsControlLabel": "Documentos a escanear",
    "AllDocumentsCheckboxLabel": "Todos los documentos",
    "AllDocumentsHelperText": "Se analizarán las versiones de todos los documentos de la biblioteca.",
    "TopDocumentsHelperText": "Se analizarán las versiones de los {0} documentos más pesados.",
    // Progreso y carga
    "ProgressListingLabel": "Obteniendo lista de documentos...",
    "ProgressAnalyzingLabel": "Analizando versiones: {0} de {1}",
    "SpinnerAnalyzingLabel": "Analizando biblioteca...",
    // Mensajes de estado
    "StatusEmptyLabel": "La biblioteca seleccionada no contiene documentos analizables.",
    "StatusThrottledLabel": "SharePoint ha limitado parte de las consultas. El resultado puede ser parcial.",
    "StatusPartialDataLabel": "El resultado es parcial. La cobertura no es completa.",
    // Etiquetas de KPIs
    "KpiDocumentsLabel": "Documentos",
    "KpiCurrentSizeLabel": "Tamaño actual",
    "KpiHistoricalVersionsLabel": "Versiones históricas",
    "KpiHistoricalSizeLabel": "Tamaño histórico",
    "KpiRatioLabel": "Ratio histórico/actual",
    "KpiCoverageLabel": "Cobertura",
    "KpiDurationLabel": "Duración",
    // Sección y tabla
    "AnalyzedDocumentsSectionLabel": "Documentos analizados",
    "SortHintLabel": "{0} documentos · Haz clic en las cabeceras para ordenar.",
    // Paginación
    "PreviousPageAriaLabel": "Página anterior",
    "NextPageAriaLabel": "Página siguiente",
    // Reintentar
    "RetryButtonTitle": "Reintentar",
    "RetryButtonAriaLabel": "Reintentar análisis de este documento",
    // Mensajes de error
    "LoadLibrariesErrorMessage": "No se han podido cargar las bibliotecas del sitio.",
    "AnalyzeLibraryErrorMessage": "No se ha podido completar el análisis.",
    // Entorno
    "AppLocalEnvironmentSharePoint": "La app se está ejecutando en tu entorno local como web part de SharePoint",
    "AppLocalEnvironmentTeams": "La app se está ejecutando en tu entorno local como app de Microsoft Teams",
    "AppLocalEnvironmentOffice": "La app se está ejecutando en tu entorno local en office.com",
    "AppLocalEnvironmentOutlook": "La app se está ejecutando en tu entorno local en Outlook",
    "AppSharePointEnvironment": "La app se está ejecutando en una página de SharePoint",
    "AppTeamsTabEnvironment": "La app se está ejecutando en Microsoft Teams",
    "AppOfficeEnvironment": "La app se está ejecutando en office.com",
    "AppOutlookEnvironment": "La app se está ejecutando en Outlook",
    "UnknownEnvironment": "La app se está ejecutando en un entorno desconocido"
  }
});
