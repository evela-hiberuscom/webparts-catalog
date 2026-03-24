import type {
  IProfileBasedComponentViewModel,
  IProfileVariant,
  ProfileFallbackMode
} from '../models/profileBasedComponentModels';
import { normalizeAudienceTokens } from './profileTokens';

export interface IResolvedProfileVariant {
  variant?: IProfileVariant;
  matchedTokens: string[];
  fallbackApplied: boolean;
  hasPartialData: boolean;
  state: IProfileBasedComponentViewModel['state'];
}

export function isSameOriginUrl(targetUrl: string, siteUrl: string): boolean {
  try {
    const target = new URL(targetUrl, siteUrl);
    const origin = new URL(siteUrl);
    return target.origin === origin.origin;
  } catch {
    return false;
  }
}

export function extractVariantScore(variant: IProfileVariant, currentTokens: string[]): { score: number; matchedTokens: string[] } {
  const variantTokens = normalizeAudienceTokens(variant.audienceTokens);
  const matchedTokens = variantTokens.filter((token) => currentTokens.indexOf(token) >= 0);
  const score = matchedTokens.length * 10 + (variant.isGeneric ? 0 : 1);

  return {
    score,
    matchedTokens
  };
}

export function hasVariantGaps(variant: IProfileVariant): boolean {
  if (!variant.summary.trim()) {
    return true;
  }

  if (!variant.isGeneric && variant.audienceTokens.length === 0) {
    return true;
  }

  if (variant.contentType === 'links') {
    const links = variant.payload.links;
    return !Array.isArray(links) || links.length === 0;
  }

  return !variant.body?.trim() && !variant.ctaUrl?.trim();
}

export function resolveProfileVariant(
  variants: IProfileVariant[],
  currentTokens: string[],
  fallbackMode: ProfileFallbackMode
): IResolvedProfileVariant {
  if (variants.length === 0) {
    return {
      matchedTokens: [],
      fallbackApplied: false,
      hasPartialData: false,
      state: 'empty'
    };
  }

  const scored = variants
    .map((variant) => ({
      variant,
      ...extractVariantScore(variant, currentTokens)
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      const leftPriority = left.variant.priority ?? Number.MAX_SAFE_INTEGER;
      const rightPriority = right.variant.priority ?? Number.MAX_SAFE_INTEGER;
      if (leftPriority !== rightPriority) {
        return leftPriority - rightPriority;
      }

      return left.variant.title.localeCompare(right.variant.title);
    });

  const bestSpecific = scored.find((entry) => !entry.variant.isGeneric && entry.matchedTokens.length > 0);
  const generic = scored.find((entry) => entry.variant.isGeneric);
  const selected = bestSpecific ?? (fallbackMode === 'generic' ? generic ?? scored[0] : undefined);
  const fallbackApplied = !bestSpecific && fallbackMode === 'generic' && !!selected?.variant && !!generic;

  if (!selected?.variant) {
    return {
      matchedTokens: [],
      fallbackApplied: false,
      hasPartialData: false,
      state: 'empty'
    };
  }

  const hasPartialData = fallbackApplied || hasVariantGaps(selected.variant);

  if (!bestSpecific && fallbackMode === 'empty') {
    return {
      variant: undefined,
      matchedTokens: selected.matchedTokens,
      fallbackApplied: false,
      hasPartialData,
      state: 'empty'
    };
  }

  return {
    variant: selected.variant,
    matchedTokens: selected.matchedTokens,
    fallbackApplied,
    hasPartialData,
    state: hasPartialData ? 'partialData' : 'ready'
  };
}
