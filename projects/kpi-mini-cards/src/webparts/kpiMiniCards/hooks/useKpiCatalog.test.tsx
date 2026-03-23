import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import { KpiCatalogProvider } from '../contexts/KpiCatalogContext';
import type { IKpiCatalogConfig, IKpiCatalogViewModel } from '../models/kpiModels';
import { useKpiCatalog } from './useKpiCatalog';

type HookResult = ReturnType<typeof useKpiCatalog>;

const baseConfig: IKpiCatalogConfig = {
  sourceType: 'StaticConfig',
  kpiCardsJson: '[]',
  jsonUrl: '',
  apiEndpointUrl: '',
  sharePointListTitle: '',
  webUrl: 'https://contoso.sharepoint.com/sites/intranet',
  showTrend: true,
  layoutMode: 'compact',
  maxItems: 20,
  openInNewTab: false
};

function HookHarness(props: {
  config: IKpiCatalogConfig;
  onChange: (result: HookResult) => void;
}): React.ReactElement {
  const result = useKpiCatalog(props.config);

  React.useEffect(() => {
    props.onChange(result);
  }, [props.onChange, result]);

  return <></>;
}

describe('useKpiCatalog', () => {
  let container: HTMLDivElement;
  let latestResult: HookResult | undefined;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    latestResult = undefined;
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  async function renderWithService(serviceResult: Promise<IKpiCatalogViewModel> | IKpiCatalogViewModel): Promise<void> {
    const service = {
      resolveCatalog: jest.fn().mockReturnValue(Promise.resolve(serviceResult))
    };

    await act(async () => {
      ReactDOM.render(
        <KpiCatalogProvider service={service as never}>
          <HookHarness
            config={baseConfig}
            onChange={(result) => {
              latestResult = result;
            }}
          />
        </KpiCatalogProvider>,
        container
      );

      await Promise.resolve();
    });
  }

  it('publishes the resolved catalog result', async () => {
    await renderWithService({
      items: [
        {
          id: 'kpi-1',
          label: 'Cobertura',
          value: 98,
          unit: '%',
          state: 'ok',
          trend: 'up',
          comparison: 'vs objetivo',
          comparisonLabel: '',
          priority: 1,
          threshold: 95,
          thresholdDirection: 'above',
          badge: 'ok',
          description: '',
          openInNewTab: false,
          safeLink: {
            href: '/sites/quality',
            target: '_self'
          },
          hasPartialData: false
        }
      ],
      sourceLabel: 'JSON URL (same-origin)',
      hasPartialData: false,
      notes: [],
      status: 'ready',
      reload: jest.fn()
    });

    expect(latestResult?.status).toBe('ready');
    expect(latestResult?.items).toHaveLength(1);
    expect(latestResult?.items[0].state).toBe('ok');
  });

  it('publishes an error state when the service rejects', async () => {
    const service = {
      resolveCatalog: jest.fn().mockRejectedValue(new Error('feed failure'))
    };

    await act(async () => {
      ReactDOM.render(
        <KpiCatalogProvider service={service as never}>
          <HookHarness
            config={baseConfig}
            onChange={(result) => {
              latestResult = result;
            }}
          />
        </KpiCatalogProvider>,
        container
      );

      await Promise.resolve();
    });

    expect(latestResult?.status).toBe('error');
    expect(latestResult?.notes[0]).toContain('feed failure');
  });
});
