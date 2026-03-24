import type {
  IProjectRecord,
  IProjectStatusDataSource,
  IProjectStatusRequest
} from '../models/projectStatusTypes';

export interface IProjectsRepository extends IProjectStatusDataSource {
  loadProjects(request: IProjectStatusRequest): Promise<IProjectRecord[]>;
}

export function isSameOrigin(url: string, webUrl: string): boolean {
  try {
    return new URL(url, webUrl).origin === new URL(webUrl).origin;
  } catch {
    return false;
  }
}
