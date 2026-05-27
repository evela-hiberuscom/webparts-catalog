import * as React from 'react';
import {
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  Icon,
  IconButton,
  type IColumn,
  SelectionMode,
  Stack,
  Text,
  TooltipHost
} from '@fluentui/react';
import * as strings from 'SiteStorageDiagnosticsWebPartStrings';

import type { IHttpClient } from '../models/httpClient';
import type { HealthLevel, ISiteReport } from '../models/siteReport';
import { formatBytes, formatDate } from '../utils/formatters';
import { downloadReportCsv } from '../utils/reportCsv';
import { SiteResultDetails } from './SiteResultDetails';

export interface IReportDashboardProps {
  reports: ISiteReport[];
  spHttpClient: IHttpClient;
}

const HEALTH_COLORS: Record<HealthLevel, string> = {
  ok: '#107c10',
  warning: '#797600',
  critical: '#a80000',
  unknown: '#605e5c'
};

const HEALTH_ICONS: Record<HealthLevel, string> = {
  ok: 'StatusCircleCheckmark',
  warning: 'Warning',
  critical: 'StatusCircleErrorX',
  unknown: 'StatusCircleQuestionMark'
};

const HEALTH_LABELS: Record<HealthLevel, string> = {
  ok: strings.HealthyLabel,
  warning: strings.WarningLabel,
  critical: strings.CriticalLabel,
  unknown: strings.UnknownLabel
};

export const ReportDashboard: React.FC<IReportDashboardProps> = (props) => {
  const { reports, spHttpClient } = props;
  const [sortKey, setSortKey] = React.useState<string>('health');
  const [sortAsc, setSortAsc] = React.useState<boolean>(true);
  const [expandedSiteUrl, setExpandedSiteUrl] = React.useState<string | undefined>(undefined);

  if (reports.length === 0) {
    return (
      <Stack tokens={{ childrenGap: 8 }} styles={{ root: { padding: 16 } }}>
        <Text variant="large">{strings.DashboardTitle}</Text>
        <Text>{strings.DashboardEmptyMessage}</Text>
      </Stack>
    );
  }

  const toggleSite = (site: ISiteReport): void => {
    setExpandedSiteUrl((current) => current === site.siteUrl ? undefined : site.siteUrl);
  };

  const onColumnClick = (_ev: React.MouseEvent<HTMLElement>, column: IColumn): void => {
    if (column.key === sortKey) {
      setSortAsc(!sortAsc);
    } else {
      setSortKey(column.key);
      setSortAsc(true);
    }
  };

  const columns: IColumn[] = [
    {
      key: 'expand',
      name: '',
      minWidth: 36,
      maxWidth: 36,
      onRender: (item: ISiteReport) => {
        const isExpanded = expandedSiteUrl === item.siteUrl;

        return (
          <IconButton
            iconProps={{ iconName: isExpanded ? 'ChevronDown' : 'ChevronRight' }}
            ariaLabel={isExpanded ? strings.CollapseRowAriaLabel : strings.ExpandRowAriaLabel}
            title={isExpanded ? strings.CollapseRowAriaLabel : strings.ExpandRowAriaLabel}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              toggleSite(item);
            }}
          />
        );
      }
    },
    {
      key: 'health',
      name: '',
      minWidth: 24,
      maxWidth: 24,
      isSorted: sortKey === 'health',
      isSortedDescending: sortKey === 'health' && !sortAsc,
      onColumnClick,
      onRender: (item: ISiteReport) => (
        <Icon
          iconName={HEALTH_ICONS[item.healthLevel]}
          styles={{ root: { color: HEALTH_COLORS[item.healthLevel] } }}
          aria-label={HEALTH_LABELS[item.healthLevel]}
          role="img"
        />
      )
    },
    {
      key: 'siteTitle',
      name: strings.SiteColumnLabel,
      fieldName: 'siteTitle',
      minWidth: 150,
      maxWidth: 250,
      isResizable: true,
      isSorted: sortKey === 'siteTitle',
      isSortedDescending: sortKey === 'siteTitle' && !sortAsc,
      onColumnClick,
      onRender: (item: ISiteReport) => <Text>{item.siteTitle || item.siteUrl}</Text>
    },
    {
      key: 'libraryCount',
      name: strings.LibrariesColumnLabel,
      fieldName: 'libraryCount',
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      isSorted: sortKey === 'libraryCount',
      isSortedDescending: sortKey === 'libraryCount' && !sortAsc,
      onColumnClick
    },
    {
      key: 'totalLibraryItems',
      name: strings.ItemsColumnLabel,
      fieldName: 'totalLibraryItems',
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      isSorted: sortKey === 'totalLibraryItems',
      isSortedDescending: sortKey === 'totalLibraryItems' && !sortAsc,
      onColumnClick
    },
    {
      key: 'recycleBinItemCount',
      name: strings.RecycleBinColumnLabel,
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      isSorted: sortKey === 'recycleBinItemCount',
      isSortedDescending: sortKey === 'recycleBinItemCount' && !sortAsc,
      onColumnClick,
      onRender: (item: ISiteReport) => renderRecycleBinCount(item)
    },
    {
      key: 'recycleBinSize',
      name: strings.RecycleBinSizeColumnLabel,
      minWidth: 100,
      maxWidth: 130,
      isResizable: true,
      isSorted: sortKey === 'recycleBinSize',
      isSortedDescending: sortKey === 'recycleBinSize' && !sortAsc,
      onColumnClick,
      onRender: (item: ISiteReport) => renderRecycleBinSize(item)
    },
    {
      key: 'storageUsed',
      name: strings.StorageColumnLabel,
      minWidth: 100,
      maxWidth: 130,
      isResizable: true,
      isSorted: sortKey === 'storageUsed',
      isSortedDescending: sortKey === 'storageUsed' && !sortAsc,
      onColumnClick,
      onRender: (item: ISiteReport) => renderStorageValue(item)
    },
    {
      key: 'flags',
      name: strings.FlagsColumnLabel,
      minWidth: 120,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: ISiteReport) => <Text variant="small">{item.flags.join(', ') || strings.NoAlertsLabel}</Text>
    },
    {
      key: 'scanDate',
      name: strings.ScanDateColumnLabel,
      minWidth: 130,
      maxWidth: 180,
      isResizable: true,
      isSorted: sortKey === 'scanDate',
      isSortedDescending: sortKey === 'scanDate' && !sortAsc,
      onColumnClick,
      onRender: (item: ISiteReport) => <Text variant="small">{item.scanDate ? formatDate(item.scanDate) : strings.UnavailableLabel}</Text>
    }
  ];

  const healthOrder: Record<HealthLevel, number> = { critical: 0, warning: 1, unknown: 2, ok: 3 };

  const sortedReports = [...reports].sort((a, b) => {
    let cmp = 0;
    switch (sortKey) {
      case 'health': cmp = healthOrder[a.healthLevel] - healthOrder[b.healthLevel]; break;
      case 'siteTitle': cmp = (a.siteTitle || '').localeCompare(b.siteTitle || ''); break;
      case 'libraryCount': cmp = a.libraryCount - b.libraryCount; break;
      case 'totalLibraryItems': cmp = a.totalLibraryItems - b.totalLibraryItems; break;
      case 'recycleBinItemCount': cmp = (a.recycleBinItemCount ?? 0) - (b.recycleBinItemCount ?? 0); break;
      case 'recycleBinSize': cmp = (a.recycleBinSizeBytes ?? 0) - (b.recycleBinSizeBytes ?? 0); break;
      case 'storageUsed': cmp = (a.storageUsedBytes ?? 0) - (b.storageUsedBytes ?? 0); break;
      case 'scanDate': cmp = a.scanDate.localeCompare(b.scanDate); break;
      default: cmp = 0;
    }
    return sortAsc ? cmp : -cmp;
  });

  return (
    <Stack tokens={{ childrenGap: 8 }} styles={{ root: { padding: 16 } }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="end" tokens={{ childrenGap: 12 }}>
        <Stack tokens={{ childrenGap: 4 }}>
          <Text variant="large">{strings.DashboardTitle}</Text>
          <Text variant="small">{reports.length} {strings.SitesLabel}</Text>
          <Text variant="small">{strings.DashboardHintMessage}</Text>
        </Stack>
        <DefaultButton text={strings.DownloadCsvButtonLabel} onClick={() => downloadReportCsv(sortedReports)} />
      </Stack>

      <DetailsList
        items={sortedReports}
        columns={columns}
        selectionMode={SelectionMode.none}
        layoutMode={DetailsListLayoutMode.justified}
        compact={true}
        ariaLabelForGrid="Tabla de informes de almacenamiento por sitio"
        onItemInvoked={(item: ISiteReport) => toggleSite(item)}
        onRenderRow={(rowProps, defaultRender) => {
          if (!rowProps) {
            return null;
          }

          const report = rowProps.item as ISiteReport;
          const isExpanded = expandedSiteUrl === report.siteUrl;

          return (
            <div>
              {defaultRender?.(rowProps)}
              {isExpanded && <SiteResultDetails report={report} spHttpClient={spHttpClient} />}
            </div>
          );
        }}
      />
    </Stack>
  );
};

function renderRecycleBinCount(item: ISiteReport): React.ReactNode {
  if (!item.recycleBin.isAccessible) {
    return renderUnavailable(strings.RecycleBinUnavailableLabel, item.recycleBin.errorMessage);
  }

  if (item.recycleBinItemCount === undefined) {
    return renderUnavailable(strings.UnavailableLabel);
  }

  return <Text>{item.recycleBinItemCount}</Text>;
}

function renderRecycleBinSize(item: ISiteReport): React.ReactNode {
  if (!item.recycleBin.isAccessible) {
    return renderUnavailable(strings.RecycleBinUnavailableLabel, item.recycleBin.errorMessage);
  }

  if (item.recycleBinSizeBytes === undefined) {
    return renderUnavailable(strings.UnavailableLabel);
  }

  return <Text>{formatBytes(item.recycleBinSizeBytes)}</Text>;
}

function renderStorageValue(item: ISiteReport): React.ReactNode {
  if (item.storageUsedBytes === undefined) {
    return renderUnavailable(strings.UnavailableLabel, item.errorMessage);
  }

  return <Text>{formatBytes(item.storageUsedBytes)}</Text>;
}

function renderUnavailable(label: string, detail?: string): React.ReactElement {
  const content = detail ? `${strings.UnavailableHintMessage} ${detail}` : strings.UnavailableHintMessage;
  return (
    <TooltipHost content={content}>
      <span>{label}</span>
    </TooltipHost>
  );
}
