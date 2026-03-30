import type { IExpressDirectorySourceRequest, IExpressDirectorySourceResult } from '../models/expressDirectoryModels';
import { normalizePerson } from '../utils/expressDirectoryUtils';
import type { IExpressDirectorySourceRepository } from './IExpressDirectorySourceRepository';

interface IStaticConfigPayload {
  items?: Array<Record<string, unknown>>;
}

export class StaticConfigRepository implements IExpressDirectorySourceRepository {
  public async load(request: IExpressDirectorySourceRequest): Promise<IExpressDirectorySourceResult> {
    const trimmed = request.staticPeopleJson.trim();
    if (!trimmed) {
      return {
        sourceType: 'StaticConfig',
        sourceLabel: 'Static config',
        items: [],
        warnings: ['static-config-empty']
      };
    }

    const payload = JSON.parse(trimmed) as IStaticConfigPayload | Array<Record<string, unknown>>;
    const rawItems = Array.isArray(payload) ? payload : payload.items ?? [];
    const items = rawItems.map((item, index) =>
      normalizePerson({
        id: String(item.id ?? index + 1),
        displayName: String(item.displayName ?? item.name ?? ''),
        jobTitle: item.jobTitle === undefined ? undefined : String(item.jobTitle ?? ''),
        area: item.area === undefined ? undefined : String(item.area ?? ''),
        email: item.email === undefined ? undefined : String(item.email ?? ''),
        profileUrl: item.profileUrl === undefined ? undefined : String(item.profileUrl ?? ''),
        photoUrl: item.photoUrl === undefined ? undefined : String(item.photoUrl ?? '')
      })
    );

    return {
      sourceType: 'StaticConfig',
      sourceLabel: 'Static config',
      items,
      warnings: items.some((item) => !item.profileUrl || !item.photoUrl || !item.area || !item.jobTitle)
        ? ['static-config-partial']
        : []
    };
  }
}
