import { SPHttpClient } from '@microsoft/sp-http';

import type {
  DataSourceType,
  IAudienceLinkInput,
  IAudienceLinkRepositoryResult,
  IAudienceQuickLinksWebPartProps
} from '../models/audienceLinkModels';
import { coerceAudienceLink, markPartialLink, sortAudienceLinks } from '../utils/audienceLinkUtils';

const DEFAULT_SAMPLE_LINKS: IAudienceLinkInput[] = [
  {
    id: 'general-home',
    title: 'Portal general',
    category: 'General',
    audiences: ['general', 'all'],
    isGeneric: true,
    description: 'Entrada común a noticias, formularios y recursos compartidos.',
    iconName: 'Home',
    openUrl: '/sites/intranet',
    priority: 1
  },
  {
    id: 'people-hub',
    title: 'Equipo de personas',
    category: 'Personas',
    audiences: ['people', 'hr', 'human resources'],
    description: 'Políticas, vacaciones, onboarding y procesos del área de personas.',
    iconName: 'Contact',
    openUrl: '/sites/people',
    priority: 2
  },
  {
    id: 'operations-hub',
    title: 'Operaciones internas',
    category: 'Operaciones',
    audiences: ['operations', 'ops'],
    description: 'Solicitudes, aprobaciones y recursos operativos de uso frecuente.',
    iconName: 'Processing',
    openUrl: '/sites/operations',
    priority: 3
  },
  {
    id: 'sales-hub',
    title: 'Canal comercial',
    category: 'Comercial',
    audiences: ['sales', 'commercial'],
    description: 'Acceso a materiales, oportunidades y herramientas del equipo comercial.',
    iconName: 'BarChartVertical',
    openUrl: '/sites/sales',
    priority: 4
  },
  {
    id: 'iberia-hub',
    title: 'Portal Iberia',
    category: 'País',
    audiences: ['es', 'es-es', 'iberia', 'spain'],
    description: 'Enlaces y contenido segmentado para la audiencia de Iberia.',
    iconName: 'World',
    openUrl: '/sites/iberia',
    priority: 5
  },
  {
    id: 'finance-hub',
    title: 'Finanzas y control',
    category: 'Finanzas',
    audiences: ['finance', 'controlling', 'accounting'],
    description: 'Herramientas de reporting, cierre y seguimiento financiero.',
    iconName: 'Financial',
    openUrl: '/sites/finance',
    priority: 6
  }
];

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

function parseNumericField(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return undefined;
}

function readJsonArray(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const candidate = payload as { value?: unknown; d?: { results?: unknown } };

    if (Array.isArray(candidate.value)) {
      return candidate.value;
    }

    if (candidate.d && Array.isArray(candidate.d.results)) {
      return candidate.d.results;
    }
  }

  return [];
}

function buildEmptyResult(sourceLabel: string, defaultCategory: string, note: string): IAudienceLinkRepositoryResult {
  return {
    items: [],
    sourceLabel,
    hasPartialData: false,
    notes: [note, `observado: no se devolvieron accesos para la categoría base ${defaultCategory}.`]
  };
}

function resolveSameOriginJsonUrl(url: string, baseUrl: string): string {
  const trimmedUrl = url.trim();

  if (!trimmedUrl) {
    throw new Error('JsonUrl requires a configured URL.');
  }

  const candidateUrl = new URL(trimmedUrl, baseUrl);
  const baseOrigin = new URL(baseUrl).origin;

  if (candidateUrl.origin !== baseOrigin) {
    throw new Error('JsonUrl must resolve to the same origin as the SharePoint web.');
  }

  return candidateUrl.toString();
}

function coerceRawInput(item: unknown): IAudienceLinkInput {
  if (!item || typeof item !== 'object') {
    return {};
  }

  const raw = item as Record<string, unknown>;

  return {
    id: typeof raw.Id === 'number' ? String(raw.Id) : typeof raw.id === 'string' ? raw.id : undefined,
    title: typeof raw.Title === 'string' ? raw.Title : typeof raw.title === 'string' ? raw.title : undefined,
    category: typeof raw.Category === 'string' ? raw.Category : typeof raw.category === 'string' ? raw.category : undefined,
    iconName:
      typeof raw.Icon === 'string'
        ? raw.Icon
        : typeof raw.IconName === 'string'
          ? raw.IconName
          : typeof raw.iconName === 'string'
            ? raw.iconName
            : undefined,
    description:
      typeof raw.Description === 'string'
        ? raw.Description
        : typeof raw.description === 'string'
          ? raw.description
          : undefined,
    openUrl:
      typeof raw.OpenUrl === 'string'
        ? raw.OpenUrl
        : typeof raw.Url === 'string'
          ? raw.Url
          : typeof raw.openUrl === 'string'
            ? raw.openUrl
            : undefined,
    audiences:
      typeof raw.Audiences === 'string' || Array.isArray(raw.Audiences)
        ? (raw.Audiences as string | string[])
        : typeof raw.audiences === 'string' || Array.isArray(raw.audiences)
          ? (raw.audiences as string | string[])
          : undefined,
    isGeneric:
      typeof raw.IsGeneric === 'boolean' || typeof raw.IsGeneric === 'string'
        ? (raw.IsGeneric as boolean | string)
        : typeof raw.isGeneric === 'boolean' || typeof raw.isGeneric === 'string'
          ? (raw.isGeneric as boolean | string)
          : undefined,
    priority:
      parseNumericField(raw.Priority) ??
      parseNumericField(raw.priority) ??
      parseNumericField(raw.Order) ??
      parseNumericField(raw.order)
  };
}

function normalizeSampleLinks(defaultCategory: string): IAudienceLinkRepositoryResult {
  const items = sortAudienceLinks(
    DEFAULT_SAMPLE_LINKS.map((entry, index) => markPartialLink(coerceAudienceLink(entry, index, defaultCategory)))
  );

  return {
    items,
    sourceLabel: 'Catálogo interno de ejemplo',
    hasPartialData: false,
    notes: [
      'observado: el proyecto necesita renderizar sin depender de la configuración de la lista.',
      'inferido: el catálogo sample cubre general, personas, operaciones, comercial, país y finanzas.',
      'pendiente de validar: el equipo de contenido puede sustituirlo por una lista SharePoint real o una URL JSON.'
    ]
  };
}

async function loadJsonCatalog(url: string, baseUrl: string, defaultCategory: string): Promise<IAudienceLinkRepositoryResult> {
  const response = await fetch(resolveSameOriginJsonUrl(url, baseUrl), {
    method: 'GET',
    credentials: 'same-origin'
  });

  if (!response.ok) {
    throw new Error(`JSON catalog request failed with HTTP ${response.status}.`);
  }

  const payload = await response.json();
  const rawItems = readJsonArray(payload);

  if (rawItems.length === 0) {
    return buildEmptyResult(
      'Catálogo JSON vacío',
      defaultCategory,
      'observado: el feed JSON respondió correctamente pero sin registros.'
    );
  }

  const items = sortAudienceLinks(
    rawItems.map((item, index) => markPartialLink(coerceAudienceLink(coerceRawInput(item), index, defaultCategory)))
  );

  return {
    items,
    sourceLabel: 'Catálogo JSON externo',
    hasPartialData: items.some((item) => item.sourceBadge === 'partial' || !item.openUrl),
    notes: [
      'observado: el origen JSON permite prototipar sin lista SharePoint.',
      'inferido: el feed debe devolver un array o un objeto con propiedad items.'
    ]
  };
}

async function loadSharePointList(
  spHttpClient: SPHttpClient,
  webUrl: string,
  listTitle: string,
  defaultCategory: string,
  maxItems: number
): Promise<IAudienceLinkRepositoryResult> {
  const url = `${webUrl}/_api/web/lists/getbytitle('${escapeODataString(
    listTitle
  )}')/items?$select=Id,Title,Category,Icon,IconName,Description,OpenUrl,Url,Audiences,IsGeneric,Priority,Order&$top=${maxItems}`;
  const response = await spHttpClient.get(url, SPHttpClient.configurations.v1, {
    headers: {
      Accept: 'application/json;odata=nometadata'
    }
  });

  if (!response.ok) {
    throw new Error(`SharePoint list request failed with HTTP ${response.status}.`);
  }

  const payload = await response.json();
  const rawItems = readJsonArray(payload);

  if (rawItems.length === 0) {
    return buildEmptyResult(
      `Lista SharePoint vacía: ${listTitle}`,
      defaultCategory,
      'observado: la lista SharePoint respondió correctamente pero sin registros.'
    );
  }

  const items = sortAudienceLinks(
    rawItems.map((item, index) => markPartialLink(coerceAudienceLink(coerceRawInput(item), index, defaultCategory)))
  );

  return {
    items,
    sourceLabel: `Lista SharePoint: ${listTitle}`,
    hasPartialData: items.some((item) => item.sourceBadge === 'partial' || !item.openUrl),
    notes: [
      'observado: el listado usa campos Title, Category, Icon, Description, OpenUrl, Audiences, IsGeneric y Priority.',
      'pendiente de validar: si la lista usa nombres internos distintos, hay que ajustar el mapeo del repositorio.'
    ]
  };
}

export class AudienceLinksRepository {
  constructor(private readonly spHttpClient: SPHttpClient, private readonly webUrl: string) {}

  public async load(config: IAudienceQuickLinksWebPartProps): Promise<IAudienceLinkRepositoryResult> {
    const defaultCategory = config.defaultCategory.trim() || 'General';
    const dataSourceType: DataSourceType = config.dataSourceType;
    const listTitleOrUrl = config.listTitleOrUrl.trim();

    if (dataSourceType === 'StaticConfig') {
      return normalizeSampleLinks(defaultCategory);
    }

    if (!listTitleOrUrl) {
      throw new Error(`${dataSourceType} requires listTitleOrUrl.`);
    }

    if (dataSourceType === 'JsonUrl') {
      return loadJsonCatalog(listTitleOrUrl, this.webUrl, defaultCategory);
    }

    return loadSharePointList(this.spHttpClient, this.webUrl, listTitleOrUrl, defaultCategory, Math.max(1, config.maxItems));
  }
}
