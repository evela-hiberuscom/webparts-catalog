import { QuickActionsService } from './quickActionsService';

describe('QuickActionsService', () => {
  it('sorts, filters and flags partial data', async () => {
    const repository = {
      load: jest.fn().mockResolvedValue({
        items: [
          {
            id: 'b',
            title: 'B',
            description: 'Desc',
            category: 'Operaciones',
            icon: 'Page',
            priority: 2,
            openUrl: '/b'
          },
          {
            id: 'a',
            title: 'A',
            description: 'Desc',
            category: 'Operaciones',
            icon: 'Page',
            priority: 1,
            openUrl: undefined
          }
        ],
        sourceLabel: 'StaticConfig',
        hasPartialData: false,
        notes: []
      })
    };
    const service = new QuickActionsService(repository as never);

    const viewModel = await service.load({
      title: 'Centro de acciones rápidas',
      subtitle: 'Accesos corporativos más usados',
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: '',
      jsonUrl: '',
      staticActionsJson: '',
      defaultCategory: 'Operaciones',
      maxItems: 12,
      webUrl: 'https://contoso.sharepoint.com/sites/intranet',
      userDisplayName: 'Ada Lovelace'
    });

    expect(viewModel.items[0].title).toBe('A');
    expect(viewModel.selectedCategory).toBe('Operaciones');
    expect(viewModel.visibleItems).toHaveLength(2);
    expect(viewModel.status).toBe('partialData');
    expect(viewModel.hasPartialData).toBe(true);
  });

  it('returns empty when no items are available', async () => {
    const repository = {
      load: jest.fn().mockResolvedValue({
        items: [],
        sourceLabel: 'StaticConfig',
        hasPartialData: false,
        notes: []
      })
    };
    const service = new QuickActionsService(repository as never);

    const viewModel = await service.load({
      title: 'Centro de acciones rápidas',
      subtitle: 'Accesos corporativos más usados',
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: '',
      jsonUrl: '',
      staticActionsJson: '',
      defaultCategory: '',
      maxItems: 12,
      webUrl: 'https://contoso.sharepoint.com/sites/intranet',
      userDisplayName: 'Ada Lovelace'
    });

    expect(viewModel.status).toBe('empty');
    expect(viewModel.visibleItems).toHaveLength(0);
  });

  it('surfaces repository errors', async () => {
    const repository = {
      load: jest.fn().mockRejectedValue(new Error('boom'))
    };
    const service = new QuickActionsService(repository as never);

    const viewModel = await service.load({
      title: 'Centro de acciones rápidas',
      subtitle: 'Accesos corporativos más usados',
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: '',
      jsonUrl: '',
      staticActionsJson: '',
      defaultCategory: '',
      maxItems: 12,
      webUrl: 'https://contoso.sharepoint.com/sites/intranet',
      userDisplayName: 'Ada Lovelace'
    });

    expect(viewModel.status).toBe('error');
    expect(viewModel.errorMessage).toBe('boom');
  });
});
