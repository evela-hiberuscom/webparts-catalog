jest.mock('../hooks/useKpiCatalog', () => ({
  useKpiCatalog: jest.fn()
}));

import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { KpiMiniCardsContent } from './KpiMiniCards';
import type { IKpiMiniCardsProps } from './IKpiMiniCardsProps';
import { useKpiCatalog } from '../hooks/useKpiCatalog';

const mockedUseKpiCatalog = useKpiCatalog as jest.MockedFunction<typeof useKpiCatalog>;

function buildProps(overrides: Partial<IKpiMiniCardsProps> = {}): IKpiMiniCardsProps {
  return {
    title: 'KPI mini-cards',
    subtitle: 'Métricas clave para leer el estado del equipo al instante.',
    sourceType: 'StaticConfig',
    kpiCardsJson: '[]',
    jsonUrl: '',
    apiEndpointUrl: '',
    listTitleOrUrl: '',
    webUrl: 'https://contoso.sharepoint.com/sites/intranet',
    showTrend: true,
    layoutMode: 'compact',
    maxItems: 20,
    openInNewTab: false,
    userDisplayName: 'Ada Lovelace',
    ...overrides
  };
}

describe('KpiMiniCardsContent', () => {
  it('renders the partial-data warning and the cards grid', () => {
    mockedUseKpiCatalog.mockReturnValue({
      status: 'partialData',
      items: [
        {
          id: 'coverage',
          label: 'Cobertura',
          value: 98,
          unit: '%',
          state: 'warning',
          trend: 'up',
          comparison: 'vs objetivo',
          comparisonLabel: '',
          priority: 1,
          threshold: 95,
          thresholdDirection: 'above',
          badge: 'warning',
          description: '',
          openInNewTab: false,
          safeLink: {
            href: '/sites/quality',
            target: '_self'
          },
          hasPartialData: true
        }
      ],
      sourceLabel: 'SharePoint list: KPI',
      hasPartialData: true,
      notes: ['observado: some input was partial'],
      reload: jest.fn()
    });

    const markup = renderToStaticMarkup(<KpiMiniCardsContent {...buildProps()} />);

    expect(markup).toContain('ms-MessageBar--warning');
    expect(markup).toContain('Cobertura');
    expect(markup).toContain('Origen');
    expect(markup).toContain('SharePoint list: KPI');
  });

  it('renders the empty state without sample cards', () => {
    mockedUseKpiCatalog.mockReturnValue({
      status: 'empty',
      items: [],
      sourceLabel: 'Static configuration (empty)',
      hasPartialData: false,
      notes: [],
      reload: jest.fn()
    });

    const markup = renderToStaticMarkup(<KpiMiniCardsContent {...buildProps()} />);

    expect(markup).toContain('No hay KPIs configurados');
    expect(markup).not.toContain('Cobertura');
  });

  it('renders the error state and the retry action', () => {
    mockedUseKpiCatalog.mockReturnValue({
      status: 'error',
      items: [],
      sourceLabel: 'KPI catalog',
      hasPartialData: false,
      notes: ['feed failure'],
      reload: jest.fn()
    });

    const markup = renderToStaticMarkup(<KpiMiniCardsContent {...buildProps()} />);

    expect(markup).toContain('No se han podido cargar los KPIs');
    expect(markup).toContain('feed failure');
    expect(markup).toContain('Reintentar');
  });
});
