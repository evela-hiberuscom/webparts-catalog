import { SPHttpClient } from '@microsoft/sp-http';
import { ensureUniqueStrings } from '@paquete/spfx-common';

import type {
  IAudienceQuickLinksHostContext,
  IUserContextResult,
  IUserContextTokenBucket
} from '../models/audienceLinkModels';
import { splitTextTokens, uniqueNormalizedTokens } from '../utils/audienceLinkUtils';

function pushTokens(bucket: string[], value: string | undefined): void {
  if (!value) {
    return;
  }

  splitTextTokens(value).forEach((token) => {
    if (bucket.indexOf(token) === -1) {
      bucket.push(token);
    }
  });
}

function appendWordTokens(bucket: string[], value: string | undefined): void {
  if (!value) {
    return;
  }

  value
    .split(/[\s._@-]+/)
    .map((token) => token.trim().toLowerCase())
    .filter(Boolean)
    .forEach((token) => {
      if (bucket.indexOf(token) === -1) {
        bucket.push(token);
      }
    });
}

function parseProfileProperties(payload: unknown): Record<string, string> {
  const properties: Record<string, string> = {};

  if (!payload || typeof payload !== 'object') {
    return properties;
  }

  const candidate = payload as {
    UserProfileProperties?: Array<{ Key?: string; Value?: string }>;
    userProfileProperties?: Array<{ key?: string; value?: string }>;
  };

  const entries = candidate.UserProfileProperties ?? candidate.userProfileProperties ?? [];

  entries.forEach((entry) => {
    const rawEntry = entry as { Key?: string; Value?: string; key?: string; value?: string };
    const key = (rawEntry.Key ?? rawEntry.key ?? '').trim();
    const value = (rawEntry.Value ?? rawEntry.value ?? '').trim();
    if (key && value) {
      properties[key] = value;
    }
  });

  return properties;
}

function parseGroupTitles(payload: unknown): string[] {
  if (!payload || typeof payload !== 'object') {
    return [];
  }

  const candidate = payload as {
    value?: Array<{ Title?: string }>;
    d?: { results?: Array<{ Title?: string }> };
  };

  const items = Array.isArray(candidate.value) ? candidate.value : Array.isArray(candidate.d?.results) ? candidate.d.results : [];

  return items
    .map((item) => (item.Title ?? '').trim())
    .filter(Boolean);
}

async function tryGetJson(spHttpClient: SPHttpClient, url: string): Promise<unknown | undefined> {
  try {
    const response = await spHttpClient.get(url, SPHttpClient.configurations.v1, {
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    });

    if (!response.ok) {
      return undefined;
    }

    return response.json();
  } catch {
    return undefined;
  }
}

function buildFallbackTokens(hostContext: IAudienceQuickLinksHostContext): IUserContextTokenBucket {
  const departmentTokens: string[] = [];
  const countryTokens: string[] = [];
  const groupTokens: string[] = [];
  const roleTokens: string[] = [];
  const fallbackTokens: string[] = [];

  appendWordTokens(fallbackTokens, hostContext.userDisplayName);
  appendWordTokens(fallbackTokens, hostContext.userEmail);
  appendWordTokens(fallbackTokens, hostContext.userLoginName);
  appendWordTokens(countryTokens, hostContext.localeName);

  return {
    departmentTokens,
    countryTokens,
    groupTokens,
    roleTokens,
    fallbackTokens: uniqueNormalizedTokens(fallbackTokens),
    allTokens: []
  };
}

function finalizeBuckets(bucket: IUserContextTokenBucket): IUserContextTokenBucket {
  const allTokens = ensureUniqueStrings([
    ...bucket.departmentTokens,
    ...bucket.countryTokens,
    ...bucket.groupTokens,
    ...bucket.roleTokens,
    ...bucket.fallbackTokens
  ]);

  return {
    ...bucket,
    allTokens
  };
}

export class UserContextRepository {
  constructor(private readonly spHttpClient: SPHttpClient) {}

  public async load(hostContext: IAudienceQuickLinksHostContext): Promise<IUserContextResult> {
    const buckets = buildFallbackTokens(hostContext);
    const notes: string[] = [
      'observado: el proyecto usa contexto de usuario local como base y refuerza con profile properties cuando están disponibles.'
    ];

    const profileUrl = `${hostContext.webUrl}/_api/SP.UserProfiles.PeopleManager/GetMyProperties`;
    const groupsUrl = `${hostContext.webUrl}/_api/web/currentuser/groups?$select=Title`;

    const profilePayload = await tryGetJson(this.spHttpClient, profileUrl);
    const groupPayload = await tryGetJson(this.spHttpClient, groupsUrl);

    if (profilePayload) {
      const properties = parseProfileProperties(profilePayload);
      pushTokens(buckets.departmentTokens, properties.Department);
      pushTokens(buckets.departmentTokens, properties['SPS-Department']);
      pushTokens(buckets.countryTokens, properties['SPS-Location']);
      pushTokens(buckets.countryTokens, properties['SPS-Country']);
      pushTokens(buckets.roleTokens, properties['SPS-JobTitle']);
      pushTokens(buckets.roleTokens, properties.JobTitle);
      pushTokens(buckets.roleTokens, properties.Title);
      pushTokens(buckets.fallbackTokens, properties.AccountName);
      pushTokens(buckets.fallbackTokens, properties.Email);
      pushTokens(buckets.fallbackTokens, properties.DisplayName);

      notes.push('inferido: se usan Department, SPS-Department, SPS-Location, SPS-Country y SPS-JobTitle como señales de audiencia.');
    } else {
      notes.push('pendiente de validar: GetMyProperties no respondió; se mantiene el fallback del contexto de página.');
    }

    if (groupPayload) {
      parseGroupTitles(groupPayload).forEach((groupTitle) => {
        appendWordTokens(buckets.groupTokens, groupTitle);
      });
      notes.push('observado: el usuario puede aportar señales de grupo a partir de currentuser/groups.');
    } else {
      notes.push('pendiente de validar: no se pudieron leer los grupos del usuario actual.');
    }

    const normalizedBuckets = finalizeBuckets({
      departmentTokens: uniqueNormalizedTokens(buckets.departmentTokens),
      countryTokens: uniqueNormalizedTokens(buckets.countryTokens),
      groupTokens: uniqueNormalizedTokens(buckets.groupTokens),
      roleTokens: uniqueNormalizedTokens(buckets.roleTokens),
      fallbackTokens: uniqueNormalizedTokens(buckets.fallbackTokens),
      allTokens: []
    });

    const hasPartialData = !profilePayload || !groupPayload;

    return {
      displayName: hostContext.userDisplayName,
      email: hostContext.userEmail,
      loginName: hostContext.userLoginName,
      localeName: hostContext.localeName,
      sourceLabel: 'Perfil de usuario SharePoint + fallback local',
      hasPartialData,
      notes,
      tokens: normalizedBuckets
    };
  }
}
