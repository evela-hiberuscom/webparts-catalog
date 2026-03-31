import { classifyApprovalGroup, createFallbackApprovals, normalizeListTitleOrUrl, normalizeApprovalRecord, sortApprovalItems } from './myApprovalsUtils';

describe('myApprovalsUtils', () => {
  it('normalizes list URLs from AllItems.aspx to list titles', () => {
    const result = normalizeListTitleOrUrl('https://contoso.sharepoint.com/sites/hr/Lists/Approvals/Forms/AllItems.aspx', 'https://contoso.sharepoint.com');
    expect(result).toEqual({
      listTitle: 'Approvals',
      url: 'https://contoso.sharepoint.com/sites/hr/Lists/Approvals/Forms/AllItems.aspx'
    });
  });

  it('classifies overdue, today and noDate groups', () => {
    expect(classifyApprovalGroup({ status: 'pending', dueDate: '2026-03-29T12:00:00.000Z', createdDate: null }, new Date('2026-03-30T10:00:00.000Z'))).toBe('overdue');
    expect(classifyApprovalGroup({ status: 'pending', dueDate: '2026-03-30T12:00:00.000Z', createdDate: null }, new Date('2026-03-30T10:00:00.000Z'))).toBe('today');
    expect(classifyApprovalGroup({ status: 'pending', dueDate: null, createdDate: null }, new Date('2026-03-30T10:00:00.000Z'))).toBe('noDate');
  });

  it('sorts by group and date while preserving partial data', () => {
    const items = createFallbackApprovals().map((item, index) => normalizeApprovalRecord(item as never, index));
    const sorted = sortApprovalItems(items, 'dueDate', new Date('2026-03-30T10:00:00.000Z'));
    expect(sorted[0].title).toContain('vacaciones');
    expect(sorted.some((item) => item.requester === null)).toBe(true);
  });
});
