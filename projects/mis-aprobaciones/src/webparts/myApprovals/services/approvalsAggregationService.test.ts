import { ApprovalsAggregationService } from './approvalsAggregationService';
import { ApprovalOrderingService } from './approvalOrderingService';

describe('ApprovalsAggregationService', () => {
  it('orders, filters and limits approvals', async () => {
    const repository = {
      loadApprovals: jest.fn().mockResolvedValue({
        items: [
          {
            id: '1',
            title: 'Overdue item',
            requester: 'Ana',
            source: 'Approvals',
            status: 'pending',
            dueDate: '2026-03-29T09:00:00.000Z',
            createdDate: '2026-03-25T09:00:00.000Z',
            openUrl: '/item-1'
          },
          {
            id: '2',
            title: 'Completed item',
            requester: 'Ana',
            source: 'Approvals',
            status: 'completed',
            dueDate: '2026-03-30T09:00:00.000Z',
            createdDate: '2026-03-25T09:00:00.000Z',
            openUrl: '/item-2'
          }
        ],
        hasPartialData: false,
        warnings: []
      })
    };

    const service = new ApprovalsAggregationService(repository as never, new ApprovalOrderingService());
    const snapshot = await service.loadSnapshot({
      title: 'Mis aprobaciones',
      dataSourceType: 'Approvals',
      sourceUrl: '',
      listTitleOrUrl: '',
      showCompleted: false,
      maxItems: 10,
      defaultSort: 'dueDate'
    });

    expect(snapshot.items).toHaveLength(1);
    expect(snapshot.items[0].title).toBe('Overdue item');
    expect(snapshot.counts.overdue).toBe(1);
    expect(snapshot.sourceWarnings).toHaveLength(0);
  });
});
