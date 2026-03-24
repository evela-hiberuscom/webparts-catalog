import type { IProjectRecord, IProjectStatusRequest } from '../models/projectStatusTypes';
import { isSameOrigin } from './projectsRepository';
import type { IProjectsRepository } from './projectsRepository';

function readJsonItems(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (payload && typeof payload === 'object') {
    const candidate = (payload as { items?: unknown }).items;
    if (Array.isArray(candidate)) {
      return candidate;
    }
  }

  throw new Error('JsonUrl source returned an invalid JSON shape.');
}

export class JsonProjectsRepository implements IProjectsRepository {
  public constructor(private readonly fetcher: typeof fetch | undefined = globalThis.fetch) {}

  public async loadProjects(request: IProjectStatusRequest): Promise<IProjectRecord[]> {
    if (!request.jsonUrl) {
      throw new Error('JsonUrl source requires a configured URL.');
    }

    if (!isSameOrigin(request.jsonUrl, request.webUrl)) {
      throw new Error('JsonUrl source must be same-origin or relative.');
    }

    if (!this.fetcher) {
      throw new Error('Fetch API is not available in this environment.');
    }

    const response = await this.fetcher(new URL(request.jsonUrl, request.webUrl).toString(), {
      credentials: 'same-origin'
    });

    if (!response.ok) {
      throw new Error(`JsonUrl source returned ${response.status}.`);
    }

    let payload: unknown;

    try {
      payload = await response.json();
    } catch (error: unknown) {
      throw new Error(error instanceof Error ? `JsonUrl source returned malformed JSON: ${error.message}` : 'JsonUrl source returned malformed JSON.');
    }

    return readJsonItems(payload).map((item, index) => {
      const current = item && typeof item === 'object' ? (item as Record<string, unknown>) : {};
      return {
        id: String(current.id ?? current.Id ?? `json-${index}`),
        title: String(current.title ?? current.Title ?? current.name ?? current.Name ?? `Proyecto ${index + 1}`),
        status: current.status ? String(current.status) : undefined,
        owner: current.owner ? String(current.owner) : undefined,
        relevantDate: current.relevantDate ? String(current.relevantDate) : undefined,
        openUrl: current.openUrl ? String(current.openUrl) : undefined,
        category: current.category ? String(current.category) : undefined,
        partial: Boolean(current.partial)
      } satisfies IProjectRecord;
    });
  }

  public getSourceLabel(request: IProjectStatusRequest): string {
    return `JSON: ${request.jsonUrl ?? 'sin configurar'}`;
  }
}
