import { TeamMembersRepository } from './TeamMembersRepository';
import type { IMeetTheTeamRequest } from '../models/teamMemberModels';

describe('TeamMembersRepository', () => {
  it('normalizes list URLs before calling GetList', async () => {
    const get = jest.fn(async (url: string) => ({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Laura Pérez',
            JobTitle: 'PM',
            Bio: 'Bio',
            PhotoUrl: '/img.jpg',
            ProfileUrl: '/profile',
            SortOrder: 1
          }
        ]
      })
    }));

    const spHttpClient = { get } as never;
    const repository = new TeamMembersRepository(spHttpClient);
    const request: IMeetTheTeamRequest = {
      webPartProps: {
        title: 'Conoce al equipo',
        description: 'Descripción',
        dataSourceType: 'SharePointList',
        dataSourceTypesCsv: 'SharePointList',
        listTitleOrUrl: 'https://contoso.sharepoint.com/sites/demo/Lists/TeamMembers/Forms/AllItems.aspx',
        jsonUrl: '',
        directoryEndpoint: '',
        staticMembersJson: '[]',
        maxItems: 12,
        sortMode: 'manual'
      },
      hostContext: {
        spHttpClient,
        webUrl: 'https://contoso.sharepoint.com/sites/demo',
        siteUrl: 'https://contoso.sharepoint.com/sites/demo'
      }
    };

    const result = await repository.load(request);

    expect(result.items).toHaveLength(1);
    expect(get).toHaveBeenCalledTimes(1);
    const [endpoint] = get.mock.calls[0] as [string];
    expect(endpoint).toContain('/_api/web/GetList(@listUrl)/items');
    expect(endpoint).not.toContain('Forms/AllItems.aspx');
    expect(result.items[0]?.displayName).toBe('Laura Pérez');
  });

  it('falls back to static config when no external source is configured', async () => {
    const repository = new TeamMembersRepository({ get: jest.fn() } as never);
    const request: IMeetTheTeamRequest = {
      webPartProps: {
        title: 'Conoce al equipo',
        description: 'Descripción',
        dataSourceType: 'StaticConfig',
        dataSourceTypesCsv: 'StaticConfig',
        listTitleOrUrl: '',
        jsonUrl: '',
        directoryEndpoint: '',
        staticMembersJson: '[{"displayName":"Laura Pérez","jobTitle":"Product Manager","bio":"Bio","photoUrl":"/img.jpg","profileUrl":"/profile","sortOrder":1}]',
        maxItems: 12,
        sortMode: 'manual'
      },
      hostContext: {
        spHttpClient: { get: jest.fn() } as never,
        webUrl: 'https://contoso.sharepoint.com/sites/demo',
        siteUrl: 'https://contoso.sharepoint.com/sites/demo'
      }
    };

    const result = await repository.load(request);

    expect(result.sourceLabel).toBe('StaticConfig');
    expect(result.items[0]?.displayName).toBe('Laura Pérez');
  });
});
