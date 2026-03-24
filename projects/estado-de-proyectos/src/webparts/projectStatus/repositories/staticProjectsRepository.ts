import type { IProjectRecord, IProjectStatusRequest } from '../models/projectStatusTypes';
import type { IProjectsRepository } from './projectsRepository';

const STATIC_PROJECTS: IProjectRecord[] = [
  {
    id: 'crm-migration',
    title: 'Migración CRM',
    status: 'amber',
    owner: 'Equipo Comercial',
    relevantDate: '2026-03-28',
    openUrl: '/sites/sales/projects/crm',
    category: 'Comercial'
  },
  {
    id: 'portal-interno',
    title: 'Portal interno',
    status: 'green',
    owner: 'Comms',
    relevantDate: '2026-03-24',
    openUrl: '/sites/comms/projects/portal',
    category: 'Comunicación'
  },
  {
    id: 'data-hub',
    title: 'Data Hub',
    status: 'red',
    owner: 'Data Office',
    relevantDate: '2026-03-25',
    openUrl: '/sites/data/projects/hub',
    category: 'Datos'
  },
  {
    id: 'pm-dashboard',
    title: 'PM Dashboard',
    status: 'unknown',
    owner: 'PMO',
    relevantDate: undefined,
    openUrl: '/sites/pmo/projects/dashboard',
    category: 'PMO',
    partial: true
  },
  {
    id: 'it-modernization',
    title: 'Modernización IT',
    status: 'amber',
    owner: 'IT',
    relevantDate: '2026-04-03',
    openUrl: undefined,
    category: 'Tecnología',
    partial: true
  }
];

export class StaticProjectsRepository implements IProjectsRepository {
  public async loadProjects(_request: IProjectStatusRequest): Promise<IProjectRecord[]> {
    return Promise.resolve(STATIC_PROJECTS);
  }

  public getSourceLabel(): string {
    return 'Configuración estática';
  }
}
