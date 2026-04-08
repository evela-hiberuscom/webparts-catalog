jest.mock('SmartFaqWebPartStrings', () => ({
  SearchPlaceholder: 'Buscar',
  SearchEnabledLabel: 'Búsqueda activa',
  SearchDisabledLabel: 'Búsqueda desactivada',
  CategoryFilterLabel: 'Categoría',
  AllCategoriesLabel: 'Todas',
  LoadingMessage: 'Cargando',
  ErrorMessage: 'Error',
  EmptyMessage: 'Vacío',
  PartialDataMessage: 'Parcial',
  RetryButtonLabel: 'Reintentar',
  ExpandButtonLabel: 'Expandir',
  CollapseButtonLabel: 'Contraer',
  RelatedLinkLabel: 'Abrir recurso relacionado',
  AliasesLabel: 'Alias',
  CategoryLabel: 'Categoría',
  UpdatedAtLabel: 'Actualizada',
  FeaturedBadgeLabel: 'Destacada',
  PartialBadgeLabel: 'Parcial',
  ResultsCounterLabel: 'FAQs',
  ErrorBoundaryTitle: 'Error',
  ErrorBoundaryMessage: 'Mensaje de error'
}), { virtual: true });

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { ISmartFaqConfiguration, ISmartFaqService } from '../models/smartFaqModels';
import SmartFaq from '../components/SmartFaq';

describe('SmartFaq', () => {
  let container: HTMLDivElement;

  const configuration: ISmartFaqConfiguration = {
    title: 'FAQ inteligente',
    description: 'Soporte ligero.',
    listTitleOrUrl: 'FAQ',
    defaultCategory: 'General',
    enableSearch: true,
    maxItems: 50
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders loaded FAQs', async () => {
    const service: ISmartFaqService = {
      load: async () => ({
        status: 'ready',
        hasPartialData: false,
        categories: ['HR'],
        items: [
          {
            id: '1',
            question: 'Cómo pedir vacaciones',
            answer: 'Usa el portal de RRHH.',
            category: 'HR',
            aliases: ['vacaciones'],
            relatedUrl: 'https://contoso.sharepoint.com/vacaciones',
            updatedAt: '2026-04-08T09:00:00.000Z',
            isFeatured: true
          }
        ]
      })
    };

    await act(async () => {
      ReactDOM.render(
        <SmartFaq
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

    const toggleButton = container.querySelector('button');
    await act(async () => {
      toggleButton?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
      await Promise.resolve();
    });

    expect(container.textContent).toContain('FAQ inteligente');
    expect(container.textContent).toContain('Cómo pedir vacaciones');
    expect(container.textContent).toContain('Abrir recurso relacionado');
  });
});
