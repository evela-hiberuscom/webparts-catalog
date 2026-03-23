jest.mock('../hooks/useWeeklySummary', () => ({
  useWeeklySummary: jest.fn()
}));

import * as React from 'react';
import * as ReactDOMServer from 'react-dom/server';
import AutomaticWeeklySummary from '../components/AutomaticWeeklySummary';
import { useWeeklySummary } from '../hooks/useWeeklySummary';
import type { IAutomaticWeeklySummaryProps } from '../components/IAutomaticWeeklySummaryProps';
import type { IWeeklySummaryService } from '../models/weeklySummaryTypes';

const mockedUseWeeklySummary = useWeeklySummary as jest.MockedFunction<typeof useWeeklySummary>;

describe('AutomaticWeeklySummary', () => {
  const service = {
    loadSummary: jest.fn()
  } as unknown as IWeeklySummaryService;

  beforeEach(() => {
    mockedUseWeeklySummary.mockReturnValue({
      status: 'partialData',
      error: undefined,
      refresh: jest.fn(),
      result: {
        items: [
          {
            id: 'news-01',
            title: 'Semana cerrada',
            highlightType: 'news',
            date: '2026-03-24',
            openUrl: '/sites/comms/news/semana-cerrada',
            priority: 5,
            sourceName: 'News',
            summary: 'Se ha cerrado la semana con cambios visibles.'
          }
        ],
        periodLabel: 'Semana actual: 23 mar - 30 mar',
        hasPartialData: true,
        status: 'partialData',
        sourceCount: 1,
        range: {
          start: new Date(2026, 2, 23, 0, 0, 0),
          end: new Date(2026, 2, 30, 0, 0, 0),
          label: 'Semana actual: 23 mar - 30 mar',
          isCustom: false
        }
      }
    });
  });

  it('renders the weekly digest content', () => {
    const props: IAutomaticWeeklySummaryProps = {
      title: 'Resumen semanal automatico',
      subtitle: 'Sintetiza lo importante de la semana en un vistazo.',
      periodMode: 'currentWeek',
      maxItems: 6,
      service
    };

    const markup = ReactDOMServer.renderToStaticMarkup(React.createElement(AutomaticWeeklySummary, props));

    expect(markup).toContain('Resumen semanal automatico');
    expect(markup).toContain('Semana actual: 23 mar - 30 mar');
    expect(markup).toContain('1 elementos destacados');
    expect(markup).toContain('Hay elementos parciales');
    expect(markup).toContain('Semana cerrada');
    expect(markup).toContain('Abrir');
  });
});
