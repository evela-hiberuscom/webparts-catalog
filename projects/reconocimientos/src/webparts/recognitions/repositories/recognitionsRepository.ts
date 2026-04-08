import type {
  IRawRecognitionItem,
  IRecognitionsConfiguration
} from '../models/recognitionsModels';
import { clampMaxItems, describeSource, resolveSameOriginUrl } from '../utils/recognitionsUtils';

export interface IRecognitionsRepositoryResult {
  items: IRawRecognitionItem[];
  warnings: string[];
  sourceLabel: string;
  isFallback: boolean;
}

export interface IRecognitionsRepository {
  load(): Promise<IRecognitionsRepositoryResult>;
}

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, '');
}

function normalizeListReference(listTitleOrUrl: string, webAbsoluteUrl: string): string {
  const trimmed = listTitleOrUrl.trim();
  if (!trimmed) {
    return trimmed;
  }

  if (trimmed.startsWith('http')) {
    try {
      const url = new URL(trimmed);
      if (url.origin === new URL(webAbsoluteUrl).origin) {
        let path = url.pathname;
        if (path.toLowerCase().includes('/forms/')) {
          path = path.split('/Forms/')[0];
        }
        return path;
      }
    } catch {
      return trimmed;
    }
  }

  return trimmed;
}

function buildListApiUrl(listTitleOrUrl: string, webAbsoluteUrl: string): string {
  const trimmedWebUrl = trimTrailingSlash(webAbsoluteUrl);
  const normalizedReference = normalizeListReference(listTitleOrUrl, webAbsoluteUrl);

  if (normalizedReference.startsWith('/')) {
    return `${trimmedWebUrl}/_api/web/GetList(@listUrl)?@listUrl='${encodeURIComponent(normalizedReference)}'`;
  }

  return `${trimmedWebUrl}/_api/web/lists/getByTitle('${escapeODataString(normalizedReference)}')`;
}

function mapRecordToRecognition(record: Record<string, unknown>): IRawRecognitionItem {
  return {
    id: typeof record.Id === 'number' ? String(record.Id) : typeof record.id === 'string' ? record.id : undefined,
    targetName:
      typeof record.TargetName === 'string'
        ? record.TargetName
        : typeof record.RecognizedName === 'string'
          ? record.RecognizedName
          : typeof record.TeamName === 'string'
            ? record.TeamName
            : typeof record.Title === 'string'
              ? record.Title
              : typeof record.targetName === 'string'
                ? record.targetName
                : undefined,
    message:
      typeof record.Message === 'string'
        ? record.Message
        : typeof record.RecognitionMessage === 'string'
          ? record.RecognitionMessage
          : typeof record.Description === 'string'
            ? record.Description
            : typeof record.message === 'string'
              ? record.message
              : undefined,
    date:
      typeof record.RecognitionDate === 'string'
        ? record.RecognitionDate
        : typeof record.Date === 'string'
          ? record.Date
          : typeof record.Created === 'string'
            ? record.Created
            : typeof record.date === 'string'
              ? record.date
              : undefined,
    photoUrl:
      typeof record.PhotoUrl === 'string'
        ? record.PhotoUrl
        : typeof record.PictureUrl === 'string'
          ? record.PictureUrl
          : typeof record.ImageUrl === 'string'
            ? record.ImageUrl
            : typeof record.photoUrl === 'string'
              ? record.photoUrl
              : undefined,
    detailUrl:
      typeof record.DetailUrl === 'string'
        ? record.DetailUrl
        : typeof record.OpenUrl === 'string'
          ? record.OpenUrl
          : typeof record.LinkUrl === 'string'
            ? record.LinkUrl
            : typeof record.detailUrl === 'string'
              ? record.detailUrl
              : undefined
  };
}

class StaticRecognitionsRepository implements IRecognitionsRepository {
  public constructor(private readonly config: IRecognitionsConfiguration) {}

  public async load(): Promise<IRecognitionsRepositoryResult> {
    return {
      items: [
        {
          id: 'recognition-support',
          targetName: 'Equipo de Soporte',
          message: 'Por cerrar la migración documental sin incidencias y con soporte activo durante todo el corte.',
          date: '2026-03-20T12:00:00.000Z',
          photoUrl: '/_layouts/15/userphoto.aspx?size=S&accountname=equipo-soporte@contoso.com',
          detailUrl: '/sites/intranet/reconocimientos/equipo-soporte'
        },
        {
          id: 'recognition-people',
          targetName: 'People Operations',
          message: 'Gracias por acelerar el onboarding de la última oleada y coordinar a todas las áreas implicadas.',
          date: '2026-03-18T09:30:00.000Z',
          photoUrl: '/_layouts/15/userphoto.aspx?size=S&accountname=people-operations@contoso.com',
          detailUrl: '/sites/intranet/reconocimientos/people-operations'
        },
        {
          id: 'recognition-design',
          targetName: 'Diseño y Marca',
          message: 'Nuevo sistema de plantillas listo para campañas internas con tiempos de entrega reducidos.',
          date: '2026-03-15T16:45:00.000Z',
          photoUrl: '/_layouts/15/userphoto.aspx?size=S&accountname=design-brand@contoso.com',
          detailUrl: '/sites/intranet/reconocimientos/diseno-marca'
        }
      ],
      warnings: [],
      sourceLabel: describeSource(this.config.dataSourceType, this.config.listTitleOrUrl),
      isFallback: false
    };
  }
}

class JsonRecognitionsRepository implements IRecognitionsRepository {
  public constructor(private readonly config: IRecognitionsConfiguration) {}

  public async load(): Promise<IRecognitionsRepositoryResult> {
    const resolvedUrl = resolveSameOriginUrl(this.config.listTitleOrUrl, this.config.webAbsoluteUrl);
    if (!resolvedUrl) {
      throw new Error('JsonUrl no configurada o fuera del mismo origen.');
    }

    const response = await fetch(resolvedUrl, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`JsonUrl respondió con ${response.status}.`);
    }

    const payload = (await response.json()) as { items?: unknown[] } | unknown[];
    const candidates = Array.isArray(payload)
      ? payload
      : Array.isArray((payload as { items?: unknown[] }).items)
        ? (payload as { items: unknown[] }).items
        : [payload];

    return {
      items: candidates
        .filter((candidate): candidate is Record<string, unknown> => Boolean(candidate && typeof candidate === 'object'))
        .map(mapRecordToRecognition),
      warnings: [],
      sourceLabel: describeSource(this.config.dataSourceType, resolvedUrl),
      isFallback: false
    };
  }
}

class SharePointRecognitionsRepository implements IRecognitionsRepository {
  public constructor(private readonly config: IRecognitionsConfiguration) {}

  public async load(): Promise<IRecognitionsRepositoryResult> {
    const listReference = this.config.listTitleOrUrl.trim();
    if (!listReference) {
      throw new Error('No se ha configurado la lista de reconocimientos.');
    }

    const endpoint = `${buildListApiUrl(listReference, this.config.webAbsoluteUrl)}/items?$top=${Math.max(
      clampMaxItems(this.config.maxItems) * 4,
      20
    )}&$orderby=Created desc`;

    const response = await fetch(endpoint, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    });

    if (!response.ok) {
      throw new Error(`SharePoint list respondió con ${response.status}.`);
    }

    const payload = (await response.json()) as { value?: Array<Record<string, unknown>> };

    return {
      items: Array.isArray(payload.value) ? payload.value.map(mapRecordToRecognition) : [],
      warnings: [],
      sourceLabel: describeSource(this.config.dataSourceType, listReference),
      isFallback: false
    };
  }
}

export function createRecognitionsRepository(config: IRecognitionsConfiguration): IRecognitionsRepository {
  switch (config.dataSourceType) {
    case 'JsonUrl':
      return new JsonRecognitionsRepository(config);
    case 'SharePointList':
      return new SharePointRecognitionsRepository(config);
    case 'StaticConfig':
    default:
      return new StaticRecognitionsRepository(config);
  }
}
