import type { IWeeklyHighlight, IWeeklySummaryRequest, IWeeklySummarySourceRepository } from '../models/weeklySummaryTypes';
import { addDays, startOfWeek, toDateKey } from '../utils/weeklySummaryUtils';

function makeDate(referenceDate: Date, daysFromStartOfWeek: number): string {
  return toDateKey(addDays(startOfWeek(referenceDate), daysFromStartOfWeek)) ?? '';
}

export class StaticSummarySourceRepository implements IWeeklySummarySourceRepository {
  public async loadHighlights(request: IWeeklySummaryRequest): Promise<IWeeklyHighlight[]> {
    const referenceDate = request.referenceDate ?? new Date();

    return Promise.resolve([
      {
        id: 'news-01',
        title: 'Nueva politica de gastos publicada',
        highlightType: 'news',
        date: makeDate(referenceDate, 0),
        openUrl: '/sites/comms/news/politica-gastos',
        priority: 5,
        sourceName: 'News',
        summary: 'La comunicacion semanal recoge el nuevo flujo para aprobar y registrar gastos.'
      },
      {
        id: 'milestone-01',
        title: 'Se cierra la planificacion de la semana',
        highlightType: 'milestone',
        date: makeDate(referenceDate, 1),
        openUrl: '/sites/pmo/milestones/planificacion',
        priority: 4,
        sourceName: 'Milestones',
        summary: 'Quedan fijados los hitos visibles y los bloqueos principales por equipo.'
      },
      {
        id: 'incident-01',
        title: 'Incidencia del buscador resuelta',
        highlightType: 'incident',
        date: makeDate(referenceDate, 2),
        openUrl: '/sites/it/incidents/buscador',
        priority: 3,
        sourceName: 'Incidents',
        summary: 'El buscador corporativo ya responde sin degradacion y con resultados completos.'
      },
      {
        id: 'news-02',
        title: 'Se publica el resumen de operaciones',
        highlightType: 'news',
        date: makeDate(referenceDate, 3),
        openUrl: '/sites/comms/news/operaciones',
        priority: 2,
        sourceName: 'News',
        summary: 'El area de operaciones comparte los cambios relevantes de la semana.'
      },
      {
        id: 'milestone-02',
        title: 'Cierre del sprint de integracion',
        highlightType: 'milestone',
        date: makeDate(referenceDate, -8),
        openUrl: '/sites/pmo/milestones/sprint-integracion',
        priority: 1,
        sourceName: 'Milestones',
        summary: 'Elemento fuera de la semana actual para validar el filtrado por rango.'
      },
      {
        id: 'incident-02',
        title: 'Aviso de mantenimiento programado',
        highlightType: 'incident',
        date: makeDate(referenceDate, 4),
        openUrl: undefined,
        priority: 1,
        sourceName: 'Incidents',
        summary: 'Elemento parcial sin enlace para probar el estado partialData.',
        isPartial: true
      }
    ]);
  }
}
