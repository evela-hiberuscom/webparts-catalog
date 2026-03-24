import type {
  IMeetTheTeamHostContext,
  IMeetTheTeamRequest,
  IMeetTheTeamWebPartProps,
  ITeamMember,
  ITeamMembersRepositoryResult,
  TeamMembersDataSourceType
} from '../models/teamMemberModels';
import {
  DEFAULT_TEAM_MEMBERS_JSON,
  normalizeDataSourceTypes,
  normalizeMemberRecord,
  normalizeTeamMembers,
  toTeamMemberInputs
} from '../utils/teamMemberUtils';

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

function escapeODataString(value: string): string {
  return value.replace(/'/g, "''");
}

function isDangerousProtocol(value: string): boolean {
  return /^(javascript|data|vbscript):/i.test(value);
}

function normalizeJsonUrl(url: string, webUrl: string): string | undefined {
  const trimmed = url.trim();
  if (!trimmed || isDangerousProtocol(trimmed)) {
    return undefined;
  }

  try {
    const resolved = new URL(trimmed, webUrl);
    const webOrigin = new URL(webUrl).origin;
    if (resolved.origin !== webOrigin) {
      return undefined;
    }

    return resolved.toString();
  } catch {
    if (trimmed.startsWith('/')) {
      return trimmed;
    }

    return undefined;
  }
}

function normalizeListTarget(rawValue: string, webUrl: string): { kind: 'title' | 'url'; value: string } | undefined {
  const trimmed = rawValue.trim();
  if (!trimmed) {
    return undefined;
  }

  if (/^(https?:\/\/|\/|~sitecollection\/|~site\/)/i.test(trimmed)) {
    try {
      const resolved = new URL(trimmed, webUrl);
      const webOrigin = new URL(webUrl).origin;
      if (resolved.origin !== webOrigin) {
        return undefined;
      }

      let serverRelative = resolved.pathname;
      serverRelative = serverRelative.replace(/\/Forms\/AllItems\.aspx$/i, '');
      serverRelative = serverRelative.replace(/\/Forms\/.*$/i, '');
      serverRelative = serverRelative.replace(/\/$/, '');

      return {
        kind: 'url',
        value: serverRelative || '/'
      };
    } catch {
      const withoutForms = trimmed.replace(/\/Forms\/AllItems\.aspx.*$/i, '').replace(/\/Forms\/.*$/i, '');
      return {
        kind: 'url',
        value: withoutForms.replace(/\/$/, '') || '/'
      };
    }
  }

  return {
    kind: 'title',
    value: trimmed
  };
}

async function readJson(response: ISpHttpClientResponseLike): Promise<unknown> {
  return response.json();
}

export class TeamMembersRepository {
  constructor(private readonly spHttpClient: ISpHttpClientLike) {}

  private getRequestConfiguration(): unknown {
    return this.spHttpClient.configurations?.v1 ?? {};
  }

  public async load(request: IMeetTheTeamRequest): Promise<ITeamMembersRepositoryResult> {
    const dataSourceTypes = normalizeDataSourceTypes(request.webPartProps.dataSourceTypesCsv);
    const orderedSources = dataSourceTypes.length > 0 ? dataSourceTypes : [request.webPartProps.dataSourceType];
    const notes: string[] = [];
    const attempts: Array<{ items: ITeamMember[]; hasPartialData: boolean; sourceLabel: string }> = [];

    for (const sourceType of orderedSources) {
      try {
        const result = await this.loadFromSource(sourceType, request.webPartProps, request.hostContext);
        attempts.push(result);
        notes.push(`Fuente resuelta: ${result.sourceLabel}`);
        if (result.items.length > 0) {
          return {
            items: result.items,
            sourceLabel: result.sourceLabel,
            hasPartialData: result.hasPartialData,
            notes
          };
        }
      } catch (error) {
        notes.push(`Fuente ${sourceType} descartada: ${(error as Error).message}`);
      }
    }

    if (attempts.length > 0) {
      const lastAttempt = attempts[attempts.length - 1];
      return {
        items: lastAttempt.items,
        sourceLabel: lastAttempt.sourceLabel,
        hasPartialData: true,
        notes: notes.concat('Se devolvió la última fuente disponible porque no se obtuvo un catálogo completo.')
      };
    }

    return {
      items: this.parseStaticMembers(request.webPartProps.staticMembersJson),
      sourceLabel: 'StaticConfig',
      hasPartialData: false,
      notes: ['No se resolvió ninguna fuente externa; se usó la configuración estática por defecto.']
    };
  }

  private async loadFromSource(
    sourceType: TeamMembersDataSourceType,
    webPartProps: IMeetTheTeamWebPartProps,
    hostContext: IMeetTheTeamHostContext
  ): Promise<{ items: ITeamMember[]; hasPartialData: boolean; sourceLabel: string }> {
    switch (sourceType) {
      case 'SharePointList':
        return this.loadFromSharePointList(webPartProps, hostContext);
      case 'JsonUrl':
        return this.loadFromJsonUrl(webPartProps, hostContext);
      case 'Directory':
        return this.loadFromDirectory(webPartProps, hostContext);
      case 'StaticConfig':
      default:
        return {
          items: this.parseStaticMembers(webPartProps.staticMembersJson),
          hasPartialData: false,
          sourceLabel: 'StaticConfig'
        };
    }
  }

  private parseStaticMembers(staticMembersJson: string): ITeamMember[] {
    const payload = staticMembersJson && staticMembersJson.trim() ? staticMembersJson : DEFAULT_TEAM_MEMBERS_JSON;
    const parsed = JSON.parse(payload) as unknown;
    return normalizeTeamMembers(toTeamMemberInputs(parsed));
  }

  private async loadFromJsonUrl(
    webPartProps: IMeetTheTeamWebPartProps,
    hostContext: IMeetTheTeamHostContext
  ): Promise<{ items: ITeamMember[]; hasPartialData: boolean; sourceLabel: string }> {
    const normalizedUrl = normalizeJsonUrl(webPartProps.jsonUrl, hostContext.webUrl);
    if (!normalizedUrl) {
      throw new Error('JsonUrl no configurada o fuera del mismo origen.');
    }

    const response = await this.spHttpClient.get(normalizedUrl, this.getRequestConfiguration(), {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`JsonUrl respondió con ${response.status}`);
    }

    const payload = await readJson(response);
    const items = normalizeTeamMembers(
      toTeamMemberInputs(payload).map((item, index) => normalizeMemberRecord(item as Record<string, unknown>, `json-member-${index + 1}`))
    );

    return {
      items,
      hasPartialData: items.some((item) => item.partialData),
      sourceLabel: `JsonUrl: ${normalizedUrl}`
    };
  }

  private async loadFromDirectory(
    webPartProps: IMeetTheTeamWebPartProps,
    hostContext: IMeetTheTeamHostContext
  ): Promise<{ items: ITeamMember[]; hasPartialData: boolean; sourceLabel: string }> {
    const endpoint = webPartProps.directoryEndpoint.trim();
    if (!endpoint) {
      throw new Error('Directory/API no configurado.');
    }

    const normalizedUrl = normalizeJsonUrl(endpoint, hostContext.webUrl);
    if (!normalizedUrl) {
      throw new Error('Directory/API debe ser same-origin o relativa.');
    }

    const response = await this.spHttpClient.get(normalizedUrl, this.getRequestConfiguration(), {
      headers: {
        Accept: 'application/json'
      }
    });

    if (!response.ok) {
      throw new Error(`Directory/API respondió con ${response.status}`);
    }

    const payload = await readJson(response);
    const items = normalizeTeamMembers(
      toTeamMemberInputs(payload).map((item, index) => normalizeMemberRecord(item as Record<string, unknown>, `directory-member-${index + 1}`))
    );

    return {
      items,
      hasPartialData: items.some((item) => item.partialData),
      sourceLabel: `Directory/API: ${normalizedUrl}`
    };
  }

  private async loadFromSharePointList(
    webPartProps: IMeetTheTeamWebPartProps,
    hostContext: IMeetTheTeamHostContext
  ): Promise<{ items: ITeamMember[]; hasPartialData: boolean; sourceLabel: string }> {
    const normalizedTarget = normalizeListTarget(webPartProps.listTitleOrUrl, hostContext.webUrl);
    if (!normalizedTarget) {
      throw new Error('TeamMembersList no configurada.');
    }

    const select = ['Id', 'Title', 'DisplayName', 'JobTitle', 'Bio', 'PhotoUrl', 'ProfileUrl', 'SortOrder'].join(',');
    const endpoint =
      normalizedTarget.kind === 'title'
        ? `${hostContext.webUrl}/_api/web/lists/getbytitle('${escapeODataString(normalizedTarget.value)}')/items?$select=${select}`
        : `${hostContext.webUrl}/_api/web/GetList(@listUrl)/items?$select=${select}&@listUrl='${encodeURIComponent(normalizedTarget.value)}'`;

    const response = await this.spHttpClient.get(endpoint, this.getRequestConfiguration(), {
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    });

    if (!response.ok) {
      throw new Error(`SharePointList respondió con ${response.status}`);
    }

    const payload = await readJson(response);
    const items = normalizeTeamMembers(
      toTeamMemberInputs(payload).map((item, index) => normalizeMemberRecord(item as Record<string, unknown>, `list-member-${index + 1}`))
    );

    return {
      items,
      hasPartialData: items.some((item) => item.partialData),
      sourceLabel: `SharePointList: ${normalizedTarget.kind === 'title' ? normalizedTarget.value : normalizedTarget.value}`
    };
  }
}
