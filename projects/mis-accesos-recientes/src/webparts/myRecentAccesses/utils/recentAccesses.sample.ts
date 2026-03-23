import type { IRecentResource } from '../models/recentAccesses.types';

export const sampleRecentResources: IRecentResource[] = [
  {
    id: 'recent-1',
    title: 'Portal RRHH',
    type: 'page',
    lastAccessedAt: '2026-03-21T08:20:00Z',
    openUrl: '/sites/hr',
    sourceLabel: 'Fallback local'
  },
  {
    id: 'recent-2',
    title: 'Propuesta de proyecto',
    type: 'document',
    lastAccessedAt: '2026-03-21T10:05:00Z',
    openUrl: '/sites/docs/Propuesta.docx',
    sourceLabel: 'Fallback local'
  },
  {
    id: 'recent-3',
    title: 'Calendario del equipo',
    type: 'app',
    lastAccessedAt: '2026-03-20T15:45:00Z',
    openUrl: '/sites/team/calendar',
    sourceLabel: 'Fallback local'
  },
  {
    id: 'recent-4',
    title: 'Pol%C3%ADtica de gastos',
    type: 'document',
    lastAccessedAt: undefined,
    openUrl: '/sites/finance/policy',
    sourceLabel: 'Fallback local'
  }
];
