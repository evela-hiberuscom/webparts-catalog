import { UpcomingMilestonesRepository } from '../repositories/upcomingMilestonesRepository';

describe('upcomingMilestonesRepository', () => {
  it('maps SharePoint list items into milestone items', async () => {
    const repository = new UpcomingMilestonesRepository({
      spHttpClient: {
        get: jest.fn(async () => ({
          ok: true,
          json: async () => ({
            value: [
              {
                Id: 1,
                Title: 'Cierre Q2',
                TargetDate: '2026-04-10T09:00:00.000Z',
                Category: 'Finance',
                DetailUrl: {
                  Url: '/sites/finance/SitePages/q2.aspx'
                }
              }
            ]
          })
        })) as never
      } as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/finance'
    });

    const result = await repository.getMilestones({
      title: 'Próximos hitos',
      description: 'Timeline',
      listTitleOrUrl: 'MilestonesList',
      maxItems: 5,
      viewMode: 'timeline'
    });

    expect(result).toHaveLength(1);
    expect(result[0].title).toBe('Cierre Q2');
    expect(result[0].type).toBe('Finance');
    expect(result[0].detailUrl).toContain('/SitePages/q2.aspx');
  });
});
