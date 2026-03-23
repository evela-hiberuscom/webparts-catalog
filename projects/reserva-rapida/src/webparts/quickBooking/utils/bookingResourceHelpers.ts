import type { BookingAvailability, IBookingResource } from '../models/quickBookingModels';

function toBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  if (typeof value === 'number') {
    return value > 0;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    return normalized === 'true' || normalized === '1' || normalized === 'yes';
  }

  return false;
}

function toAvailability(value: unknown): BookingAvailability {
  if (value === 'available' || value === 'busy' || value === 'unknown') {
    return value;
  }

  if (value === undefined || value === null) {
    return undefined;
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'available' || normalized === 'busy' || normalized === 'unknown') {
      return normalized;
    }
  }

  return undefined;
}

function toPriority(value: unknown): number | undefined {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string') {
    const parsed = Number.parseInt(value, 10);
    return Number.isNaN(parsed) ? undefined : parsed;
  }

  return undefined;
}

function sanitizeBookingUrlCandidate(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return undefined;
  }

  if (/^(javascript|data|vbscript):/i.test(trimmed)) {
    return undefined;
  }

  if (
    /^(https?:)?\/\//i.test(trimmed) ||
    trimmed.indexOf('/') === 0 ||
    trimmed.indexOf('./') === 0 ||
    trimmed.indexOf('../') === 0 ||
    trimmed.indexOf('?') === 0 ||
    trimmed.indexOf('#') === 0
  ) {
    return trimmed;
  }

  try {
    const parsed = new URL(trimmed);
    if (parsed.protocol === 'http:' || parsed.protocol === 'https:') {
      return parsed.toString();
    }
  } catch {
    return undefined;
  }

  return undefined;
}

export interface IRawBookingResource {
  id?: unknown;
  name?: unknown;
  category?: unknown;
  site?: unknown;
  bookingUrl?: unknown;
  availability?: unknown;
  rules?: unknown;
  featured?: unknown;
  priority?: unknown;
}

export function normalizeBookingResource(raw: IRawBookingResource, index: number): IBookingResource {
  const name = typeof raw.name === 'string' && raw.name.trim() ? raw.name.trim() : `Recurso ${index + 1}`;
  const id = typeof raw.id === 'string' && raw.id.trim() ? raw.id.trim() : `${name.toLowerCase().replace(/\s+/g, '-')}-${index + 1}`;

  return {
    id,
    name,
    category: typeof raw.category === 'string' && raw.category.trim() ? raw.category.trim() : undefined,
    site: typeof raw.site === 'string' && raw.site.trim() ? raw.site.trim() : undefined,
    bookingUrl: sanitizeBookingUrlCandidate(raw.bookingUrl),
    availability: toAvailability(raw.availability),
    rules: typeof raw.rules === 'string' && raw.rules.trim() ? raw.rules.trim() : undefined,
    featured: toBoolean(raw.featured),
    priority: toPriority(raw.priority)
  };
}

export function normalizeBookingResources(rawResources: IRawBookingResource[] | undefined): IBookingResource[] {
  const source = Array.isArray(rawResources) ? rawResources : [];
  return source.map((resource, index) => normalizeBookingResource(resource, index));
}

export function parseBookingResourcesJson(jsonText: string | undefined): IBookingResource[] {
  if (!jsonText || !jsonText.trim()) {
    return [];
  }

  const parsed = JSON.parse(jsonText) as unknown;
  if (Array.isArray(parsed)) {
    return normalizeBookingResources(parsed as IRawBookingResource[]);
  }

  if (parsed && typeof parsed === 'object' && 'resources' in parsed && Array.isArray((parsed as { resources?: unknown }).resources)) {
    return normalizeBookingResources((parsed as { resources: IRawBookingResource[] }).resources);
  }

  throw new Error('resourcesJson must be an array or an object with a resources array.');
}

export function getResourceCategories(resources: IBookingResource[]): string[] {
  const uniqueCategories: string[] = [];

  resources.forEach((resource) => {
    if (resource.category && uniqueCategories.indexOf(resource.category) === -1) {
      uniqueCategories.push(resource.category);
    }
  });

  uniqueCategories.sort((left, right) => left.localeCompare(right));

  return ['Todos'].concat(uniqueCategories);
}

export function getResourceSites(resources: IBookingResource[]): string[] {
  const uniqueSites: string[] = [];

  resources.forEach((resource) => {
    if (resource.site && uniqueSites.indexOf(resource.site) === -1) {
      uniqueSites.push(resource.site);
    }
  });

  uniqueSites.sort((left, right) => left.localeCompare(right));

  return ['Todos'].concat(uniqueSites);
}

export function isResourcePartial(resource: IBookingResource, showAvailability: boolean = true): boolean {
  if (!resource.bookingUrl) {
    return true;
  }

  if (!showAvailability) {
    return false;
  }

  return !resource.availability;
}
