import * as React from 'react';
import {
  Checkbox,
  ChoiceGroup,
  type IChoiceGroupOption,
  type IColumn,
  ComboBox,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  DirectionalHint,
  IconButton,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  ProgressIndicator,
  SelectionMode,
  SpinButton,
  Spinner,
  SpinnerSize,
  Stack,
  Text,
  TooltipHost
} from '@fluentui/react';
import { escape } from '@microsoft/sp-lodash-subset';
import { classifyAsyncState, createSafeExternalLink } from '@paquete/spfx-common';
import styles from './HistoricalStorageAnalyzer.module.scss';
import type { IHistoricalStorageAnalyzerProps } from './IHistoricalStorageAnalyzerProps';
import type { IHistoricalStorageDocumentSnapshot } from '../models/historicalStorageAnalyzer.types';
import { useHistoricalStorageAnalysis } from '../hooks/useHistoricalStorageAnalysis';
import { downloadAnalysisResult } from '../utils/exportResult';
import { formatBytes, formatPercent, formatRatio } from '../utils/analysisCalculations';
import { getSelectableLibraryTitle, toLibraryComboBoxOption } from '../utils/librarySelection';

const scanModeOptions: IChoiceGroupOption[] = [
  {
    key: 'quickScan',
    text: 'Quick scan — Solo los documentos más pesados (rápido, parcial)'
  },
  {
    key: 'deepScan',
    text: 'Deep scan — Todos los documentos y todas sus versiones (completo, más lento)'
  }
];

function buildColumns(): IColumn[] {
  return [
    { key: 'title', name: 'Documento', fieldName: 'title', minWidth: 180, isResizable: true, isSorted: false, isSortedDescending: false },
    { key: 'currentSizeBytes', name: 'Tamaño actual', fieldName: 'currentSizeBytes', minWidth: 110, isResizable: true, isSorted: false, isSortedDescending: false },
    { key: 'historicalVersionCount', name: 'Versiones', fieldName: 'historicalVersionCount', minWidth: 90, isResizable: true, isSorted: false, isSortedDescending: false },
    { key: 'historicalSizeBytes', name: 'Tamaño histórico', fieldName: 'historicalSizeBytes', minWidth: 130, isResizable: true, isSorted: false, isSortedDescending: false },
    { key: 'ratio', name: 'Ratio', fieldName: 'ratio', minWidth: 80, isResizable: true, isSorted: false, isSortedDescending: false },
    { key: 'precision', name: 'Precisión', fieldName: 'precision', minWidth: 160, isResizable: true, isSorted: false, isSortedDescending: false }
  ];
}

function compareDocuments(
  a: IHistoricalStorageDocumentSnapshot,
  b: IHistoricalStorageDocumentSnapshot,
  columnKey: string,
  descending: boolean
): number {
  let result = 0;
  switch (columnKey) {
    case 'title':
      result = (a.title || '').localeCompare(b.title || '');
      break;
    case 'currentSizeBytes':
      result = a.currentSizeBytes - b.currentSizeBytes;
      break;
    case 'historicalVersionCount':
      result = a.historicalVersionCount - b.historicalVersionCount;
      break;
    case 'historicalSizeBytes':
      result = (a.historicalSizeBytes ?? 0) - (b.historicalSizeBytes ?? 0);
      break;
    case 'ratio':
      result = (a.ratio ?? 0) - (b.ratio ?? 0);
      break;
    case 'precision':
      result = (a.precision || '').localeCompare(b.precision || '');
      break;
    default:
      break;
  }
  return descending ? -result : result;
}

function precisionBadgeClassName(precision: string): string {
  switch (precision) {
    case 'exact':
      return styles.badgeExact;
    case 'partial':
      return styles.badgePartial;
    case 'estimated':
      return styles.badgeEstimated;
    default:
      return styles.badgeNeutral;
  }
}

function precisionLabel(item: IHistoricalStorageDocumentSnapshot): string {
  switch (item.precision) {
    case 'exact': return 'Exacto';
    case 'partial':
      return item.warnings.indexOf('throttled') !== -1 ? 'Parcial (límite)' : 'Parcial (error)';
    case 'estimated': return 'Estimado';
    default: return item.precision;
  }
}

function precisionTooltip(item: IHistoricalStorageDocumentSnapshot): string {
  switch (item.precision) {
    case 'exact':
      return 'Todas las versiones históricas se obtuvieron correctamente.';
    case 'partial':
      return item.warnings.indexOf('throttled') !== -1
        ? 'SharePoint limitó las solicitudes (throttling). No fue posible obtener el historial completo de versiones para este documento.'
        : 'Hubo un error al consultar el historial de versiones de este documento. Los datos mostrados son incompletos.';
    case 'estimated':
      return 'Este documento no entró en el rango de análisis definido. Los valores históricos son estimaciones basadas en el tamaño actual del documento.';
    default:
      return '';
  }
}

const PAGE_SIZE = 50;

export default function HistoricalStorageAnalyzer(
  props: IHistoricalStorageAnalyzerProps
): React.ReactElement<IHistoricalStorageAnalyzerProps> {
  const {
    libraries,
    selectedLibrary,
    scanMode,
    maxDocumentsToScan,
    status,
    isRefreshing,
    errorMessage,
    result,
    progress,
    retryingDocumentIds,
    actions
  } = useHistoricalStorageAnalysis(props.context, {
    defaultLibraryTitleOrUrl: props.defaultLibraryTitleOrUrl,
    defaultScanMode: props.defaultScanMode,
    maxVersionConcurrency: props.maxVersionConcurrency,
    includeHiddenLibraries: props.includeHiddenLibraries
  });

  const [columns, setColumns] = React.useState<IColumn[]>(buildColumns);
  const [sortKey, setSortKey] = React.useState<string | undefined>();
  const [sortDescending, setSortDescending] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);

  const sortedDocuments = React.useMemo(() => {
    if (!result?.topDocuments) return [];
    if (!sortKey) return result.topDocuments;
    return [...result.topDocuments].sort((a, b) => compareDocuments(a, b, sortKey, sortDescending));
  }, [result?.topDocuments, sortKey, sortDescending]);

  const totalPages = Math.max(1, Math.ceil(sortedDocuments.length / PAGE_SIZE));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const paginatedDocuments = sortedDocuments.slice(
    (safeCurrentPage - 1) * PAGE_SIZE,
    safeCurrentPage * PAGE_SIZE
  );

  React.useEffect(() => {
    setCurrentPage(1);
  }, [result?.topDocuments, sortKey, sortDescending]);

  const handleColumnClick = React.useCallback((_ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    const newDescending = column.key === sortKey ? !sortDescending : false;
    setSortKey(column.key);
    setSortDescending(newDescending);
    setColumns((prev) =>
      prev.map((col) => ({
        ...col,
        isSorted: col.key === column.key,
        isSortedDescending: col.key === column.key ? newDescending : false
      }))
    );
  }, [sortKey, sortDescending]);

  const stateClassName = classifyAsyncState({
    hasData: !!result,
    hasError: status === 'error',
    isLoading: status === 'loading',
    isPartial: status === 'partialData' || status === 'throttled'
  });

  const safeLibraryLink = result ? createSafeExternalLink(result.library.webUrl) : undefined;
  const statusIntent =
    status === 'error'
      ? MessageBarType.error
      : status === 'throttled' || status === 'partialData'
        ? MessageBarType.warning
        : status === 'empty'
          ? MessageBarType.info
          : MessageBarType.success;

  const statusText =
    errorMessage ||
    (status === 'empty'
      ? 'La biblioteca seleccionada no contiene documentos analizables.'
      : status === 'throttled'
        ? 'SharePoint ha limitado parte de las consultas. El resultado puede ser parcial.'
        : status === 'partialData'
          ? 'El resultado es parcial. La cobertura no es completa.'
          : result?.warnings[0] || '');

  const kpis = result
    ? [
        { label: 'Documentos', value: result.summary.totalDocuments.toLocaleString('es-ES') },
        { label: 'Tamaño actual', value: formatBytes(result.summary.visibleCurrentSizeBytes) },
        { label: 'Versiones históricas', value: result.summary.historicalVersionCount.toLocaleString('es-ES') },
        {
          label: 'Tamaño histórico',
          value:
            result.summary.historicalEstimatedSizeBytes !== null &&
            result.summary.historicalEstimatedSizeBytes !== undefined
              ? formatBytes(result.summary.historicalEstimatedSizeBytes)
              : '—'
        },
        { label: 'Ratio histórico/actual', value: formatRatio(result.summary.historicalToCurrentRatio) },
        { label: 'Cobertura', value: formatPercent(result.summary.analysisCoveragePercent) },
        { label: 'Duración', value: `${Math.max(0, result.summary.durationMs)} ms` }
      ]
    : [];

  const progressPercent = progress && progress.totalFiles > 0
    ? progress.completedFiles / progress.totalFiles
    : undefined;

  const progressLabel = progress
    ? progress.phase === 'listing'
      ? 'Obteniendo lista de documentos...'
      : `Analizando versiones: ${progress.completedFiles} de ${progress.totalFiles}`
    : undefined;

  const progressDescription = progress?.phase === 'analyzing' && progress.currentFileName
    ? progress.currentFileName
    : undefined;

  return (
    <section className={`${styles.root} ${props.hasTeamsContext ? styles.teams : ''} ${props.isDarkTheme ? styles.darkTheme : ''}`}>
      <div className={styles.hero}>
        <div className={styles.heroTitleBlock}>
          <Text variant="xxLarge" block className={styles.title}>
            {escape('Analizador de tamaño y volumen de documentos históricos')}
          </Text>
          <Text variant="medium" block className={styles.subtitle}>
            {escape(props.description)}
          </Text>
          <Text variant="small" block className={styles.meta}>
            {escape(props.userDisplayName)} · {escape(props.environmentMessage)}
          </Text>
        </div>

        <Stack horizontal tokens={{ childrenGap: 8 }} className={styles.heroActions}>
          <PrimaryButton
            text="Refrescar"
            iconProps={{ iconName: 'Refresh' }}
            onClick={actions.refresh}
            disabled={!selectedLibrary || isRefreshing}
          />
          <DefaultButton
            text="Exportar JSON"
            iconProps={{ iconName: 'Download' }}
            onClick={() => result && downloadAnalysisResult(result)}
            disabled={!result}
          />
          <DefaultButton
            text="Abrir biblioteca"
            iconProps={{ iconName: 'OpenInNewTab' }}
            href={safeLibraryLink?.href}
            target={safeLibraryLink?.target as '_blank' | undefined}
            rel={safeLibraryLink?.rel}
            disabled={!safeLibraryLink}
          />
        </Stack>
      </div>

      <div className={styles.controlPanel}>
        <div className={styles.controlBlock}>
          <Text variant="smallPlus" block className={styles.controlLabel}>
            Biblioteca del sitio
          </Text>
          <ComboBox
            placeholder="Buscar biblioteca"
            options={libraries.map(toLibraryComboBoxOption)}
            selectedKey={selectedLibrary?.id}
            onChange={(_, option) => {
              if (option?.key) {
                actions.setSelectedLibraryId(String(option.key));
              }
            }}
            allowFreeform={false}
            autoComplete="on"
            useComboBoxAsMenuWidth
          />
          <Text variant="small" block className={styles.helperText}>
            {getSelectableLibraryTitle(selectedLibrary)}
          </Text>
        </div>

        <div className={styles.controlBlock}>
          <Text variant="smallPlus" block className={styles.controlLabel}>
            Modo de análisis
          </Text>
          <ChoiceGroup
            selectedKey={scanMode}
            options={scanModeOptions}
            onChange={(_, option) => {
              if (option?.key === 'quickScan' || option?.key === 'deepScan') {
                actions.setScanMode(option.key);
              }
            }}
          />
        </div>

        <div className={styles.controlBlock}>
          <Text variant="smallPlus" block className={styles.controlLabel}>
            Documentos a escanear
          </Text>
          <Checkbox
            label="Todos los documentos"
            checked={maxDocumentsToScan === 0}
            onChange={(_, checked) => {
              actions.setMaxDocumentsToScan(checked ? 0 : 20);
            }}
            disabled={isRefreshing}
          />
          {maxDocumentsToScan > 0 && (
            <SpinButton
              value={String(maxDocumentsToScan)}
              min={1}
              max={10000}
              step={5}
              onValidate={(value) => {
                const parsed = Number.parseInt(value, 10);
                if (Number.isFinite(parsed) && parsed >= 1) {
                  actions.setMaxDocumentsToScan(parsed);
                }
                return String(maxDocumentsToScan);
              }}
              onIncrement={(value) => {
                const next = Math.min(10000, (Number.parseInt(value, 10) || maxDocumentsToScan) + 5);
                actions.setMaxDocumentsToScan(next);
                return String(next);
              }}
              onDecrement={(value) => {
                const next = Math.max(1, (Number.parseInt(value, 10) || maxDocumentsToScan) - 5);
                actions.setMaxDocumentsToScan(next);
                return String(next);
              }}
              disabled={isRefreshing}
              styles={{ root: { maxWidth: 120, marginTop: 4 } }}
            />
          )}
          <Text variant="small" block className={styles.helperText}>
            {maxDocumentsToScan === 0
              ? 'Se analizarán las versiones de todos los documentos de la biblioteca.'
              : `Se analizarán las versiones de los ${maxDocumentsToScan} documentos más pesados.`}
          </Text>
        </div>
      </div>

      {status === 'loading' && (
        <div className={styles.statePanel}>
          {progress ? (
            <Stack tokens={{ childrenGap: 4 }} styles={{ root: { width: '100%', padding: '0 16px' } }}>
              <ProgressIndicator
                label={progressLabel}
                description={progressDescription}
                percentComplete={progressPercent}
              />
            </Stack>
          ) : (
            <Spinner size={SpinnerSize.medium} label="Analizando biblioteca..." />
          )}
        </div>
      )}

      {status !== 'loading' && statusText && (
        <MessageBar messageBarType={statusIntent} isMultiline={false}>
          {statusText}
        </MessageBar>
      )}

      <div className={styles.content} data-state={stateClassName}>
        {kpis.length > 0 && (
          <div className={styles.kpiGrid}>
            {kpis.map((kpi) => (
              <article key={kpi.label} className={styles.kpiCard}>
                <Text variant="smallPlus" block className={styles.kpiLabel}>
                  {kpi.label}
                </Text>
                <Text variant="xxLarge" block className={styles.kpiValue}>
                  {kpi.value}
                </Text>
              </article>
            ))}
          </div>
        )}

        {result && (
          <Stack tokens={{ childrenGap: 12 }}>
            <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
              <div className={styles.sectionHeader}>
                <Text variant="mediumPlus" block>
                  Documentos analizados
                </Text>
                <Text variant="small" block className={styles.helperText}>
                  {sortedDocuments.length} documentos · Haz clic en las cabeceras para ordenar.
                </Text>
              </div>
              {totalPages > 1 && (
                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
                  <IconButton
                    iconProps={{ iconName: 'ChevronLeft' }}
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    ariaLabel="Página anterior"
                  />
                  <Text variant="small">
                    {safeCurrentPage} / {totalPages}
                  </Text>
                  <IconButton
                    iconProps={{ iconName: 'ChevronRight' }}
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    ariaLabel="Página siguiente"
                  />
                </Stack>
              )}
            </Stack>

            <DetailsList
              items={paginatedDocuments}
              columns={columns.map((column) => ({
                ...column,
                onColumnClick: handleColumnClick,
                onRender: (item: IHistoricalStorageDocumentSnapshot) => {
                  switch (column.key) {
                    case 'currentSizeBytes':
                      return formatBytes(item.currentSizeBytes);
                    case 'historicalVersionCount':
                      return item.historicalVersionCount.toLocaleString('es-ES');
                    case 'historicalSizeBytes':
                      return item.historicalSizeBytes === null || item.historicalSizeBytes === undefined
                        ? '—'
                        : formatBytes(item.historicalSizeBytes);
                    case 'ratio':
                      return formatRatio(item.ratio);
                    case 'precision': {
                      const isRetrying = retryingDocumentIds.has(item.id);
                      return (
                        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 6 }}>
                          <TooltipHost
                            content={precisionTooltip(item)}
                            directionalHint={DirectionalHint.topCenter}
                          >
                            <span className={`${styles.badge} ${precisionBadgeClassName(item.precision)}`}>
                              {precisionLabel(item)}
                            </span>
                          </TooltipHost>
                          {item.precision === 'partial' && (
                            isRetrying
                              ? <Spinner size={SpinnerSize.xSmall} />
                              : <IconButton
                                  iconProps={{ iconName: 'Refresh' }}
                                  title="Reintentar"
                                  ariaLabel="Reintentar análisis de este documento"
                                  styles={{ root: { height: 24, width: 24, minWidth: 24 } }}
                                  onClick={() => actions.retryDocument(item)}
                                />
                          )}
                        </Stack>
                      );
                    }
                    default:
                      return item.title;
                  }
                }
              }))}
              layoutMode={DetailsListLayoutMode.justified}
              selectionMode={SelectionMode.none}
              isHeaderVisible
              compact
            />
          </Stack>
        )}
      </div>
    </section>
  );
}
