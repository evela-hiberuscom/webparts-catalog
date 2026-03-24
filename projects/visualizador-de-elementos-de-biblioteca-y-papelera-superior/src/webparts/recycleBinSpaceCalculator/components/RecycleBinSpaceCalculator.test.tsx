jest.mock('../hooks/useRecycleBinSpaceCalculator', () => ({
  useRecycleBinSpaceCalculator: jest.fn()
}));

import * as React from 'react';
import ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import RecycleBinSpaceCalculator from './RecycleBinSpaceCalculator';

const mockedHook = jest.requireMock('../hooks/useRecycleBinSpaceCalculator').useRecycleBinSpaceCalculator as jest.Mock;

describe('RecycleBinSpaceCalculator', () => {
  it('renders stage metrics and actions', () => {
    mockedHook.mockReturnValue({
      status: 'ready',
      isRefreshing: false,
      errorMessage: undefined,
      viewModel: {
        siteUrl: 'https://contoso.sharepoint.com/sites/portal',
        recycleBinUrl: 'https://contoso.sharepoint.com/sites/portal/_layouts/15/RecycleBin.aspx',
        title: 'Visualizador de elementos de biblioteca y papelera superior',
        description: 'Diagnóstico de papelera',
        stage1: {
          stage: 1,
          label: 'Papelera nivel 1',
          itemCount: 2,
          sizeBytes: 2048,
          precision: 'exact',
          items: [],
          isAccessible: true
        },
        stage2: {
          stage: 2,
          label: 'Papelera nivel 2',
          itemCount: 1,
          sizeBytes: 1024,
          precision: 'exact',
          items: [],
          isAccessible: true
        },
        totalItemCount: 3,
        totalSizeBytes: 3072,
        hasPartialData: false,
        health: {
          level: 'ok',
          reasons: ['La papelera se mantiene por debajo de los umbrales configurados.']
        },
        lastUpdated: new Date('2026-03-24T10:00:00Z').toISOString()
      },
      refresh: jest.fn()
    });

    const container = document.createElement('div');

    act(() => {
      ReactDom.render(
        <RecycleBinSpaceCalculator
          description="Diagnóstico de papelera"
          showStageBreakdown={true}
          refreshIntervalSeconds={0}
          warningThresholdItems={1000}
          warningThresholdSizeMb={512}
          runtimeContext={{
            siteUrl: 'https://contoso.sharepoint.com/sites/portal',
            spHttpClient: { get: jest.fn() } as never
          }}
        />,
        container
      );
    });

    expect(container.textContent).toContain('Visualizador de elementos de biblioteca y papelera superior');
    expect(container.textContent).toContain('Papelera nivel 1');
    expect(container.textContent).toContain('Papelera nivel 2');

    act(() => {
      ReactDom.unmountComponentAtNode(container);
    });
  });
});
