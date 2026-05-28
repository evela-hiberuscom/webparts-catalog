import type { SitesPresenceRepository } from '../repositories/sitesPresenceRepository';
import type { ISitePresence, ISitesPresenceConfiguration } from '../models/sitesPresenceModels';
import { SitesPresenceService } from './sitesPresenceService';

const configuration: ISitesPresenceConfiguration = {
  dataSourceType: 'StaticConfig',
  listTitleOrUrl: '',
  maxItems: 5
};

describe('SitesPresenceService', () => {
  it('marks sites without address or hours as partial data', async () => {
    const sites: ISitePresence[] = [
      {
        id: 'site-1',
        name: 'Madrid',
        address: undefined,
        status: 'open',
        capacity: 100,
        currentOccupancy: 45,
        hours: undefined,
        contact: undefined
      }
    ];
    const repository = {
      getSites: jest.fn().mockResolvedValue(sites)
    } as unknown as SitesPresenceRepository;

    const state = await new SitesPresenceService(repository).loadSites(configuration);

    expect(state).toEqual({ status: 'partialData', data: sites, hasPartialData: true });
  });
});
