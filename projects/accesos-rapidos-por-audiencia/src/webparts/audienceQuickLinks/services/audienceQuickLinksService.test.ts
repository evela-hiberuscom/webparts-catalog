jest.mock('@microsoft/sp-http', () => ({
  SPHttpClient: {
    configurations: {
      v1: {}
    }
  }
}));

import { AudienceQuickLinksService } from './audienceQuickLinksService';
import type {
  IAudienceLinkRepositoryResult,
  IAudienceQuickLinksHostContext,
  IAudienceQuickLinksLabels,
  IUserContextResult
} from '../models/audienceLinkModels';

const DEFAULT_TEST_LABELS: IAudienceQuickLinksLabels = {
  allCategoriesLabel: 'Todas',
  defaultWebPartTitle: 'Accesos rápidos',
  loadingCatalogLabel: 'Cargando catálogo...',
  loadingAudienceLabel: 'Resolviendo audiencia...',
  noDataSourceLabel: 'Sin origen de datos configurado',
  couldNotResolveAudienceLabel: 'No se ha podido resolver la audiencia',
  audienceGeneralLabel: 'Audiencia general',
  audienceHybridPrefix: 'Audiencia híbrida',
  audienceNamedPrefix: 'Audiencia'
};

const hostContext: IAudienceQuickLinksHostContext = {
  spHttpClient: {} as never,
  webUrl: 'https://contoso.sharepoint.com/sites/intranet',
  siteUrl: 'https://contoso.sharepoint.com/sites/intranet',
  userDisplayName: 'Ada Lovelace',
  userEmail: 'ada@contoso.com',
  userLoginName: 'i:0#.f|membership|ada@contoso.com',
  localeName: 'es-ES'
};

const linkSource: IAudienceLinkRepositoryResult = {
  items: [
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
    },
    {
      id: 'sales',
      title: 'Canal comercial',
      category: 'Comercial',
      iconName: 'BarChartVertical',
      description: 'Acceso comercial',
      openUrl: '/sites/sales',
      audiences: ['sales'],
      isGeneric: false,
      priority: 2,
      sourceBadge: 'personalizado'
    }
  ],
  sourceLabel: 'Catálogo de prueba',
  hasPartialData: false,
  notes: ['observado: catálogo fake para tests']
};

const userContext: IUserContextResult = {
  displayName: 'Ada Lovelace',
  email: 'ada@contoso.com',
  loginName: 'i:0#.f|membership|ada@contoso.com',
  localeName: 'es-ES',
  sourceLabel: 'Perfil fake',
  hasPartialData: false,
  notes: ['observado: contexto fake para tests'],
  tokens: {
    departmentTokens: ['sales'],
    countryTokens: ['es'],
    groupTokens: ['sales'],
    roleTokens: ['manager'],
    fallbackTokens: ['ada', 'lovelace'],
    allTokens: ['sales', 'es', 'manager', 'ada', 'lovelace']
  }
};

describe('AudienceQuickLinksService', () => {
  it('resolves matching items and keeps category filters working', async () => {
    const service = new AudienceQuickLinksService({
      linksRepository: {
        load: jest.fn().mockResolvedValue(linkSource)
      },
      userContextRepository: {
        load: jest.fn().mockResolvedValue(userContext)
      }
    });

    const model = await service.load({
      webPartProps: {
        title: 'Accesos rápidos por audiencia',
        description: 'Descripción',
        dataSourceType: 'StaticConfig',
        listTitleOrUrl: '',
        audienceMode: 'group',
        defaultCategory: 'General',
        maxItems: 12,
        showAudienceHint: true
      },
      hostContext,
      labels: DEFAULT_TEST_LABELS
    });

    expect(model.state).toBe('ready');
    expect(model.selectedCategory).toBe('Todas');
    expect(model.visibleItems).toHaveLength(1);
    expect(model.visibleItems[0].title).toBe('Canal comercial');
    expect(model.categories).toContain('Comercial');
  });

  it('marks partial data when only fallback links are available', async () => {
    const service = new AudienceQuickLinksService({
      linksRepository: {
        load: jest.fn().mockResolvedValue({
          ...linkSource,
          items: [linkSource.items[0]],
          hasPartialData: true
        })
      },
      userContextRepository: {
        load: jest.fn().mockResolvedValue({
          ...userContext,
          tokens: {
            ...userContext.tokens,
            allTokens: ['unknown']
          }
        })
      }
    });

    const model = await service.load({
      webPartProps: {
        title: 'Accesos rápidos por audiencia',
        description: 'Descripción',
        dataSourceType: 'StaticConfig',
        listTitleOrUrl: '',
        audienceMode: 'group',
        defaultCategory: 'General',
        maxItems: 12,
        showAudienceHint: true
      },
      hostContext,
      labels: DEFAULT_TEST_LABELS
    });

    expect(model.state).toBe('partialData');
    expect(model.hasPartialData).toBe(true);
  });

  it('returns an empty state when repositories resolve without links', async () => {
    const service = new AudienceQuickLinksService({
      linksRepository: {
        load: jest.fn().mockResolvedValue({
          items: [],
          sourceLabel: 'Catálogo vacío',
          hasPartialData: false,
          notes: ['observado: no hay registros']
        })
      },
      userContextRepository: {
        load: jest.fn().mockResolvedValue(userContext)
      }
    });

    const model = await service.load({
      webPartProps: {
        title: 'Accesos rápidos por audiencia',
        description: 'Descripción',
        dataSourceType: 'StaticConfig',
        listTitleOrUrl: '',
        audienceMode: 'group',
        defaultCategory: 'General',
        maxItems: 12,
        showAudienceHint: true
      },
      hostContext,
      labels: DEFAULT_TEST_LABELS
    });

    expect(model.state).toBe('empty');
    expect(model.visibleItems).toHaveLength(0);
    expect(model.hasPartialData).toBe(false);
  });
});
