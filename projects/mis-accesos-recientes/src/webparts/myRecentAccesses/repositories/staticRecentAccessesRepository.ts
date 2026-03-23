import type { IRecentAccessesRepository } from './IRecentAccessesRepository';
import { sampleRecentResources } from '../utils/recentAccesses.sample';
import type { IRecentResource } from '../models/recentAccesses.types';

export class StaticRecentAccessesRepository implements IRecentAccessesRepository {
  public readonly sourceLabel: string;

  public readonly isAuthoritative: boolean;

  private readonly _items: IRecentResource[];

  public constructor(sourceLabel: string, isAuthoritative: boolean, items: IRecentResource[] = sampleRecentResources) {
    this.sourceLabel = sourceLabel;
    this.isAuthoritative = isAuthoritative;
    this._items = items;
  }

  public async load(): Promise<IRecentResource[]> {
    return this._items;
  }
}
