import { WhatChangedFeedRepository } from '../repositories/whatChangedFeedRepository';

describe('whatChangedFeedRepository', () => {
  it('maps SharePoint items into changes', async () => {
    const repository = new WhatChangedFeedRepository({
      spHttpClient: {
        get: jest.fn(async () => ({
          ok: true,
          json: async () => ({
            value: [
              {
                Id: 1,
                Title: 'Nueva política de vacaciones',
                Description: 'Se actualizó el resumen.',
                Modified: '2026-04-08T09:00:00.000Z',
                FileRef: '/sites/comms/SitePages/politica.aspx',
                ChangeType: 'Policy'
              }
            ]
          })
        })) as never
      } as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/comms'
    });

    const result = await repository.getChanges({
      title: 'Qué ha cambiado',
      description: 'Feed de cambios.',
      sourceKind: 'list',
      listTitleOrUrl: 'Recent Changes',
      defaultTypeFilter: '',
      maxItems: 5
    });

    expect(result).toHaveLength(1);
    expect(result[0].type).toBe('Policy');
    expect(result[0].openUrl).toContain('/SitePages/politica.aspx');
  });
});
