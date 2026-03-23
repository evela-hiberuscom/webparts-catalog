import { type ILaunchItem, type ILaunchItemInput, type ILaunchRepositoryResult } from '../models/launchModels';

const DEFAULT_LAUNCH_ITEMS: ILaunchItemInput[] = [
  {
    id: 'hr-portal',
    title: 'Portal RRHH',
    category: 'RRHH',
    audienceTokens: ['hr', 'people'],
    description: 'Accede a políticas, incidencias y formularios del equipo de personas.',
    iconName: 'Contact',
    priority: 1,
    featured: true,
    openUrl: '/sites/hr'
  },
  {
    id: 'apps-directory',
    title: 'Directorio de aplicaciones',
    category: 'Navegación',
    audienceTokens: ['general', 'all'],
    description: 'Agrupa accesos a apps corporativas y herramientas de uso frecuente.',
    iconName: 'AppIconDefault',
    priority: 2,
    featured: true,
    openUrl: '/sites/apps'
  },
  {
    id: 'forms-hub',
    title: 'Centro de formularios',
    category: 'Operaciones',
    audienceTokens: ['operations', 'people'],
    description: 'Solicitud de recursos, incidencias y peticiones internas.',
    iconName: 'FormLibrary',
    priority: 3,
    featured: false,
    openUrl: '/sites/forms'
  },
  {
    id: 'support-desk',
    title: 'Soporte corporativo',
    category: 'Operaciones',
    audienceTokens: ['it', 'ops', 'general'],
    description: 'Acceso al canal de soporte y a las respuestas más frecuentes.',
    iconName: 'Help',
    priority: 4,
    featured: false,
    openUrl: '/sites/support'
  },
  {
    id: 'news-hub',
    title: 'Novedades internas',
    category: 'Comunicación',
    audienceTokens: ['general', 'communications'],
    description: 'Últimas noticias, hitos y comunicaciones relevantes.',
    iconName: 'Ringer',
    priority: 5,
    featured: false,
    openUrl: '/sites/news'
  },
  {
    id: 'request-center',
    title: 'Solicitudes rápidas',
    category: 'Operaciones',
    audienceTokens: ['operations', 'general'],
    description: 'Punto de entrada para solicitar aprobaciones y recursos comunes.',
    iconName: 'LightningBolt',
    priority: 6,
    featured: false,
    openUrl: '/sites/requests'
  }
];

function parseBoolean(input: boolean | string | undefined, fallback: boolean): boolean {
  if (typeof input === 'boolean') {
    return input;
  }

  if (typeof input === 'string') {
    return input.toLowerCase() === 'true';
  }

  return fallback;
}

function parsePriority(input: number | string | undefined): number | undefined {
  if (input === undefined || input === '') {
    return undefined;
  }

  const value = Number(input);
  return Number.isFinite(value) ? value : undefined;
}

function coerceLaunchItem(input: ILaunchItemInput, index: number, defaultCategory: string, defaultOpenInNewTab: boolean): ILaunchItem {
  const title = (input.title ?? '').trim();
  const openUrl = (input.openUrl ?? '').trim();
  const audienceTokens = Array.isArray(input.audienceTokens)
    ? input.audienceTokens
    : typeof input.audienceTokens === 'string'
      ? input.audienceTokens.split(',').map((token) => token.trim())
      : [];
  return {
    id: (input.id ?? `item-${index + 1}`).trim(),
    title: title || `Acceso ${index + 1}`,
    category: (input.category ?? defaultCategory ?? 'General').trim() || 'General',
    audienceTokens: audienceTokens.filter(Boolean),
    description: (input.description ?? '').trim() || 'Sin descripción disponible.',
    iconName: (input.iconName ?? 'Page').trim() || 'Page',
    priority: parsePriority(input.priority),
    featured: parseBoolean(input.featured, false),
    openUrl: openUrl || '#',
    openInNewTab: parseBoolean(input.openInNewTab, defaultOpenInNewTab)
  };
}

export function loadLaunchItemsFromConfig(config: {
  launchItemsJson: string;
  defaultCategory: string;
  openInNewTab: boolean;
}): ILaunchRepositoryResult {
  const notes: string[] = [];
  const raw = (config.launchItemsJson ?? '').trim();

  if (!raw) {
    notes.push('No launchItemsJson provided; using built-in default items.');
    return {
      items: DEFAULT_LAUNCH_ITEMS.map((item, index) => coerceLaunchItem(item, index, config.defaultCategory, config.openInNewTab)),
      sourceLabel: 'Built-in sample catalog',
      hasPartialData: false,
      notes
    };
  }

  try {
    const parsed = JSON.parse(raw) as ILaunchItemInput[] | { items?: ILaunchItemInput[] };
    const items = Array.isArray(parsed) ? parsed : parsed.items ?? [];

    if (!Array.isArray(items) || items.length === 0) {
      notes.push('launchItemsJson parsed but did not contain items; using built-in default items.');
      return {
        items: DEFAULT_LAUNCH_ITEMS.map((item, index) => coerceLaunchItem(item, index, config.defaultCategory, config.openInNewTab)),
        sourceLabel: 'Built-in sample catalog',
        hasPartialData: true,
        notes
      };
    }

    const normalizedItems = items.map((item, index) => coerceLaunchItem(item, index, config.defaultCategory, config.openInNewTab));
    const hasPartialData = normalizedItems.some((item) => item.openUrl === '#' || item.description === 'Sin descripción disponible.' || item.audienceTokens.length === 0);
    return {
      items: normalizedItems,
      sourceLabel: 'Property pane JSON',
      hasPartialData,
      notes
    };
  } catch (error) {
    notes.push(`Failed to parse launchItemsJson: ${(error as Error).message}`);
    return {
      items: DEFAULT_LAUNCH_ITEMS.map((item, index) => coerceLaunchItem(item, index, config.defaultCategory, config.openInNewTab)),
      sourceLabel: 'Built-in sample catalog',
      hasPartialData: true,
      notes
    };
  }
}

export class StaticLaunchRepository {
  public load(config: {
    launchItemsJson: string;
    defaultCategory: string;
    openInNewTab: boolean;
  }): ILaunchRepositoryResult {
    return loadLaunchItemsFromConfig(config);
  }
}
