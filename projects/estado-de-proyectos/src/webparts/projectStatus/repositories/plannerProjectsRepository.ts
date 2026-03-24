import type { IProjectRecord, IProjectStatusRequest } from '../models/projectStatusTypes';
import type { IProjectsRepository } from './projectsRepository';

export class PlannerProjectsRepository implements IProjectsRepository {
  public async loadProjects(_request: IProjectStatusRequest): Promise<IProjectRecord[]> {
    throw new Error('Planner source requires Graph permissions that are not enabled in this project.');
  }

  public getSourceLabel(request: IProjectStatusRequest): string {
    return `Planner: ${request.listTitleOrUrl}`;
  }
}
