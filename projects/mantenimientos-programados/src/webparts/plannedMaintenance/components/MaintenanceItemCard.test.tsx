jest.mock(
  'PlannedMaintenanceWebPartStrings',
  () => ({
    StatusUpcoming: 'Proximo',
    StatusInProgress: 'En curso',
    StatusCompleted: 'Completado',
    StatusUnknown: 'Pendiente',
    ImpactLow: 'Impacto bajo',
    ImpactMedium: 'Impacto medio',
    ImpactHigh: 'Impacto alto',
    ImpactUnknown: 'Impacto pendiente',
    ServicesLabel: 'Servicios afectados',
    NoServicesLabel: 'Sin servicios informados',
    DetailButtonLabel: 'Abrir detalle',
    PartialBadgeLabel: 'Parcial',
    UnknownDateLabel: 'Fecha pendiente'
  }),
  { virtual: true }
);

import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { MaintenanceItemCard } from './MaintenanceItemCard';

describe('MaintenanceItemCard', () => {
  it('renders title, status and detail link', () => {
    const markup = renderToStaticMarkup(
      <MaintenanceItemCard
        item={{
          id: '1',
          title: 'ERP',
          startAt: '2026-03-31T10:00:00Z',
          endAt: '2026-03-31T11:00:00Z',
          impact: 'high',
          services: ['ERP'],
          detailUrl: '/sites/demo/maintenance/erp',
          status: 'upcoming',
          partialData: false
        }}
        localeName="es-ES"
      />
    );

    expect(markup).toContain('ERP');
    expect(markup).toContain('Abrir detalle');
    expect(markup).toContain('Proximo');
  });
});
