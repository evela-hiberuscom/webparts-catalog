import type { IWhatChangedFeedConfiguration } from '../models/whatChangedFeedModels';
import { WhatChangedFeedService } from '../services/whatChangedFeedService';

describe('whatChangedFeedService', () => {
  const configuration: IWhatChangedFeedConfiguration = {
    title: 'Qué ha cambiado',
    description: 'Feed de cambios.',
    sourceKind: 'list',
    listTitleOrUrl: 'Recent Changes',
    defaultTypeFilter: 'Policy',
    maxItems: 5
  };

  it('returns ready for complete items', async () => {
    const service = new WhatChangedFeedService({
      getChanges: jest.fn(async () => [
        { id: '1', title: 'Policy', type: 'Policy', changedAt: '2026-04-08T09:00:00.000Z', summary: 'x', openUrl: 'https://contoso.sharepoint.com/a', featured: false }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('ready');
  });

  it('returns empty when type filter removes all items', async () => {
    const service = new WhatChangedFeedService({
      getChanges: jest.fn(async () => [
        { id: '1', title: 'Doc', type: 'Document', changedAt: '2026-04-08T09:00:00.000Z', summary: 'x', openUrl: 'https://contoso.sharepoint.com/a', featured: false }
      ])
    });

    const result = await service.load(configuration);

    expect(result.status).toBe('empty');
  });
});
