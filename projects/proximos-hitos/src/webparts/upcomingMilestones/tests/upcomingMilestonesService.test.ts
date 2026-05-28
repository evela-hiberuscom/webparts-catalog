jest.mock('UpcomingMilestonesWebPartStrings', () => ({
  NoDateLabel: 'Sin fecha'
}), { virtual: true });

import type { IUpcomingMilestonesConfiguration } from '../models/upcomingMilestonesModels';
import { UpcomingMilestonesService } from '../services/upcomingMilestonesService';

describe('upcomingMilestonesService', () => {
  const configuration: IUpcomingMilestonesConfiguration = {
    title: 'Próximos hitos',
    description: 'Timeline',
    listTitleOrUrl: 'MilestonesList',
    maxItems: 2,
    viewMode: 'timeline'
  };

  it('sorts milestones by date and leaves null dates last', async () => {
    const service = new UpcomingMilestonesService({
      getMilestones: jest.fn(async () => [
        { id: '3', title: 'Sin fecha', type: 'Ops' },
        { id: '2', title: 'Segundo', date: '2026-04-11T09:00:00.000Z', type: 'Ops', detailUrl: 'https://contoso.sharepoint.com/sites/comms/2' },
        { id: '1', title: 'Primero', date: '2026-04-09T09:00:00.000Z', type: 'Ops', detailUrl: 'https://contoso.sharepoint.com/sites/comms/1' }
      ])
    });

    const result = await service.load(configuration);

    expect(result.items).toHaveLength(2);
    expect(result.items[0].title).toBe('Primero');
    expect(result.items[1].title).toBe('Segundo');
    expect(result.status).toBe('ready');
  });

  it('returns partialData when a milestone misses its date', async () => {
    const service = new UpcomingMilestonesService({
      getMilestones: jest.fn(async () => [
        { id: '1', title: 'Sin fecha', type: 'Ops', detailUrl: 'https://contoso.sharepoint.com' }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('partialData');
    expect(result.hasPartialData).toBe(true);
  });
});
