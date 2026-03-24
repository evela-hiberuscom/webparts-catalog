import { MeetTheTeamService } from './MeetTheTeamService';
import type { IMeetTheTeamRequest } from '../models/teamMemberModels';

describe('MeetTheTeamService', () => {
  const request: IMeetTheTeamRequest = {
    webPartProps: {
      title: 'Conoce al equipo',
      description: 'Descripción',
      dataSourceType: 'StaticConfig',
      dataSourceTypesCsv: 'StaticConfig',
      listTitleOrUrl: '',
      jsonUrl: '',
      directoryEndpoint: '',
      staticMembersJson: '[]',
      maxItems: 12,
      sortMode: 'manual'
    },
    hostContext: {
      spHttpClient: {} as never,
      webUrl: 'https://contoso.sharepoint.com/sites/demo',
      siteUrl: 'https://contoso.sharepoint.com/sites/demo'
    }
  };

  it('loads, sorts and trims the repository result', async () => {
    const repository = {
      load: jest.fn(async () => ({
        items: [
          {
            id: 'b',
            displayName: 'Zoe',
            jobTitle: 'Developer',
            bio: 'Bio',
            photoUrl: '/img.jpg',
            profileUrl: '/profile',
            sortOrder: 2,
            initials: 'Z',
            partialData: false
          },
          {
            id: 'a',
            displayName: 'Ana',
            jobTitle: 'Manager',
            bio: 'Bio',
            photoUrl: '/img.jpg',
            profileUrl: '/profile',
            sortOrder: 1,
            initials: 'A',
            partialData: false
          }
        ],
        sourceLabel: 'StaticConfig',
        notes: ['ok'],
        hasPartialData: false
      }))
    };

    const service = new MeetTheTeamService({ repository: repository as never });
    const viewModel = await service.load(request);

    expect(viewModel.state).toBe('ready');
    expect(viewModel.items[0]?.id).toBe('a');
    expect(viewModel.sourceLabel).toBe('StaticConfig');
  });

  it('marks partial data when any item is incomplete', async () => {
    const repository = {
      load: jest.fn(async () => ({
        items: [
          {
            id: 'a',
            displayName: 'Ana',
            jobTitle: 'Manager',
            bio: '',
            photoUrl: undefined,
            profileUrl: '/profile',
            sortOrder: 1,
            initials: 'A',
            partialData: true
          }
        ],
        sourceLabel: 'JsonUrl: /team.json',
        notes: ['partial'],
        hasPartialData: true
      }))
    };

    const service = new MeetTheTeamService({ repository: repository as never });
    const viewModel = await service.load(request);

    expect(viewModel.state).toBe('partialData');
    expect(viewModel.hasPartialData).toBe(true);
  });
});
