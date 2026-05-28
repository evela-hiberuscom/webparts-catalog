jest.mock('UpcomingMilestonesWebPartStrings', () => ({
  LoadingMessage: 'Cargando hitos',
  ErrorMessage: 'No se han podido cargar los hitos.',
  EmptyMessage: 'No hay hitos próximos configurados.',
  PartialDataMessage: 'Parcial',
  RetryButtonLabel: 'Reintentar',
  OpenMilestoneButton: 'Abrir detalle',
  InformationalLabel: 'Informativo',
  SoonBadgeLabel: 'Próximo',
  PartialBadgeLabel: 'Parcial',
  ResultsCounterLabel: 'hitos',
  ViewModePillLabel: 'Vista:',
  ViewModeTimelineLabel: 'Timeline',
  ViewModeListLabel: 'Lista',
  DateMissingLabel: 'Sin fecha',
  TypeMissingLabel: 'Sin tipo',
  TimelineAriaLabel: 'Timeline',
  ListAriaLabel: 'Lista',
  ErrorBoundaryTitle: 'Error',
  ErrorBoundaryMessage: 'Mensaje de error'
}), { virtual: true });

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { IUpcomingMilestonesConfiguration, IUpcomingMilestonesService } from '../models/upcomingMilestonesModels';
import UpcomingMilestones from '../components/UpcomingMilestones';

describe('UpcomingMilestones', () => {
  let container: HTMLDivElement;

  const configuration: IUpcomingMilestonesConfiguration = {
    title: 'Próximos hitos',
    description: 'Timeline del trimestre.',
    listTitleOrUrl: 'MilestonesList',
    maxItems: 5,
    viewMode: 'timeline'
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders milestone items in ready state', async () => {
    const service: IUpcomingMilestonesService = {
      load: async () => ({
        status: 'ready',
        hasPartialData: false,
        items: [
          {
            id: '1',
            title: 'Cierre Q2',
            date: '2026-04-10T09:00:00.000Z',
            type: 'Finance',
            detailUrl: 'https://contoso.sharepoint.com/sites/finance/q2'
          }
        ]
      })
    };

    await act(async () => {
      ReactDOM.render(
        <UpcomingMilestones
          configuration={configuration}
          service={service}
          environmentMessage=""
          localeName="es-ES"
        />,
        container
      );
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Próximos hitos');
    expect(container.textContent).toContain('Cierre Q2');
    expect(container.textContent).toContain('Abrir detalle');
  });
});
