import * as React from 'react';
import {
  DetailsList,
  DetailsListLayoutMode,
  IconButton,
  Link,
  MessageBar,
  MessageBarType,
  SelectionMode,
  Spinner,
  SpinnerSize,
  Stack,
  Text
} from '@fluentui/react';
import * as strings from 'SiteStorageDiagnosticsWebPartStrings';

import type { IHttpClient } from '../models/httpClient';
import type { ILibraryItemMetrics, ILibraryMetrics, ISiteReport } from '../models/siteReport';
import { SiteMetricsRepository } from '../repositories/siteMetricsRepository';
import { formatBytes, formatDate } from '../utils/formatters';

export interface ISiteResultDetailsProps {
  report: ISiteReport;
  spHttpClient: IHttpClient;
}

interface ILibraryItemsLoadState {
  status: 'idle' | 'loading' | 'loaded' | 'error';
  items: ILibraryItemMetrics[];
  errorMessage: string | undefined;
}

export const SiteResultDetails: React.FC<ISiteResultDetailsProps> = (props) => {
  const { report, spHttpClient } = props;
  const [expandedLibraries, setExpandedLibraries] = React.useState<Record<string, boolean>>({});
  const [libraryItemsByKey, setLibraryItemsByKey] = React.useState<Record<string, ILibraryItemsLoadState>>({});

  const getLibraryKey = (library: ILibraryMetrics): string => `${report.siteUrl}::${library.id}`;

  const loadLibraryItems = async (library: ILibraryMetrics): Promise<void> => {
    const libraryKey = getLibraryKey(library);
    const currentState = libraryItemsByKey[libraryKey];

    if (currentState?.status === 'loading' || currentState?.status === 'loaded') {
      return;
    }

    setLibraryItemsByKey((current) => ({
      ...current,
      [libraryKey]: {
        status: 'loading',
        items: [],
        errorMessage: undefined
      }
    }));

    try {
      const repository = new SiteMetricsRepository({ spHttpClient });
      const items = await repository.getLibraryItems(report.siteUrl, library.id);

      setLibraryItemsByKey((current) => ({
        ...current,
        [libraryKey]: {
          status: 'loaded',
          items,
          errorMessage: undefined
        }
      }));
    } catch (error) {
      setLibraryItemsByKey((current) => ({
        ...current,
        [libraryKey]: {
          status: 'error',
          items: [],
          errorMessage: error instanceof Error ? error.message : strings.UnavailableLabel
        }
      }));
    }
  };

  const toggleLibrary = (library: ILibraryMetrics): void => {
    const libraryKey = getLibraryKey(library);
    const shouldExpand = !expandedLibraries[libraryKey];

    setExpandedLibraries((current) => ({
      ...current,
      [libraryKey]: shouldExpand
    }));

    if (shouldExpand) {
      loadLibraryItems(library).catch(() => undefined);
    }
  };

  const libraryColumns = [
    {
      key: 'expand',
      name: '',
      minWidth: 36,
      maxWidth: 36,
      onRender: (library: ILibraryMetrics) => {
        const libraryKey = getLibraryKey(library);
        const isExpanded = expandedLibraries[libraryKey] === true;

        return (
          <IconButton
            iconProps={{ iconName: isExpanded ? 'ChevronDown' : 'ChevronRight' }}
            ariaLabel={isExpanded ? strings.CollapseRowAriaLabel : strings.ExpandRowAriaLabel}
            title={isExpanded ? strings.CollapseRowAriaLabel : strings.ExpandRowAriaLabel}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleLibrary(library);
            }}
          />
        );
      }
    },
    {
      key: 'title',
      name: strings.LibraryNameColumnLabel,
      fieldName: 'title',
      minWidth: 180,
      isResizable: true
    },
    {
      key: 'itemCount',
      name: strings.ItemsColumnLabel,
      fieldName: 'itemCount',
      minWidth: 90,
      maxWidth: 110,
      isResizable: true
    },
    {
      key: 'lastModified',
      name: strings.LibraryLastModifiedColumnLabel,
      minWidth: 170,
      isResizable: true,
      onRender: (library: ILibraryMetrics) => renderDateValue(library.lastModified)
    }
  ];

  const itemColumns = [
    {
      key: 'name',
      name: strings.ItemNameColumnLabel,
      minWidth: 200,
      isResizable: true,
      onRender: (item: ILibraryItemMetrics) => (
        <Link href={item.url} target="_blank" rel="noreferrer">
          {item.name}
        </Link>
      )
    },
    {
      key: 'type',
      name: strings.ItemTypeColumnLabel,
      minWidth: 90,
      maxWidth: 110,
      onRender: (item: ILibraryItemMetrics) => <Text>{item.isFolder ? strings.FolderItemTypeLabel : strings.FileItemTypeLabel}</Text>
    },
    {
      key: 'size',
      name: strings.ItemSizeColumnLabel,
      minWidth: 110,
      maxWidth: 130,
      onRender: (item: ILibraryItemMetrics) => <Text>{item.isFolder ? strings.NotApplicableLabel : formatBytesOrUnavailable(item.sizeBytes)}</Text>
    },
    {
      key: 'modified',
      name: strings.ItemModifiedColumnLabel,
      minWidth: 160,
      isResizable: true,
      onRender: (item: ILibraryItemMetrics) => renderDateValue(item.lastModified)
    },
    {
      key: 'modifiedBy',
      name: strings.ItemModifiedByColumnLabel,
      minWidth: 140,
      isResizable: true,
      onRender: (item: ILibraryItemMetrics) => <Text>{item.modifiedBy || strings.UnavailableLabel}</Text>
    }
  ];

  return (
    <Stack tokens={{ childrenGap: 12 }} styles={{ root: { padding: '12px 16px 16px 56px', background: '#faf9f8', borderBottom: '1px solid #edebe9' } }}>
      <Stack horizontal wrap tokens={{ childrenGap: 24 }}>
        {renderMetric(strings.SiteColumnLabel, report.siteTitle || report.siteUrl)}
        {renderMetric(strings.SiteUrlLabel, report.siteUrl)}
        {renderMetric(strings.HealthLabel, getHealthLabel(report.healthLevel))}
        {renderMetric(strings.StorageColumnLabel, `${formatBytesOrUnavailable(report.storageUsedBytes)} / ${formatBytesOrUnavailable(report.storageQuotaBytes)}`)}
        {renderMetric(strings.LibrariesColumnLabel, String(report.libraryCount))}
        {renderMetric(strings.ItemsColumnLabel, String(report.totalLibraryItems))}
        {renderMetric(strings.RecycleBinColumnLabel, report.recycleBin.isAccessible ? String(report.recycleBinItemCount ?? strings.UnavailableLabel) : strings.RecycleBinUnavailableLabel)}
        {renderMetric(strings.FlagsColumnLabel, report.flags.join(', ') || strings.NoAlertsLabel)}
        {renderMetric(strings.ScanDateColumnLabel, report.scanDate ? formatDate(report.scanDate) : strings.UnavailableLabel)}
      </Stack>

      {report.errorMessage && (
        <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
          <strong>{strings.ErrorLabel}:</strong> {report.errorMessage}
        </MessageBar>
      )}

      <Stack tokens={{ childrenGap: 8 }}>
        <Text variant="mediumPlus">{strings.LibraryInventoryLabel}</Text>
        {report.libraries.length === 0 ? (
          <Text>{strings.NoLibrariesLabel}</Text>
        ) : (
          <DetailsList
            items={report.libraries}
            columns={libraryColumns}
            selectionMode={SelectionMode.none}
            layoutMode={DetailsListLayoutMode.justified}
            compact={true}
            onRenderRow={(rowProps, defaultRender) => {
              if (!rowProps) {
                return null;
              }

              const library = rowProps.item as ILibraryMetrics;
              const libraryKey = getLibraryKey(library);
              const libraryState = libraryItemsByKey[libraryKey];
              const isExpanded = expandedLibraries[libraryKey] === true;

              return (
                <div>
                  {defaultRender?.(rowProps)}
                  {isExpanded && (
                    <Stack styles={{ root: { padding: '8px 12px 12px 40px', background: '#ffffff', borderBottom: '1px solid #f3f2f1' } }}>
                      {libraryState?.status === 'loading' && (
                        <Spinner size={SpinnerSize.small} label={strings.LoadingItemsLabel} />
                      )}

                      {libraryState?.status === 'error' && (
                        <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
                          <strong>{strings.ErrorLabel}:</strong> {libraryState.errorMessage}
                        </MessageBar>
                      )}

                      {libraryState?.status === 'loaded' && libraryState.items.length === 0 && (
                        <Text>{strings.NoItemsLabel}</Text>
                      )}

                      {libraryState?.status === 'loaded' && libraryState.items.length > 0 && (
                        <DetailsList
                          items={libraryState.items}
                          columns={itemColumns}
                          selectionMode={SelectionMode.none}
                          layoutMode={DetailsListLayoutMode.justified}
                          compact={true}
                        />
                      )}
                    </Stack>
                  )}
                </div>
              );
            }}
          />
        )}
      </Stack>
    </Stack>
  );
};

function renderMetric(label: string, value: string): React.ReactElement {
  return (
    <Stack tokens={{ childrenGap: 2 }}>
      <Text variant="small">{label}</Text>
      <Text>{value}</Text>
    </Stack>
  );
}

function renderDateValue(value: string | undefined): React.ReactElement {
  return <Text>{value ? formatDate(value) : strings.UnavailableLabel}</Text>;
}

function formatBytesOrUnavailable(value: number | undefined): string {
  return value === undefined ? strings.UnavailableLabel : formatBytes(value);
}

function getHealthLabel(level: ISiteReport['healthLevel']): string {
  switch (level) {
    case 'ok':
      return strings.HealthyLabel;
    case 'warning':
      return strings.WarningLabel;
    case 'critical':
      return strings.CriticalLabel;
    default:
      return strings.UnknownLabel;
  }
}