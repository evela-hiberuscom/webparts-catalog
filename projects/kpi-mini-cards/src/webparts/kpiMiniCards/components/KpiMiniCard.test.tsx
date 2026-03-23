import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import KpiMiniCard from './KpiMiniCard';
import type { IKpiMiniCard } from '../models/kpiModels';

describe('KpiMiniCard', () => {
  it('renders the KPI content and the sanitized link', () => {
    const item: IKpiMiniCard = {
      id: 'coverage',
      label: 'Cobertura',
      value: 98,
      unit: '%',
      state: 'ok',
      trend: 'up',
      comparison: 'última ejecución',
      comparisonLabel: '',
      priority: 1,
      threshold: 95,
      thresholdDirection: 'above',
      badge: 'ok',
      description: 'Cobertura técnica del conjunto actual.',
      openInNewTab: false,
      safeLink: {
        href: '/sites/quality',
        target: '_self'
      },
      hasPartialData: false
    };

    const markup = renderToStaticMarkup(<KpiMiniCard item={item} showTrend />);

    expect(markup).toContain('Cobertura');
    expect(markup).toContain('Ver detalle');
    expect(markup).toContain('/sites/quality');
  });
});
