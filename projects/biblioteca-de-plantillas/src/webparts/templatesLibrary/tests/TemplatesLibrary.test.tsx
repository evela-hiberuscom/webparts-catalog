jest.mock('TemplatesLibraryWebPartStrings', () => ({
  SearchPlaceholder: 'Buscar',
  CategoryFilterLabel: 'Categoría',
  TypeFilterLabel: 'Tipo',
  AllCategoriesLabel: 'Todas las categorías',
  AllTypesLabel: 'Todos los tipos',
  LoadingMessage: 'Cargando',
  ErrorMessage: 'Error',
  EmptyMessage: 'Vacío',
  PartialDataMessage: 'Parcial',
  RetryButtonLabel: 'Reintentar',
  OpenTemplateButton: 'Abrir plantilla',
  DownloadTemplateButton: 'Descargar',
  MissingActionLabel: 'Sin acción',
  FeaturedBadgeLabel: 'Destacada',
  PartialBadgeLabel: 'Parcial',
  UpdatedAtLabel: 'Actualizada',
  ResultsCounterLabel: 'plantillas',
  ErrorBoundaryTitle: 'Error',
  ErrorBoundaryMessage: 'Mensaje'
}), { virtual: true });

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { ITemplatesLibraryConfiguration, ITemplatesLibraryService } from '../models/templatesLibraryModels';
import TemplatesLibrary from '../components/TemplatesLibrary';

describe('TemplatesLibrary', () => {
  let container: HTMLDivElement;

  const configuration: ITemplatesLibraryConfiguration = {
    title: 'Biblioteca de plantillas',
    description: 'Catálogo oficial',
    sourceKind: 'library',
    listTitleOrUrl: 'Plantillas',
    defaultCategory: 'General',
    maxItems: 10
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders template cards', async () => {
    const service: ITemplatesLibraryService = {
      load: async () => ({
        status: 'ready',
        hasPartialData: false,
        categories: ['Ventas'],
        types: ['PowerPoint'],
        items: [
          {
            id: '1',
            title: 'Plantilla Comercial',
            templateType: 'PowerPoint',
            category: 'Ventas',
            updatedAt: '2026-04-08T09:00:00.000Z',
            openUrl: 'https://contoso.sharepoint.com/file.pptx',
            downloadUrl: 'https://contoso.sharepoint.com/file.pptx?download=1',
            featured: true
          }
        ]
      })
    };

    await act(async () => {
      ReactDOM.render(
        <TemplatesLibrary
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

    expect(container.textContent).toContain('Biblioteca de plantillas');
    expect(container.textContent).toContain('Plantilla Comercial');
    expect(container.textContent).toContain('Abrir plantilla');
  });
});
