import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useCelebrations } from './useCelebrations';
import type { CelebrationService } from '../services/celebrationService';

describe('useCelebrations', () => {
  it('loads state and supports refresh', async () => {
    const service = {
      resolveCelebrations: jest.fn().mockResolvedValue({
        title: 'Cumpleaños y aniversarios',
        subtitle: 'Reconoce los hitos de hoy y los próximos en una vista ligera.',
        status: 'ready',
        items: [],
        todayItems: [],
        upcomingItems: [],
        partialItems: [],
        sourceLabel: 'SharePoint list',
        hasPartialData: false,
        notes: []
      })
    } as unknown as CelebrationService;

    function Harness(): React.ReactElement {
      const state = useCelebrations(
        {
          dataSourceTypes: ['SharePointList'],
          webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal',
          showBirthdays: true,
          showAnniversaries: true,
          daysAhead: 14,
          spHttpClientConfiguration: {}
        },
        service
      );

      return (
        <div>
          <span data-status={state.status}>{state.status}</span>
          <button type="button" onClick={state.refresh}>
            refresh
          </button>
        </div>
      );
    }

    const container = document.createElement('div');
    document.body.appendChild(container);

    await act(async () => {
      ReactDom.render(<Harness />, container);
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect(container.querySelector('[data-status]')?.textContent).toBe('ready');
    expect((service.resolveCelebrations as jest.Mock).mock.calls).toHaveLength(1);

    await act(async () => {
      container.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect((service.resolveCelebrations as jest.Mock).mock.calls).toHaveLength(2);

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });
});
