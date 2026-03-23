import type { RecentResourceType } from './recentAccesses.types';

export const recentAccessesTheme = {
  primary: '#1032CF',
  primaryDark: '#19255A',
  accent: '#5B53FF',
  accentHover: '#4A42E0',
  textPrimary: '#111111',
  textSecondary: '#3A3A3A',
  textTertiary: '#707070',
  border: '#D6D6D6',
  surface: '#FFFFFF',
  surfaceSoft: '#F7F8FD',
  surfaceMuted: '#F5F5F5'
} as const;

export const recentAccessesCopy = {
  title: 'Mis accesos recientes',
  subtitle: 'Retoma trabajo reciente en uno o dos clics.',
  empty: 'No hay accesos recientes visibles.',
  error: 'No se han podido cargar tus accesos recientes.',
  partial: 'La vista usa datos parciales o de respaldo porque la fuente principal no está completamente conectada.',
  loading: 'Cargando accesos recientes',
  fallbackSource: 'Fuente de respaldo local'
} as const;

export const recentResourceTypes: RecentResourceType[] = ['document', 'page', 'app', 'unknown'];

export const recentAccessesDefaults = {
  maxItems: 6,
  sourceMode: 'SharePointList' as const
};
