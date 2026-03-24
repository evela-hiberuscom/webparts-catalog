import * as React from 'react';
import {
  ChoiceGroup,
  type IChoiceGroupOption,
  type IColumn,
  ComboBox,
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  SelectionMode,
  Spinner,
  SpinnerSize,
  Stack,
  Text
} from '@fluentui/react';
import { escape } from '@microsoft/sp-lodash-subset';
import { classifyAsyncState, createSafeExternalLink } from '@paquete/spfx-common';
import styles from './HistoricalStorageAnalyzer.module.scss';
import type { IHistoricalStorageAnalyzerProps } from './IHistoricalStorageAnalyzerProps';
import { useHistoricalStorageAnalysis } from '../hooks/useHistoricalStorageAnalysis';
import { downloadAnalysisResult } from '../utils/exportResult';
import { formatBytes, formatPercent, formatRatio } from '../utils/analysisCalculations';
import { getSelectableLibraryTitle, toLibraryComboBoxOption } from '../utils/librarySelection';

const scanModeOptions: IChoiceGroupOption[] = [
  {
    key: 'quickScan',
    text: 'Quick scan'
  },
  {
    key: 'deepScan',
    text: 'Deep scan'
  }
];

const topDocumentColumns: IColumn[] = [
  { key: 'title', name: 'Documento', fieldName: 'title', minWidth: 180, isResizable: true },
  { key: 'currentSizeBytes', name: 'Tamaño actual', fieldName: 'currentSizeBytes', minWidth: 110, isResizable: true },
  { key: 'historicalVersionCount', name: 'Versiones', fieldName: 'historicalVersionCount', minWidth: 90, isResizable: true },
  { key: 'historicalSizeBytes', name: 'Tamaño histórico', fieldName: 'historicalSizeBytes', minWidth: 130, isResizable: true },
  { key: 'ratio', name: 'Ratio', fieldName: 'ratio', minWidth: 80, isResizable: true },
  { key: 'precision', name: 'Precisión', fieldName: 'precision', minWidth: 90, isResizable: true }
];

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

export default function HistoricalStorageAnalyzer(
  props: IHistoricalStorageAnalyzerProps
): React.ReactElement<IHistoricalStorageAnalyzerProps> {
  const {
    libraries,
    selectedLibrary,
    scanMode,
    status,
    isRefreshing,
    errorMessage,
    result,
    actions
  } = useHistoricalStorageAnalysis(props.context, {
    defaultLibraryTitleOrUrl: props.defaultLibraryTitleOrUrl,
    defaultScanMode: props.defaultScanMode,
    topDocumentsLimit: props.topDocumentsLimit,
    maxVersionConcurrency: props.maxVersionConcurrency,
    includeHiddenLibraries: props.includeHiddenLibraries
  });

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
      </div>

      {status === 'loading' && (
        <div className={styles.statePanel}>
          <Spinner size={SpinnerSize.medium} label="Analizando biblioteca..." />
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
            <div className={styles.sectionHeader}>
              <Text variant="mediumPlus" block>
                Top documentos
              </Text>
              <Text variant="small" block className={styles.helperText}>
                Ordenados por coste histórico exacto cuando el análisis lo permite.
              </Text>
            </div>

            <DetailsList
              items={result.topDocuments}
              columns={topDocumentColumns.map((column) => ({
                ...column,
                onRender: (item: {
                  title: string;
                  currentSizeBytes: number;
                  historicalVersionCount: number;
                  historicalSizeBytes: number | null;
                  ratio: number | null;
                  precision: string;
                }) => {
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
                    case 'precision':
                      return <span className={`${styles.badge} ${precisionBadgeClassName(item.precision)}`}>{item.precision}</span>;
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
