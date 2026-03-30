jest.mock('@microsoft/sp-http', () => ({
  SPHttpClient: {
    configurations: {
      v1: {}
    }
  }
}));

import { PeopleListRepository } from './PeopleListRepository';

describe('PeopleListRepository', () => {
  it('normalizes AllItems.aspx URLs to the list root', async () => {
    const get = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Marta Ruiz',
            JobTitle: 'HRBP',
            Area: 'RRHH',
            Email: 'marta@corp.com',
            ProfileUrl: '/profile/marta',
            PhotoUrl: '/img/marta.png'
          }
        ]
      })
    }));

    const repository = new PeopleListRepository({
      pageContext: { web: { absoluteUrl: 'https://contoso.sharepoint.com/sites/demo' } },
      spHttpClient: { get } as never
    } as never);

    const result = await repository.load({
      webUrl: 'https://contoso.sharepoint.com/sites/demo',
      query: '',
      selectedArea: '',
      dataSourceTypesCsv: 'SharePointList',
      listTitleOrUrl: '/sites/demo/Lists/People/Forms/AllItems.aspx',
      jsonUrl: '',
      staticPeopleJson: '',
      maxItems: 12,
      defaultAreaFilter: ''
    });

    const calls = get.mock.calls as unknown as Array<[string]>;
    expect(calls[0][0]).not.toContain('AllItems.aspx');
    expect(result.items[0].displayName).toBe('Marta Ruiz');
  });
});
