import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useAlertBar } from './useAlertBar';
import type { IAlertBarService } from '../models/alertModels';

describe('useAlertBar', () => {
  it('loads ready state and supports refresh', async () => {
    const service: IAlertBarService = {
      load: jest.fn().mockResolvedValue({
        sourceLabel: 'SharePointListTitle',
        hasPartialData: false,
        items: [
          {
            id: 'critical',
            severity: 'critical',
            title: 'Incidencia VPN',
            message: 'La VPN presenta degradación',
            startAt: '2026-03-23T11:00:00Z',
            endAt: '2026-03-23T13:00:00Z',
            ctaUrl: '/sites/it/status/vpn',
            priority: 1
          }
        ]
      })
    };

    function Harness(): React.ReactElement {
      const state = useAlertBar({
        service,
        request: {
          dataSourceType: 'SharePointList',
          listTitleOrUrl: 'AlertsList',
          maxAlerts: 3,
          dismissible: false,
          webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal'
        }
      });

      return (
        <div>
          <span data-state={state.status}>{state.status}</span>
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

    expect(container.querySelector('[data-state]')?.textContent).toBe('ready');
    expect((service.load as jest.Mock).mock.calls).toHaveLength(1);

    await act(async () => {
      container.querySelector('button')?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    await act(async () => {
      await Promise.resolve();
    });

    expect((service.load as jest.Mock).mock.calls).toHaveLength(2);

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });
});
