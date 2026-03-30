jest.mock('@microsoft/sp-http', () => ({
  SPHttpClient: {
    configurations: {
      v1: {}
    }
  }
}), { virtual: true });

import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { OrgListRepository } from './OrgListRepository';

describe('OrgListRepository', () => {
  it('normalizes AllItems.aspx list URLs before loading items', async () => {
    const get = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Root Person',
            JobTitle: 'Director',
            ProfileUrl: 'https://contoso.sharepoint.com/sites/hr/person/1',
            ManagerId: null,
            ReportIds: '2'
          }
        ]
      })
    });

    const context = {
      spHttpClient: { get },
      pageContext: {
        web: {
          absoluteUrl: 'https://contoso.sharepoint.com/sites/hr'
        }
      }
    } as unknown as WebPartContext;

    const repository = new OrgListRepository(context);
    const people = await repository.load({
      dataSourceTypes: ['SharePointList'],
      listTitleOrUrl: 'https://contoso.sharepoint.com/sites/hr/Lists/Org/Forms/AllItems.aspx',
      viewMode: 'managerWithReports',
      maxDepth: 2
    });

    expect(get).toHaveBeenCalledWith(
      expect.stringContaining('/_api/web/GetList(@listUrl)/items'),
      expect.anything()
    );
    expect(people).toHaveLength(1);
    expect(people[0].displayName).toBe('Root Person');
  });
});

