/* eslint-disable @rushstack/pair-react-dom-render-unmount */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { OnboardingChecklistProvider } from '../contexts/OnboardingChecklistContext';
import type { IOnboardingChecklistRequest, IOnboardingChecklistViewModel } from '../models/onboardingChecklistModels';
import { useOnboardingChecklist } from './useOnboardingChecklist';

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

function buildRequest(overrides: Partial<IOnboardingChecklistRequest> = {}): IOnboardingChecklistRequest {
  return {
    title: 'Checklist de onboarding',
    description: 'Checklist secuencial',
    dataSourceType: 'StaticConfig',
    webUrl: 'https://contoso.sharepoint.com/sites/onboarding',
    listTitleOrUrl: 'OnboardingChecklistList',
    jsonUrl: '',
    staticConfigJson: '',
    defaultVariant: 'all',
    defaultPhase: 'all',
    userDisplayName: 'Ada Lovelace',
    ...overrides
  };
}

describe('useOnboardingChecklist', () => {
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
            title: 'Revisar bienvenida',
            phase: 'Inicio',
            variant: 'General',
            mandatory: true,
            order: 1,
            partialData: false
          },
          {
            id: '2',
            title: 'Completar perfil',
            phase: 'Inicio',
            variant: 'Nuevo ingreso',
            mandatory: false,
            order: 2,
            partialData: false
          }
        ],
        sourceLabel: 'SharePoint',
        notes: [],
        hasPartialData: false
      }))
    };

    let latest: IOnboardingChecklistViewModel | undefined;

    function Probe(props: { request: IOnboardingChecklistRequest }): React.ReactElement | null {
      latest = useOnboardingChecklist(props.request);
      return null;
    }

    await act(async () => {
      ReactDOM.render(
        <OnboardingChecklistProvider service={service as never}>
          <Probe request={buildRequest({ dataSourceType: 'SharePointList' })} />
        </OnboardingChecklistProvider>,
        container
      );
      await flush();
    });

    expect(service.resolve).toHaveBeenCalledTimes(1);
    expect(latest?.status).toBe('ready');
    expect(latest?.filteredItems.length).toBe(2);

    await act(async () => {
      latest?.setVariantFilter('Nuevo ingreso');
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
