jest.mock('CorporateGlossaryWebPartStrings', () => ({
  LoadingMessage: 'Cargando glosario',
  ErrorMessage: 'No se ha podido cargar el glosario.',
  EmptyMessage: 'No hay términos disponibles.',
  PartialDataMessage: 'Parcial',
  RetryButtonLabel: 'Reintentar',
  FeaturedBadgeLabel: 'Destacado',
  PartialBadgeLabel: 'Parcial',
  ResultsCounterLabel: 'términos',
  UpdatedAtLabel: 'Actualizado',
  OpenReferenceButton: 'Abrir referencia',
  MissingReferenceLabel: 'Sin enlace',
  SearchPlaceholder: 'Buscar',
  SearchAriaLabel: 'Buscar términos',
  CategoryFilterLabel: 'Categoría',
  AllCategoriesLabel: 'Todas las categorías',
  AllLettersLabel: 'Todas',
  AlphabetNavLabel: 'Navegación alfabética',
  ErrorBoundaryTitle: 'Error',
  ErrorBoundaryMessage: 'Mensaje de error'
}), { virtual: true });

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { ICorporateGlossaryConfiguration, ICorporateGlossaryService } from '../models/corporateGlossaryModels';
import CorporateGlossary from '../components/CorporateGlossary';

describe('CorporateGlossary', () => {
  let container: HTMLDivElement;

  const configuration: ICorporateGlossaryConfiguration = {
    title: 'Glosario corporativo',
    description: 'Términos internos.',
    listTitle: 'Glossary',
    defaultCategory: 'General',
    maxItems: 50,
    enableAlphabetNav: true
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders glossary items and filters', async () => {
    const service: ICorporateGlossaryService = {
      load: async () => ({
        status: 'ready',
        hasPartialData: false,
        categories: ['IT'],
        letters: ['A'],
        items: [
          {
            id: '1',
            title: 'API',
            definition: 'Interfaz',
            aliases: ['Plataforma'],
            category: 'IT',
            relatedUrl: 'https://contoso.sharepoint.com/api',
            featured: true,
            partialData: false
          }
        ]
      })
    };

    await act(async () => {
      ReactDOM.render(
        <CorporateGlossary
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

    expect(container.textContent).toContain('Glosario corporativo');
    expect(container.textContent).toContain('API');
    expect(container.textContent).toContain('Abrir referencia');
  });
});
