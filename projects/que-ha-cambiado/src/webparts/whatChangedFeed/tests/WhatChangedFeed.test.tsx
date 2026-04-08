jest.mock('WhatChangedFeedWebPartStrings', () => ({
  LoadingMessage: 'Cargando',
  ErrorMessage: 'Error',
  EmptyMessage: 'Vacío',
  PartialDataMessage: 'Parcial',
  RetryButtonLabel: 'Reintentar',
  OpenItemButton: 'Abrir elemento',
  UpdatedBadgeLabel: 'Actualizado',
  PartialBadgeLabel: 'Parcial',
  ChangedAtLabel: 'Fecha',
  ResultsCounterLabel: 'elementos',
  MissingSummaryLabel: 'Sin resumen',
  MissingLinkLabel: 'Sin enlace',
  AllTypesLabel: 'Todos',
  ErrorBoundaryTitle: 'Error',
  ErrorBoundaryMessage: 'Mensaje de error'
}), { virtual: true });

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { IWhatChangedFeedConfiguration, IWhatChangedFeedService } from '../models/whatChangedFeedModels';
import WhatChangedFeed from '../components/WhatChangedFeed';

describe('WhatChangedFeed', () => {
  let container: HTMLDivElement;

  const configuration: IWhatChangedFeedConfiguration = {
    title: 'Qué ha cambiado',
    description: 'Feed de cambios.',
    sourceKind: 'list',
    listTitleOrUrl: 'Recent Changes',
    defaultTypeFilter: '',
    maxItems: 5
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders loaded changes', async () => {
    const service: IWhatChangedFeedService = {
      load: async () => ({
        status: 'ready',
        hasPartialData: false,
        items: [
          {
            id: '1',
            title: 'Nueva política',
            type: 'Policy',
            changedAt: '2026-04-08T09:00:00.000Z',
            summary: 'Se actualizó.',
            openUrl: 'https://contoso.sharepoint.com/a',
            featured: true
          }
        ]
      })
    };

    await act(async () => {
      ReactDOM.render(
        <WhatChangedFeed
          configuration={configuration}
          service={service}
          environmentMessage=""
          hasTeamsContext={false}
          isDarkTheme={false}
          localeName="es-ES"
          userDisplayName="Ada"
        />,
        container
      );
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Qué ha cambiado');
    expect(container.textContent).toContain('Nueva política');
    expect(container.textContent).toContain('Abrir elemento');
  });
});
