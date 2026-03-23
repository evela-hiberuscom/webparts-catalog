import { WeeklySummaryService } from '../services/WeeklySummaryService';
import type {
  IWeeklyHighlight,
  IWeeklySummaryRequest,
  IWeeklySummarySourceRepository
} from '../models/weeklySummaryTypes';

describe('WeeklySummaryService', () => {
  const referenceDate = new Date(2026, 2, 25, 12, 0, 0);

  function createRepository(items: IWeeklyHighlight[]): IWeeklySummarySourceRepository {
    return {
      loadHighlights: jest.fn().mockResolvedValue(items)
    };
  }

  it('filters, sorts and flags partial data', async () => {
    const repository = createRepository([
      {
        id: 'news-01',
        title: 'Prioridad media',
        highlightType: 'news',
        date: '2026-03-24',
        openUrl: '/news/01',
        priority: 2,
        sourceName: 'News'
      },
      {
        id: 'incident-01',
        title: 'Elemento parcial',
        highlightType: 'incident',
        date: '2026-03-25',
        openUrl: undefined,
        priority: 5,
        sourceName: 'Incidents'
      },
      {
        id: 'out-of-range',
        title: 'Fuera de rango',
        highlightType: 'milestone',
        date: '2026-04-04',
        openUrl: '/milestones/04',
        priority: 10,
        sourceName: 'Milestones'
      }
    ]);

    const service = new WeeklySummaryService(repository);
    const request: IWeeklySummaryRequest = {
      periodMode: 'currentWeek',
      maxItems: 10,
      referenceDate
    };

    const result = await service.loadSummary(request);

    expect((repository.loadHighlights as jest.Mock).mock.calls[0][0]).toEqual(request);
    expect(result.items.map((item) => item.id)).toEqual(['incident-01', 'news-01']);
    expect(result.status).toBe('partialData');
    expect(result.hasPartialData).toBe(true);
    expect(result.sourceCount).toBe(2);
    expect(result.periodLabel).toContain('Semana actual');
  });

  it('returns empty when nothing falls in range', async () => {
    const repository = createRepository([]);
    const service = new WeeklySummaryService(repository);

    const result = await service.loadSummary({
      periodMode: 'previousWeek',
      maxItems: 5,
      referenceDate
    });

    expect(result.items).toEqual([]);
    expect(result.status).toBe('empty');
    expect(result.sourceCount).toBe(0);
    expect(result.hasPartialData).toBe(false);
  });
});
