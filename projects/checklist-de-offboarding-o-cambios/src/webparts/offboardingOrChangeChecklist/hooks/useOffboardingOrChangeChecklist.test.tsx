/* eslint-disable @rushstack/pair-react-dom-render-unmount */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { OffboardingOrChangeChecklistProvider } from '../contexts/OffboardingOrChangeChecklistContext';
import type { IChecklistViewModel, IOffboardingOrChangeChecklistRequest } from '../models/offboardingOrChangeChecklistModels';
import { useOffboardingOrChangeChecklist } from './useOffboardingOrChangeChecklist';

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function buildRequest(overrides: Partial<IOffboardingOrChangeChecklistRequest> = {}): IOffboardingOrChangeChecklistRequest {
  return {
    title: 'Checklist de offboarding o cambios',
    description: 'Organiza pasos de salida, transferencia o cambio organizativo.',
    dataSourceType: 'StaticConfig',
    webUrl: 'https://contoso.sharepoint.com/sites/portal',
    listTitleOrUrl: 'OffboardingChecklistList',
    jsonUrl: '',
    staticConfigJson: '',
    defaultScenario: 'generic',
    defaultPhase: '',
    userDisplayName: 'Ada Lovelace',
    ...overrides
  };
}

describe('useOffboardingOrChangeChecklist', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('loads steps and supports filter changes', async () => {
    const service = {
      resolve: jest.fn(async () => ({
        status: 'ready',
        items: [
          {
            id: '1',
            title: 'Cerrar accesos',
            description: 'VPN y correo',
            scenario: 'offboarding',
            phase: 'Seguridad',
            critical: true,
            priority: 1,
            partialData: false
          },
          {
            id: '2',
            title: 'Transferir conocimiento',
            description: 'Documentar traspaso',
            scenario: 'transfer',
            phase: 'Handoff',
            critical: false,
            priority: 2,
            partialData: false
          }
        ],
        sourceLabel: 'SharePoint',
        notes: [],
        hasPartialData: false
      }))
    };

    let latest: IChecklistViewModel | undefined;

    function Probe(props: { request: IOffboardingOrChangeChecklistRequest }): React.ReactElement | null {
      latest = useOffboardingOrChangeChecklist(props.request);
      return null;
    }

    await act(async () => {
      ReactDOM.render(
        <OffboardingOrChangeChecklistProvider service={service as never}>
          <Probe request={buildRequest({ dataSourceType: 'SharePointList' })} />
        </OffboardingOrChangeChecklistProvider>,
        container
      );
      await flush();
    });

    expect(service.resolve).toHaveBeenCalledTimes(1);
    expect(latest?.status).toBe('ready');
    expect(latest?.filteredItems.length).toBe(2);

    await act(async () => {
      latest?.setScenarioFilter('offboarding');
      await flush();
    });

    expect(latest?.filteredItems.length).toBe(1);

    await act(async () => {
      latest?.resetFilters();
      await flush();
    });

    expect(latest?.filteredItems.length).toBe(2);
  });
});
