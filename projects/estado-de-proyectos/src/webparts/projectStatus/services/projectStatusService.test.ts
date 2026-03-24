import { ProjectStatusService } from './projectStatusService';
import type { IProjectsRepository } from '../repositories/projectsRepository';

describe('ProjectStatusService', () => {
  it('loads and normalizes the result from the repository', async () => {
    const repository: IProjectsRepository = {
      loadProjects: async () => [
        {
          id: 'a',
          title: 'Proyecto A',
          status: 'red',
          owner: 'Equipo 1',
          relevantDate: '2026-03-28',
          openUrl: '/sites/demo/a'
        },
        {
          id: 'b',
          title: 'Proyecto B',
          status: 'green',
          owner: 'Equipo 2',
          relevantDate: '2026-03-30',
          openUrl: '/sites/demo/b'
        }
      ],
      getSourceLabel: () => 'StaticConfig'
    };

    const service = new ProjectStatusService(repository);
    const result = await service.load({
      webUrl: 'https://contoso.sharepoint.com/sites/demo',
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: 'ProjectsList',
      maxItems: 8,
      defaultStatusFilter: 'all',
      showOwner: true
    });

    expect(result.sourceLabel).toBe('StaticConfig');
    expect(result.items[0]?.title).toBe('Proyecto A');
    expect(result.availableFilters).toContain('green');
  });
});
