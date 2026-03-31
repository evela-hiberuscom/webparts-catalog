jest.mock('MyApprovalsWebPartStrings', () => jest.requireActual('../testSupport/mockMyApprovalsStrings'), { virtual: true });

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import { MyApprovals } from './MyApprovals';

describe('MyApprovals component', () => {
  it('renders approvals and summary content', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const service = {
      loadSnapshot: jest.fn().mockResolvedValue({
        items: [
          {
            id: '1',
            title: 'Approval from component',
            requester: 'Ana',
            source: 'Approvals',
            status: 'pending',
            dueDate: '2026-03-30T10:00:00.000Z',
            createdDate: '2026-03-28T10:00:00.000Z',
            openUrl: '/item-1',
            group: 'today',
            isPartial: false,
            isActionable: true,
            statusLabel: 'pending',
            badgeLabel: 'today'
          }
        ],
        counts: {
          overdue: 0,
          today: 1,
          upcoming: 0,
          noDate: 0,
          pending: 1,
          completed: 0,
          total: 1,
          partial: 0
        },
        hasPartialData: false,
        sourceWarnings: []
      })
    };

    await act(async () => {
      ReactDom.render(
        <MyApprovals
          title="Mis aprobaciones"
          description="Panel"
          config={{
            title: 'Mis aprobaciones',
            dataSourceType: 'Approvals',
            sourceUrl: '',
            listTitleOrUrl: '',
            showCompleted: false,
            maxItems: 10,
            defaultSort: 'dueDate'
          }}
          service={service as never}
        />,
        container
      );
    });

    expect(container.textContent).toContain('Approval from component');
    expect(container.textContent).toContain('Approval summary');
    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });
});
