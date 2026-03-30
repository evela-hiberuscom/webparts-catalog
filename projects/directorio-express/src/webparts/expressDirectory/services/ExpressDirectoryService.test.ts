jest.mock('@microsoft/sp-http', () => ({
  SPHttpClient: {
    configurations: {
      v1: {}
    }
  }
}));

import { ExpressDirectoryService } from './ExpressDirectoryService';

describe('ExpressDirectoryService', () => {
  it('combines sources, filters by area and honors max items', async () => {
    const service = new ExpressDirectoryService(
      {
        pageContext: {
          web: { absoluteUrl: 'https://contoso.sharepoint.com/sites/demo' }
        }
      } as never,
      {
        directory: {
          load: async () => ({
            sourceType: 'Directory',
            sourceLabel: 'Directory API',
            items: [
              {
                id: '1',
                displayName: 'Marta Ruiz',
                jobTitle: 'HRBP',
                area: 'RRHH',
                email: 'marta@corp.com',
                profileUrl: '/profile/marta',
                photoUrl: undefined
              }
            ],
            warnings: ['directory-partial']
          })
        },
        peopleList: {
          load: async () => ({
            sourceType: 'SharePointList',
            sourceLabel: 'PeopleList',
            items: [
              {
                id: '2',
                displayName: 'Luis Gómez',
                jobTitle: 'Manager',
                area: 'IT',
                email: 'luis@corp.com',
                profileUrl: '/profile/luis',
                photoUrl: '/img/luis.png'
              }
            ],
            warnings: []
          })
        },
        jsonUrl: { load: async () => ({ sourceType: 'JsonUrl', sourceLabel: 'Json', items: [], warnings: [] }) },
        staticConfig: { load: async () => ({ sourceType: 'StaticConfig', sourceLabel: 'Static', items: [], warnings: [] }) }
      }
    );

    const result = await service.load(
      {
        webUrl: 'https://contoso.sharepoint.com/sites/demo',
        query: 'Marta',
        selectedArea: 'RRHH',
        dataSourceTypesCsv: 'Directory,SharePointList',
        listTitleOrUrl: 'PeopleList',
        jsonUrl: '',
        staticPeopleJson: '',
        maxItems: 12,
        defaultAreaFilter: ''
      },
      { query: 'Marta', selectedArea: 'RRHH' }
    );

    expect(result.status).toBe('partialData');
    expect(result.items).toHaveLength(1);
    expect(result.items[0].displayName).toBe('Marta Ruiz');
    expect(result.areas).toEqual(['IT', 'RRHH']);
  });
});
