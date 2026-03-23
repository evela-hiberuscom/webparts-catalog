import type { IRecentResource } from '../models/recentAccesses.types';

export interface IRecentAccessesRepository {
  readonly sourceLabel: string;
  readonly isAuthoritative: boolean;
  load(): Promise<IRecentResource[]>;
}
