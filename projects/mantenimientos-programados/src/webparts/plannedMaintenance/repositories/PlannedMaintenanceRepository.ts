import type {
  IPlannedMaintenanceHostContext,
  IPlannedMaintenanceRepositoryResult,
  IPlannedMaintenanceRequest
} from '../models/plannedMaintenanceModels';
import {
  escapeODataString,
  normalizeJsonUrl,
  normalizeListTarget,
  normalizeMaintenancePayload
} from '../utils/plannedMaintenanceUtils';

interface ISpHttpClientResponseLike {
  ok: boolean;
  status: number;
  json(): Promise<unknown>;
}

interface ISpHttpClientLike {
  configurations?: {
    v1?: unknown;
  };
  get(url: string, configuration: unknown, options?: { headers?: Record<string, string> }): Promise<ISpHttpClientResponseLike>;
}

async function readJson(response: ISpHttpClientResponseLike): Promise<unknown> {
  return response.json();
}

export class PlannedMaintenanceRepository {
  constructor(private readonly spHttpClient: ISpHttpClientLike) {}

  private getRequestConfiguration(): unknown {
    return this.spHttpClient.configurations?.v1 ?? {};
  }

  public async load(request: IPlannedMaintenanceRequest): Promise<IPlannedMaintenanceRepositoryResult> {
    switch (request.webPartProps.dataSourceType) {
      case 'JsonUrl':
        return this.loadFromJsonUrl(request.webPartProps.jsonUrl, request.hostContext, request.now ?? new Date());
      case 'SharePointList':
      default:
        return this.loadFromSharePointList(request.webPartProps.listTitleOrUrl, request.hostContext, request.now ?? new Date());
    }
  }

  private async loadFromJsonUrl(
    jsonUrl: string,
    hostContext: IPlannedMaintenanceHostContext,
    now: Date
  ): Promise<IPlannedMaintenanceRepositoryResult> {
    const normalizedUrl = normalizeJsonUrl(jsonUrl, hostContext.webUrl);
    if (!normalizedUrl) {
      throw new Error('JsonUrl no configurada o fuera del mismo origen.');
    }

    const response = await this.spHttpClient.get(normalizedUrl, this.getRequestConfiguration(), {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`JsonUrl respondio con ${response.status}`);
    }

    const payload = await readJson(response);
    const items = normalizeMaintenancePayload(payload, now);

    return {
      items,
      sourceLabel: `JsonUrl: ${normalizedUrl}`,
      hasPartialData: items.some((item) => item.partialData),
      notes: []
    };
  }

  private async loadFromSharePointList(
    listTitleOrUrl: string,
    hostContext: IPlannedMaintenanceHostContext,
    now: Date
  ): Promise<IPlannedMaintenanceRepositoryResult> {
    const target = normalizeListTarget(listTitleOrUrl, hostContext.webUrl);
    if (!target) {
      throw new Error('MaintenanceList no configurada.');
    }

    const select = ['Id', 'Title', 'StartAt', 'EndAt', 'Impact', 'Services', 'DetailUrl'].join(',');
    const endpoint =
      target.kind === 'title'
        ? `${hostContext.webUrl}/_api/web/lists/getbytitle('${escapeODataString(target.value)}')/items?$select=${select}`
        : `${hostContext.webUrl}/_api/web/GetList(@listUrl)/items?$select=${select}&@listUrl='${encodeURIComponent(target.value)}'`;

    const response = await this.spHttpClient.get(endpoint, this.getRequestConfiguration(), {
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    });

    if (!response.ok) {
      throw new Error(`MaintenanceList respondio con ${response.status}`);
    }

    const payload = await readJson(response);
    const items = normalizeMaintenancePayload(payload, now);

    return {
      items,
      sourceLabel: `SharePointList: ${target.value}`,
      hasPartialData: items.some((item) => item.partialData),
      notes: []
    };
  }
}
