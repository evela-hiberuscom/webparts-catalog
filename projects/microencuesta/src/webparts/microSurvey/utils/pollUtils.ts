import { ensureUniqueStrings } from '@paquete/spfx-common';
import type {
  IMicroSurveyUserContext,
  IPollOption
} from '../models/pollModels';

export type ListReference =
  | {
      kind: 'title';
      title: string;
    }
  | {
      kind: 'url';
      absoluteUrl: string;
      serverRelativeUrl: string;
    };

export function trimToUndefined(value: string | undefined): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmedValue = value.trim();
  return trimmedValue ? trimmedValue : undefined;
}

export function parsePollOptions(value: string | string[]): IPollOption[] {
  let rawOptions: string[] = [];

  if (Array.isArray(value)) {
    rawOptions = value.slice();
  } else {
    const trimmedValue = trimToUndefined(value);
    if (!trimmedValue) {
      return [];
    }

    if (trimmedValue.charAt(0) === '[') {
      try {
        const parsedValue = JSON.parse(trimmedValue) as unknown;
        if (Array.isArray(parsedValue)) {
          rawOptions = parsedValue
            .filter((item): item is string => typeof item === 'string')
            .slice();
        }
      } catch {
        rawOptions = trimmedValue.split(/[\n;|]+/);
      }
    } else {
      rawOptions = trimmedValue.split(/[\n;|]+/);
    }
  }

  const uniqueOptions = ensureUniqueStrings(
    rawOptions.map((option) => option.trim()).filter(Boolean)
  );

  const options: IPollOption[] = [];
  for (let index = 0; index < uniqueOptions.length; index += 1) {
    options.push({
      id: createOptionId(uniqueOptions[index], index),
      label: uniqueOptions[index]
    });
  }

  return options;
}

export function createOptionId(label: string, index: number): string {
  const normalizedLabel = label
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

  return normalizedLabel ? normalizedLabel : `option-${index + 1}`;
}

export function normalizeListReference(
  value: string,
  webAbsoluteUrl: string
): ListReference {
  const trimmedValue = trimToUndefined(value);
  if (!trimmedValue) {
    throw new Error('Missing list title or URL.');
  }

  const looksLikeUrl =
    trimmedValue.indexOf('/') >= 0 ||
    trimmedValue.toLowerCase().indexOf('http://') === 0 ||
    trimmedValue.toLowerCase().indexOf('https://') === 0;

  if (!looksLikeUrl) {
    return {
      kind: 'title',
      title: trimmedValue
    };
  }

  const resolvedUrl = resolveSameOriginUrl(trimmedValue, webAbsoluteUrl);
  const normalizedPath = resolvedUrl.pathname.replace(
    /\/Forms\/AllItems\.aspx$/i,
    ''
  );

  return {
    kind: 'url',
    absoluteUrl: resolvedUrl.origin + normalizedPath,
    serverRelativeUrl: normalizedPath
  };
}

export function resolveSameOriginUrl(
  value: string,
  webAbsoluteUrl: string
): URL {
  const trimmedValue = trimToUndefined(value);
  if (!trimmedValue) {
    throw new Error('Missing URL value.');
  }

  if (/^(javascript|data|vbscript):/i.test(trimmedValue)) {
    throw new Error('Unsupported URL protocol.');
  }

  const baseUrl = new URL(webAbsoluteUrl);
  const resolvedUrl = new URL(trimmedValue, `${baseUrl.origin}/`);
  if (resolvedUrl.origin !== baseUrl.origin) {
    throw new Error('Only same-origin URLs are supported.');
  }

  return resolvedUrl;
}

export function buildUserKey(user: IMicroSurveyUserContext): string {
  const candidates = [user.email, user.loginName, user.displayName];
  for (let index = 0; index < candidates.length; index += 1) {
    const normalizedValue = trimToUndefined(candidates[index]);
    if (normalizedValue) {
      return normalizedValue.toLowerCase();
    }
  }

  return 'anonymous';
}

export function createStorageKey(
  questionId: string,
  user: IMicroSurveyUserContext
): string {
  return `microencuesta:${questionId}:${buildUserKey(user)}`;
}

export function escapeODataValue(value: string): string {
  return value.replace(/'/g, "''");
}
