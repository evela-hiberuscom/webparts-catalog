import * as React from 'react';
import * as strings from 'HistoricalStorageAnalyzerWebPartStrings';
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

function getScanModeOptions(): IChoiceGroupOption[] {
  return [
    {
      key: 'quickScan',
      text: strings.ScanModeQuickLabel
    },
    {
      key: 'deepScan',
      text: strings.ScanModeDeepLabel
    }
  ];
}

function buildColumns(): IColumn[] {
  return [
    { key: 'title', name: strings.ColumnDocumentLabel, fieldName: 'title', minWidth: 180, isResizable: true, isSorted: false, isSortedDescending: false },
    { key: 'currentSizeBytes', name: strings.ColumnCurrentSizeLabel, fieldName: 'currentSizeBytes', minWidth: 110, isResizable: true, isSorted: false, isSortedDescending: false },
    { key: 'historicalVersionCount', name: strings.ColumnVersionsLabel, fieldName: 'historicalVersionCount', minWidth: 90, isResizable: true, isSorted: false, isSortedDescending: false },
    { key: 'historicalSizeBytes', name: strings.ColumnHistoricalSizeLabel, fieldName: 'historicalSizeBytes', minWidth: 130, isResizable: true, isSorted: false, isSortedDescending: false },
    { key: 'ratio', name: strings.ColumnRatioLabel, fieldName: 'ratio', minWidth: 80, isResizable: true, isSorted: false, isSortedDescending: false },
    { key: 'precision', name: strings.ColumnPrecisionLabel, fieldName: 'precision', minWidth: 160, isResizable: true, isSorted: false, isSortedDescending: false }
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
    case 'exact': return strings.PrecisionExactLabel;
    case 'partial':
      return item.warnings.indexOf('throttled') !== -1 ? strings.PrecisionPartialThrottledLabel : strings.PrecisionPartialErrorLabel;
    case 'estimated': return strings.PrecisionEstimatedLabel;
    default: return item.precision;
  }
}

function precisionTooltip(item: IHistoricalStorageDocumentSnapshot): string {
  switch (item.precision) {
    case 'exact':
      return strings.PrecisionExactTooltip;
    case 'partial':
      return item.warnings.indexOf('throttled') !== -1
        ? strings.PrecisionPartialThrottledTooltip
        : strings.PrecisionPartialErrorTooltip;
    case 'estimated':
      return strings.PrecisionEstimatedTooltip;
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
    includeHiddenLibraries: props.includeHiddenLibraries,
    labels: {
      loadLibrariesError: strings.LoadLibrariesErrorMessage,
      analyzeLibraryError: strings.AnalyzeLibraryErrorMessage
    }
  });

  const scanModeOptions = getScanModeOptions();
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
      ? strings.StatusEmptyLabel
      : status === 'throttled'
        ? strings.StatusThrottledLabel
        : status === 'partialData'
          ? strings.StatusPartialDataLabel
          : result?.warnings[0] || '');

  const kpis = result
    ? [
        { label: strings.KpiDocumentsLabel, value: result.summary.totalDocuments.toLocaleString('es-ES') },
        { label: strings.KpiCurrentSizeLabel, value: formatBytes(result.summary.visibleCurrentSizeBytes) },
        { label: strings.KpiHistoricalVersionsLabel, value: result.summary.historicalVersionCount.toLocaleString('es-ES') },
        {
          label: strings.KpiHistoricalSizeLabel,
          value:
            result.summary.historicalEstimatedSizeBytes !== null &&
            result.summary.historicalEstimatedSizeBytes !== undefined
              ? formatBytes(result.summary.historicalEstimatedSizeBytes)
              : '—'
        },
        { label: strings.KpiRatioLabel, value: formatRatio(result.summary.historicalToCurrentRatio) },
        { label: strings.KpiCoverageLabel, value: formatPercent(result.summary.analysisCoveragePercent) },
        { label: strings.KpiDurationLabel, value: `${Math.max(0, result.summary.durationMs)} ms` }
      ]
    : [];

  const progressPercent = progress && progress.totalFiles > 0
    ? progress.completedFiles / progress.totalFiles
    : undefined;

  const progressLabel = progress
    ? progress.phase === 'listing'
      ? strings.ProgressListingLabel
      : strings.ProgressAnalyzingLabel.replace('{0}', String(progress.completedFiles)).replace('{1}', String(progress.totalFiles))
    : undefined;

  const progressDescription = progress?.phase === 'analyzing' && progress.currentFileName
    ? progress.currentFileName
    : undefined;

  return (
    <section className={`${styles.root} ${props.hasTeamsContext ? styles.teams : ''} ${props.isDarkTheme ? styles.darkTheme : ''}`}>
      <div className={styles.hero}>
        <div className={styles.heroTitleBlock}>
          <Text variant="xxLarge" block className={styles.title}>
            {escape(strings.WebPartTitle)}
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
            text={strings.RefreshButton}
            iconProps={{ iconName: 'Refresh' }}
            onClick={actions.refresh}
            disabled={!selectedLibrary || isRefreshing}
          />
          <DefaultButton
            text={strings.ExportJsonButton}
            iconProps={{ iconName: 'Download' }}
            onClick={() => result && downloadAnalysisResult(result)}
            disabled={!result}
          />
          <DefaultButton
            text={strings.OpenLibraryButton}
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
            {strings.LibraryControlLabel}
          </Text>
          <ComboBox
            placeholder={strings.LibraryComboBoxPlaceholder}
            options={libraries.map((lib) => toLibraryComboBoxOption(lib, strings.LibraryItemCountSuffix))}
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
            {getSelectableLibraryTitle(selectedLibrary, strings.NoLibrarySelectedLabel)}
          </Text>
        </div>

        <div className={styles.controlBlock}>
          <Text variant="smallPlus" block className={styles.controlLabel}>
            {strings.ScanModeControlLabel}
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
            {strings.MaxDocumentsControlLabel}
          </Text>
          <Checkbox
            label={strings.AllDocumentsCheckboxLabel}
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
              ? strings.AllDocumentsHelperText
              : strings.TopDocumentsHelperText.replace('{0}', String(maxDocumentsToScan))}
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
            <Spinner size={SpinnerSize.medium} label={strings.SpinnerAnalyzingLabel} />
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
                  {strings.AnalyzedDocumentsSectionLabel}
                </Text>
                <Text variant="small" block className={styles.helperText}>
                  {strings.SortHintLabel.replace('{0}', String(sortedDocuments.length))}
                </Text>
              </div>
              {totalPages > 1 && (
                <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 4 }}>
                  <IconButton
                    iconProps={{ iconName: 'ChevronLeft' }}
                    disabled={safeCurrentPage <= 1}
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    ariaLabel={strings.PreviousPageAriaLabel}
                  />
                  <Text variant="small">
                    {safeCurrentPage} / {totalPages}
                  </Text>
                  <IconButton
                    iconProps={{ iconName: 'ChevronRight' }}
                    disabled={safeCurrentPage >= totalPages}
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    ariaLabel={strings.NextPageAriaLabel}
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
                                  title={strings.RetryButtonTitle}
                                  ariaLabel={strings.RetryButtonAriaLabel}
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
