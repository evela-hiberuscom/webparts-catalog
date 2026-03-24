import type {
  IProjectStatusRequest,
  IProjectStatusResult,
} from '../models/projectStatusTypes';
import { buildProjectStatusResult } from '../utils/projectStatusUtils';
import type { IProjectsRepository } from '../repositories/projectsRepository';

export class ProjectStatusService {
  public constructor(private readonly repository: IProjectsRepository) {}

  public async load(request: IProjectStatusRequest): Promise<IProjectStatusResult> {
    const sourceLabel = this.repository.getSourceLabel(request);
    const records = await this.repository.loadProjects(request);
    return buildProjectStatusResult(request, sourceLabel, records);
  }
}
