import type { IPropertyPaneDropdownOption } from '@microsoft/sp-property-pane';
import type { ProjectStatusDataSourceType, ProjectStatusFilter } from './models/projectStatusTypes';

export const DEFAULT_DATA_SOURCE_TYPE: ProjectStatusDataSourceType = 'StaticConfig';
export const DEFAULT_STATUS_FILTER: ProjectStatusFilter = 'all';
export const MAX_PROJECT_ITEMS = 30;

export const DATA_SOURCE_OPTIONS: IPropertyPaneDropdownOption[] = [
  { key: 'StaticConfig', text: 'Configuración estática' },
  { key: 'SharePointList', text: 'Lista de SharePoint' },
  { key: 'JsonUrl', text: 'JSON desde URL' }
];

export const STATUS_FILTER_OPTIONS: IPropertyPaneDropdownOption[] = [
  { key: 'all', text: 'Todos' },
  { key: 'red', text: 'Rojo' },
  { key: 'amber', text: 'Ámbar' },
  { key: 'green', text: 'Verde' },
  { key: 'unknown', text: 'Desconocido' }
];

export function normalizeProjectStatusDataSourceType(
  value: string | undefined
): ProjectStatusDataSourceType {
  return value === 'SharePointList' || value === 'JsonUrl' || value === 'StaticConfig'
    ? value
    : DEFAULT_DATA_SOURCE_TYPE;
}
