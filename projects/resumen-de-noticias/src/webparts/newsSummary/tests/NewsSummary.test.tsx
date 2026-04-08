jest.mock('NewsSummaryWebPartStrings', () => ({
  LoadingMessage: 'Cargando noticias',
  ErrorMessage: 'No se han podido cargar las noticias publicadas.',
  EmptyMessage: 'No hay noticias disponibles.',
  PartialDataMessage: 'Parcial',
  RetryButtonLabel: 'Reintentar',
  OpenNewsButton: 'Abrir noticia',
  FeaturedBadgeLabel: 'Destacada',
  PartialBadgeLabel: 'Parcial',
  PublishedOnLabel: 'Publicado',
  ResultsCounterLabel: 'noticias',
  MissingSummaryLabel: 'Sin resumen',
  MissingLinkLabel: 'Sin enlace',
  ErrorBoundaryTitle: 'Error',
  ErrorBoundaryMessage: 'Mensaje de error'
}), { virtual: true });

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { INewsSummaryConfiguration, INewsSummaryService } from '../models/newsSummaryModels';
import NewsSummary from '../components/NewsSummary';

describe('NewsSummary', () => {
  let container: HTMLDivElement;

  const configuration: INewsSummaryConfiguration = {
    title: 'Resumen de noticias',
    description: 'Pulso editorial.',
    sitePagesListTitle: 'Site Pages',
    maxItems: 4,
    featuredFirst: true
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders loaded news cards', async () => {
    const service: INewsSummaryService = {
      load: async () => ({
        status: 'ready',
        hasPartialData: false,
        items: [
          {
            id: '1',
            title: 'Nueva política',
            summary: 'Resumen',
            publishedAt: '2026-04-08T09:00:00.000Z',
            imageUrl: 'https://contoso.sharepoint.com/image.jpg',
            openUrl: 'https://contoso.sharepoint.com/news/1',
            isFeatured: true
          }
        ]
      })
    };

    await act(async () => {
      ReactDOM.render(
        <NewsSummary
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

    expect(container.textContent).toContain('Resumen de noticias');
    expect(container.textContent).toContain('Nueva política');
    expect(container.textContent).toContain('Abrir noticia');
  });
});
