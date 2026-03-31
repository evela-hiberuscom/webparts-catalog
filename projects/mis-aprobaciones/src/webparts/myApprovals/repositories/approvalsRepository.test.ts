jest.mock('@microsoft/sp-http', () => {
  return {
    SPHttpClient: {
      configurations: {
        v1: {}
      }
    }
  };
});

import { ApprovalsRepository } from './approvalsRepository';

describe('ApprovalsRepository', () => {
  it('loads approvals from a SharePoint list and normalizes the target URL', async () => {
    const get = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Approval from list',
            Requester: 'Ana',
            Source: 'SharePointList',
            Status: 'pending',
            DueDate: '2026-03-30T10:00:00.000Z',
            Created: '2026-03-28T10:00:00.000Z',
            OpenUrl: '/sites/portal/Lists/Approvals/Forms/AllItems.aspx'
          }
        ]
      })
    });

    const repository = new ApprovalsRepository({ get } as never, 'https://contoso.sharepoint.com/sites/hr');
    const result = await repository.loadApprovals({
      title: 'Mis aprobaciones',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'https://contoso.sharepoint.com/sites/hr/Lists/Approvals/Forms/AllItems.aspx',
      sourceUrl: '',
      showCompleted: false,
      maxItems: 10,
      defaultSort: 'dueDate'
    });

    expect(get).toHaveBeenCalled();
    expect(result.items[0].title).toBe('Approval from list');
    expect(result.hasPartialData).toBe(false);
  });

  it('falls back to static approvals when the connector source is missing', async () => {
    const repository = new ApprovalsRepository({ get: jest.fn() } as never, 'https://contoso.sharepoint.com/sites/hr');
    const result = await repository.loadApprovals({
      title: 'Mis aprobaciones',
      dataSourceType: 'Approvals',
      sourceUrl: '',
      listTitleOrUrl: '',
      showCompleted: false,
      maxItems: 10,
      defaultSort: 'dueDate'
    });

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.warnings).toContain('approvals-fallback');
  });
});
