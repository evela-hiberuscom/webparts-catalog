import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { initializeIcons } from '@fluentui/react/lib/Icons';

import type { IAudienceQuickLinksHostContext, IAudienceQuickLinksViewModel } from '../models/audienceLinkModels';
import { AudienceQuickLinksView } from './AudienceQuickLinksView';

initializeIcons();

const hostContext: IAudienceQuickLinksHostContext = {
  spHttpClient: {} as never,
  webUrl: 'https://contoso.sharepoint.com/sites/intranet',
  siteUrl: 'https://contoso.sharepoint.com/sites/intranet',
  userDisplayName: 'Ada Lovelace',
  userEmail: 'ada@contoso.com',
  userLoginName: 'i:0#.f|membership|ada@contoso.com',
  localeName: 'es-ES'
};

const viewModel: IAudienceQuickLinksViewModel = {
  title: 'Accesos rápidos por audiencia',
  description: 'Descripción',
  sourceLabel: 'Catálogo de prueba',
  resolvedAudienceLabel: 'Audiencia group: sales',
  resolvedAudienceTokens: ['sales'],
  categories: ['Todas', 'General'],
  selectedCategory: 'Todas',
  allItems: [],
  visibleItems: [],
  hasPartialData: false,
  state: 'empty',
  notes: ['observado: test visual']
};

describe('AudienceQuickLinksView', () => {
  it('renders the title and the empty state', () => {
    const markup = renderToStaticMarkup(
      <AudienceQuickLinksView
        viewModel={viewModel}
        hostContext={hostContext}
        showAudienceHint={true}
        onRetry={() => undefined}
        onSelectCategory={() => undefined}
      />
    );

    expect(markup).toContain('Accesos rápidos por audiencia');
    expect(markup).toContain('No hay accesos disponibles para tu perfil.');
    expect(markup).toContain('Audiencia group: sales');
  });

  it('renders filters and a category-specific empty state when a filter removes all cards', () => {
    const filteredEmptyViewModel: IAudienceQuickLinksViewModel = {
      ...viewModel,
      categories: ['Todas', 'General', 'Comercial'],
      selectedCategory: 'Comercial',
      state: 'empty'
    };

    const markup = renderToStaticMarkup(
      <AudienceQuickLinksView
        viewModel={filteredEmptyViewModel}
        hostContext={hostContext}
        showAudienceHint={true}
        onRetry={() => undefined}
        onSelectCategory={() => undefined}
      />
    );

    expect(markup).toContain('Filtrar accesos por categoría');
    expect(markup).toContain('No hay accesos para esta categoría.');
  });

  it('renders partial data messaging alongside cards', () => {
    const partialViewModel: IAudienceQuickLinksViewModel = {
      ...viewModel,
      state: 'partialData',
      visibleItems: [
        {
          id: 'general',
          title: 'Portal general',
          category: 'General',
          iconName: 'Home',
          description: 'Acceso común',
          openUrl: '/sites/intranet',
          audiences: [],
          isGeneric: true,
          priority: 1,
          sourceBadge: 'genérico'
        }
      ],
      allItems: [
        {
          id: 'general',
          title: 'Portal general',
          category: 'General',
          iconName: 'Home',
          description: 'Acceso común',
          openUrl: '/sites/intranet',
          audiences: [],
          isGeneric: true,
          priority: 1,
          sourceBadge: 'genérico'
        }
      ]
    };

    const markup = renderToStaticMarkup(
      <AudienceQuickLinksView
        viewModel={partialViewModel}
        hostContext={hostContext}
        showAudienceHint={true}
        onRetry={() => undefined}
        onSelectCategory={() => undefined}
      />
    );

    expect(markup).toContain('Se han usado accesos de reserva.');
    expect(markup).toContain('Portal general');
  });
});
