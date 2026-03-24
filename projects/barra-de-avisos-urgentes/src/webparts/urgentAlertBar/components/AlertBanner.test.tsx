import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import AlertBanner from './AlertBanner';

describe('AlertBanner', () => {
  it('renders a critical banner with CTA and dismiss action', () => {
    const onDismiss = jest.fn();
    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      ReactDom.render(
        <AlertBanner
          alert={{
            id: '1',
            severity: 'critical',
            title: 'Incidencia VPN',
            message: 'La VPN presenta degradación',
            startAt: '2026-03-23T11:00:00Z',
            endAt: '2026-03-23T13:00:00Z',
            ctaUrl: '/sites/it/status/vpn',
            priority: 1
          }}
          dismissible={true}
          onDismiss={onDismiss}
        />,
        container
      );
    });

    expect(container.textContent).toContain('Crítico');
    expect(container.textContent).toContain('Incidencia VPN');
    expect(container.textContent).toContain('Abrir detalle');

    const dismissButton = container.querySelector('button');
    act(() => {
      dismissButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });
    expect(onDismiss).toHaveBeenCalledTimes(1);

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });
});
