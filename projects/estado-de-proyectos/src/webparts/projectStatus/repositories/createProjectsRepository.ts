import type { ProjectStatusDataSourceType } from '../models/projectStatusTypes';
import { JsonProjectsRepository } from './jsonProjectsRepository';
import { SharePointListProjectsRepository } from './sharePointListProjectsRepository';
import { StaticProjectsRepository } from './staticProjectsRepository';
import type { IProjectsRepository } from './projectsRepository';

export function createProjectsRepository(dataSourceType: ProjectStatusDataSourceType): IProjectsRepository {
  switch (dataSourceType) {
    case 'JsonUrl':
      return new JsonProjectsRepository();
    case 'SharePointList':
      return new SharePointListProjectsRepository();
    case 'StaticConfig':
    default:
      return new StaticProjectsRepository();
  }
}
