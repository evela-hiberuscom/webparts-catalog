import * as React from 'react';
import { DetailsList, DetailsListLayoutMode, SelectionMode, IColumn, Text, Stack, Icon, Panel, PanelType, Label } from '@fluentui/react';
import type { ISiteReport, HealthLevel } from '../models/siteReport';
import { formatBytes, formatDate } from '../utils/formatters';

export interface IReportDashboardProps {
  reports: ISiteReport[];
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
  ok: 'Saludable',
  warning: 'Advertencia',
  critical: 'Crítico',
  unknown: 'Desconocido'
};

export const ReportDashboard: React.FC<IReportDashboardProps> = (props) => {
  const { reports } = props;
  const [sortKey, setSortKey] = React.useState<string>('health');
  const [sortAsc, setSortAsc] = React.useState<boolean>(true);
  const [selectedSite, setSelectedSite] = React.useState<ISiteReport | undefined>(undefined);

  if (reports.length === 0) {
    return (
      <Stack tokens={{ childrenGap: 8 }} styles={{ root: { padding: 16 } }}>
        <Text variant="large">Dashboard de almacenamiento</Text>
        <Text>No hay informes disponibles. Inicia un escaneo desde la pestaña &ldquo;Escaneo&rdquo;.</Text>
      </Stack>
    );
  }

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
      name: 'Sitio',
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
      name: 'Bibliotecas',
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
      name: 'Items',
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
      name: 'Papelera',
      minWidth: 80,
      maxWidth: 100,
      isResizable: true,
      isSorted: sortKey === 'recycleBinItemCount',
      isSortedDescending: sortKey === 'recycleBinItemCount' && !sortAsc,
      onColumnClick,
      onRender: (item: ISiteReport) => <Text>{item.recycleBinItemCount ?? '—'}</Text>
    },
    {
      key: 'recycleBinSize',
      name: 'Tamaño papelera',
      minWidth: 100,
      maxWidth: 130,
      isResizable: true,
      isSorted: sortKey === 'recycleBinSize',
      isSortedDescending: sortKey === 'recycleBinSize' && !sortAsc,
      onColumnClick,
      onRender: (item: ISiteReport) => <Text>{formatBytes(item.recycleBinSizeBytes)}</Text>
    },
    {
      key: 'storageUsed',
      name: 'Almacenamiento',
      minWidth: 100,
      maxWidth: 130,
      isResizable: true,
      isSorted: sortKey === 'storageUsed',
      isSortedDescending: sortKey === 'storageUsed' && !sortAsc,
      onColumnClick,
      onRender: (item: ISiteReport) => <Text>{formatBytes(item.storageUsedBytes)}</Text>
    },
    {
      key: 'flags',
      name: 'Alertas',
      minWidth: 120,
      maxWidth: 200,
      isResizable: true,
      onRender: (item: ISiteReport) => <Text variant="small">{item.flags.join(', ') || '—'}</Text>
    },
    {
      key: 'scanDate',
      name: 'Último escaneo',
      minWidth: 130,
      maxWidth: 180,
      isResizable: true,
      isSorted: sortKey === 'scanDate',
      isSortedDescending: sortKey === 'scanDate' && !sortAsc,
      onColumnClick,
      onRender: (item: ISiteReport) => <Text variant="small">{formatDate(item.scanDate)}</Text>
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
      <Text variant="large">Dashboard de almacenamiento ({reports.length} sitios)</Text>
      <DetailsList
        items={sortedReports}
        columns={columns}
        selectionMode={SelectionMode.none}
        layoutMode={DetailsListLayoutMode.justified}
        compact={true}
        ariaLabelForGrid="Tabla de informes de almacenamiento por sitio"
        onItemInvoked={(item: ISiteReport) => setSelectedSite(item)}
      />
      {selectedSite && (
        <Panel
          isOpen={true}
          type={PanelType.medium}
          headerText={selectedSite.siteTitle || selectedSite.siteUrl}
          onDismiss={() => setSelectedSite(undefined)}
          isLightDismiss={true}
        >
          <Stack tokens={{ childrenGap: 12 }} styles={{ root: { padding: 16 } }}>
            <Label>URL</Label>
            <Text>{selectedSite.siteUrl}</Text>

            <Label>Estado de salud</Label>
            <Stack horizontal tokens={{ childrenGap: 8 }} verticalAlign="center">
              <Icon
                iconName={HEALTH_ICONS[selectedSite.healthLevel]}
                styles={{ root: { color: HEALTH_COLORS[selectedSite.healthLevel] } }}
                aria-label={HEALTH_LABELS[selectedSite.healthLevel]}
                role="img"
              />
              <Text>{HEALTH_LABELS[selectedSite.healthLevel]}</Text>
            </Stack>

            <Label>Almacenamiento</Label>
            <Text>{formatBytes(selectedSite.storageUsedBytes)} / {formatBytes(selectedSite.storageQuotaBytes)}</Text>

            <Label>Bibliotecas</Label>
            <Text>{selectedSite.libraryCount} bibliotecas, {selectedSite.totalLibraryItems} elementos totales</Text>

            <Label>Papelera de reciclaje</Label>
            <Text>{selectedSite.recycleBinItemCount ?? '—'} elementos ({formatBytes(selectedSite.recycleBinSizeBytes)})</Text>

            {selectedSite.flags.length > 0 && (
              <>
                <Label>Alertas</Label>
                <Text>{selectedSite.flags.join(', ')}</Text>
              </>
            )}

            {selectedSite.libraries && selectedSite.libraries.length > 0 && (
              <>
                <Label>Bibliotecas de documentos</Label>
                <DetailsList
                  items={selectedSite.libraries}
                  columns={[
                    { key: 'title', name: 'Nombre', fieldName: 'title', minWidth: 120, isResizable: true },
                    { key: 'itemCount', name: 'Elementos', fieldName: 'itemCount', minWidth: 80 },
                    { key: 'lastModified', name: 'Última modificación', minWidth: 130, onRender: (lib: { lastModified?: string }) => <Text variant="small">{formatDate(lib.lastModified)}</Text> }
                  ]}
                  selectionMode={SelectionMode.none}
                  compact={true}
                />
              </>
            )}

            <Label>Último escaneo</Label>
            <Text variant="small">{formatDate(selectedSite.scanDate)}</Text>

            {selectedSite.errorMessage && (
              <>
                <Label>Error</Label>
                <Text variant="small" styles={{ root: { color: '#a80000' } }}>{selectedSite.errorMessage}</Text>
              </>
            )}
          </Stack>
        </Panel>
      )}
    </Stack>
  );
};
