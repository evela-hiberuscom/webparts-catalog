jest.mock('../hooks/useQuickActions', () => ({
  useQuickActions: jest.fn()
}));

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import QuickActionsCenter from './QuickActionsCenter';

const { useQuickActions } = jest.requireMock('../hooks/useQuickActions') as {
  useQuickActions: jest.Mock;
};

describe('QuickActionsCenter', () => {
  afterEach(() => {
    useQuickActions.mockReset();
  });

  it('renders cards and the partial data banner', async () => {
    useQuickActions.mockReturnValue({
      status: 'partialData',
      items: [
        {
          id: '1',
          title: 'Soporte',
          description: 'Abrir soporte',
          category: 'IT',
          icon: 'Headset',
          priority: 1,
          openUrl: '/support'
        }
      ],
      visibleItems: [
        {
          id: '1',
          title: 'Soporte',
          description: 'Abrir soporte',
          category: 'IT',
          icon: 'Headset',
          priority: 1,
          openUrl: '/support'
        }
      ],
      categories: ['IT'],
      selectedCategory: 'IT',
      sourceLabel: 'StaticConfig',
      hasPartialData: true,
      setSelectedCategory: jest.fn()
    });

    const container = document.createElement('div');
    document.body.appendChild(container);

    act(() => {
      ReactDom.render(
        React.createElement(QuickActionsCenter, {
          title: 'Centro de acciones rápidas',
          subtitle: 'Accesos corporativos más usados',
          request: {
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
          },
          service: { load: jest.fn() } as never,
          isDarkTheme: false,
          environmentMessage: 'SharePoint',
          hasTeamsContext: false,
          userDisplayName: 'Ada Lovelace'
        }),
        container
      );
    });

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(container.textContent).toContain('Centro de acciones rápidas');
    expect(container.textContent).toContain('Soporte');
    expect(container.textContent).toContain('Algunas acciones no tienen todos los metadatos');

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });
});
