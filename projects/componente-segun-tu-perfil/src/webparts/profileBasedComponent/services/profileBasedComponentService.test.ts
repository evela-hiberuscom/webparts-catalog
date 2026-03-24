import { createProfileBasedComponentService } from './profileBasedComponentService';
import type { IProfileVariantRepository } from '../models/profileBasedComponentModels';

describe('profile based component service', () => {
  it('returns a ready state for matching variants', async () => {
    const repository: IProfileVariantRepository = {
      loadVariants: async () => [
        {
          id: 'generic',
          title: 'General',
          summary: 'General summary',
          audienceTokens: [],
          isGeneric: true,
          contentType: 'card',
          tags: [],
          payload: {}
        },
        {
          id: 'sales',
          title: 'Ventas',
          summary: 'Specific summary',
          body: 'Specific body',
          audienceTokens: ['sales'],
          isGeneric: false,
          contentType: 'card',
          tags: [],
          payload: {}
        }
      ]
    };

    const service = createProfileBasedComponentService(repository);
    const viewModel = await service.resolve(
      {
        siteUrl: 'https://contoso.sharepoint.com/sites/portal',
        title: 'Componente según tu perfil',
        description: 'Personaliza el contenido según la audiencia del usuario.',
        dataSourceType: 'StaticConfig',
        listTitleOrUrl: '',
        jsonUrl: '',
        staticConfigJson: '',
        audienceMode: 'hybrid',
        fallbackMode: 'generic',
        maxItems: 3
      },
      {
        siteUrl: 'https://contoso.sharepoint.com/sites/portal',
        displayName: 'Sales User',
        profileTokens: 'sales'
      }
    );

    expect(viewModel.state).toBe('ready');
    expect(viewModel.variant?.id).toBe('sales');
  });

  it('flags partial data when fallback is applied', async () => {
    const repository: IProfileVariantRepository = {
      loadVariants: async () => [
        {
          id: 'generic',
          title: 'General',
          summary: 'General summary',
          audienceTokens: [],
          isGeneric: true,
          contentType: 'card',
          tags: [],
          payload: {}
        }
      ]
    };

    const service = createProfileBasedComponentService(repository);
    const viewModel = await service.resolve(
      {
        siteUrl: 'https://contoso.sharepoint.com/sites/portal',
        title: 'Componente según tu perfil',
        description: 'Personaliza el contenido según la audiencia del usuario.',
        dataSourceType: 'StaticConfig',
        listTitleOrUrl: '',
        jsonUrl: '',
        staticConfigJson: '',
        audienceMode: 'hybrid',
        fallbackMode: 'generic',
        maxItems: 3
      },
      {
        siteUrl: 'https://contoso.sharepoint.com/sites/portal',
        displayName: 'Marketing User',
        profileTokens: 'marketing'
      }
    );

    expect(viewModel.state).toBe('partialData');
    expect(viewModel.fallbackApplied).toBe(true);
  });

  it('surfaces repository errors', async () => {
    const repository: IProfileVariantRepository = {
      loadVariants: async () => {
        throw new Error('boom');
      }
    };

    const service = createProfileBasedComponentService(repository);
    const viewModel = await service.resolve(
      {
        siteUrl: 'https://contoso.sharepoint.com/sites/portal',
        title: 'Componente según tu perfil',
        description: 'Personaliza el contenido según la audiencia del usuario.',
        dataSourceType: 'StaticConfig',
        listTitleOrUrl: '',
        jsonUrl: '',
        staticConfigJson: '',
        audienceMode: 'hybrid',
        fallbackMode: 'generic',
        maxItems: 3
      },
      {
        siteUrl: 'https://contoso.sharepoint.com/sites/portal',
        displayName: 'Marketing User'
      }
    );

    expect(viewModel.state).toBe('error');
    expect(viewModel.errorMessage).toContain('boom');
  });
});
