jest.mock('NewsByAreaWebPartStrings', () => ({
  LoadingMessage: 'Cargando noticias',
  ErrorMessage: 'No se han podido cargar las noticias del área.',
  EmptyMessage: 'No hay noticias disponibles para esta área.',
  PartialDataMessage: 'Parcial',
  RetryButtonLabel: 'Reintentar',
  OpenNewsButton: 'Abrir noticia',
  FeaturedBadgeLabel: 'Destacada',
  PartialBadgeLabel: 'Parcial',
  PublishedOnLabel: 'Publicado',
  ResultsCounterLabel: 'noticias',
  MissingSummaryLabel: 'Sin resumen',
  MissingLinkLabel: 'Sin enlace',
  TagsLabel: 'Etiquetas',
  FilterLabel: 'Filtro:',
  ErrorBoundaryTitle: 'Error',
  ErrorBoundaryMessage: 'Mensaje de error'
}), { virtual: true });

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { INewsByAreaConfiguration, INewsByAreaService } from '../models/newsByAreaModels';
import NewsByArea from '../components/NewsByArea';

describe('NewsByArea', () => {
  let container: HTMLDivElement;

  const configuration: INewsByAreaConfiguration = {
    title: 'Noticias por área',
    description: 'Pulso de IT.',
    areaFilter: 'IT',
    sitePagesListTitle: 'Site Pages',
    maxItems: 4,
    showImage: true,
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

  it('renders loaded area news cards', async () => {
    const service: INewsByAreaService = {
      load: async () => ({
        status: 'ready',
        hasPartialData: false,
        items: [
          {
            id: '1',
            title: 'Nueva guardia IT',
            summary: 'Cobertura ampliada.',
            publishedAt: '2026-04-08T09:00:00.000Z',
            imageUrl: 'https://contoso.sharepoint.com/image.jpg',
            tags: ['IT'],
            openUrl: 'https://contoso.sharepoint.com/news/1',
            isFeatured: true
          }
        ]
      })
    };

    await act(async () => {
      ReactDOM.render(
        <NewsByArea
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

    expect(container.textContent).toContain('Noticias por área');
    expect(container.textContent).toContain('Nueva guardia IT');
    expect(container.textContent).toContain('Abrir noticia');
  });
});
