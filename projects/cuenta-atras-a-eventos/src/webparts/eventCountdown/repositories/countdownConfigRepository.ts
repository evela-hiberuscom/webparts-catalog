import type {
  ICountdownItem,
  ICountdownRepositoryResult,
  ICountdownSourceRecord,
  ICountdownWebPartConfig
} from '../models/eventCountdownModels';
import {
  buildJsonUrl,
  buildListItemsEndpoint,
  mapSourceRecordToCountdownItem,
  selectPrimaryRecord
} from '../utils/countdownUtils';

interface IFetchResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

type Fetcher = (input: string, init?: RequestInit) => Promise<IFetchResponseLike>;

function ensureArrayPayload(raw: unknown): ICountdownSourceRecord[] {
  if (Array.isArray(raw)) {
    return raw as ICountdownSourceRecord[];
  }

  if (raw && typeof raw === 'object') {
    const payload = raw as { items?: unknown[]; value?: unknown[]; results?: unknown[]; d?: { results?: unknown[] } };
    if (Array.isArray(payload.items)) {
      return payload.items as ICountdownSourceRecord[];
    }

    if (Array.isArray(payload.value)) {
      return payload.value as ICountdownSourceRecord[];
    }

    if (Array.isArray(payload.results)) {
      return payload.results as ICountdownSourceRecord[];
    }

    if (payload.d && Array.isArray(payload.d.results)) {
      return payload.d.results as ICountdownSourceRecord[];
    }
  }

  throw new Error('La respuesta no tiene un formato de colección válido.');
}

function isSameOriginReference(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith('/');
}

async function readJson(fetcher: Fetcher, url: string, acceptHeader: string): Promise<unknown> {
  const response = await fetcher(url, {
    credentials: 'same-origin',
    headers: {
      Accept: acceptHeader
    }
  });

  if (!response.ok) {
    throw new Error(`No se pudo leer el origen (${response.status}).`);
  }

  return response.json();
}

function resolveStaticConfigItem(config: ICountdownWebPartConfig): ICountdownItem {
  return {
    title: config.eventTitle,
    targetDate: config.targetDate,
    subtitle: config.subtitle,
    detailUrl: config.detailUrl,
    state: 'unknown',
    showCompleted: config.showCompleted,
    hasPartialData: !config.eventTitle || !config.targetDate || !config.subtitle || !config.detailUrl
  };
}

function normalizeResultItems(records: ICountdownSourceRecord[], config: ICountdownWebPartConfig): ICountdownRepositoryResult {
  const selected = selectPrimaryRecord(records, config);
  if (!selected) {
    return {
      item: null,
      sourceLabel: 'Origen vacío',
      hasPartialData: false,
      notes: ['El origen no devolvió elementos.']
    };
  }

  const item = mapSourceRecordToCountdownItem(selected, config);
  const hasPartialData = item.hasPartialData || records.length > 1;
  const notes = records.length > 1 ? ['El origen devolvió varios elementos; se usará el primero compatible.'] : [];

  return {
    item,
    sourceLabel: 'Origen remoto',
    hasPartialData,
    notes
  };
}

export class CountdownConfigRepository {
  constructor(private readonly fetcher: Fetcher = globalThis.fetch?.bind(globalThis) as Fetcher) {}

  public async load(config: ICountdownWebPartConfig): Promise<ICountdownRepositoryResult> {
    switch (config.sourceType) {
      case 'SharePointList': {
        if (!config.listTitleOrUrl) {
          throw new Error('listTitleOrUrl es obligatorio cuando la fuente es SharePointList.');
        }

        const url = buildListItemsEndpoint(config.webUrl, config.listTitleOrUrl);
        const payload = await readJson(this.fetcher, url, 'application/json;odata=nometadata');
        const records = ensureArrayPayload(payload);
        return normalizeResultItems(records, config);
      }
      case 'JsonUrl': {
        if (!config.jsonUrl) {
          throw new Error('jsonUrl es obligatorio cuando la fuente es JsonUrl.');
        }

        if (!isSameOriginReference(config.jsonUrl)) {
          throw new Error('jsonUrl debe ser same-origin o relativa.');
        }

        const url = buildJsonUrl(config.webUrl, config.jsonUrl);
        const payload = await readJson(this.fetcher, url, 'application/json');
        const records = ensureArrayPayload(payload);
        return normalizeResultItems(records, config);
      }
      case 'StaticConfig':
      default: {
        const item = resolveStaticConfigItem(config);

        return {
          item,
          sourceLabel: 'Configuración estática',
          hasPartialData: item.hasPartialData,
          notes: []
        };
      }
    }
  }
}
