import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import type { IQuickActionsRequest } from '../models/quickActionsModels';
import { useQuickActions } from './useQuickActions';

function TestHarness(props: {
  service: { load: jest.Mock };
  request: IQuickActionsRequest;
  onRender: (value: ReturnType<typeof useQuickActions>) => void;
}): React.ReactElement {
  const value = useQuickActions(props.service as never, props.request);
  props.onRender(value);
  return React.createElement(React.Fragment);
}

describe('useQuickActions', () => {
  it('loads the view model and updates category selection', async () => {
    const service = {
      load: jest.fn().mockResolvedValue({
        status: 'ready',
        items: [
          {
            id: '1',
            title: 'Soporte',
            description: 'Abrir soporte',
            category: 'IT',
            icon: 'Headset',
            priority: 1,
            openUrl: '/support'
          },
          {
            id: '2',
            title: 'Formularios',
            description: 'Abrir formularios',
            category: 'Operaciones',
            icon: 'FormLibrary',
            priority: 2,
            openUrl: '/forms'
          }
        ],
        visibleItems: [],
        categories: ['IT', 'Operaciones'],
        selectedCategory: 'IT',
        sourceLabel: 'StaticConfig',
        hasPartialData: false
      })
    };

    const container = document.createElement('div');
    document.body.appendChild(container);
    const renders: Array<ReturnType<typeof useQuickActions>> = [];

    await act(async () => {
      ReactDom.render(
        React.createElement(TestHarness, {
          service,
          request: {
            title: 'Centro de acciones rápidas',
            subtitle: 'Accesos corporativos más usados',
            dataSourceType: 'StaticConfig',
            listTitleOrUrl: '',
            jsonUrl: '',
            staticActionsJson: '',
            defaultCategory: 'IT',
            maxItems: 12,
            webUrl: 'https://contoso.sharepoint.com/sites/intranet',
            userDisplayName: 'Ada Lovelace'
          },
          onRender: (value) => {
            renders.push(value);
          }
        }),
        container
      );
    });

    expect(service.load).toHaveBeenCalled();
    expect(renders[renders.length - 1].selectedCategory).toBe('IT');

    act(() => {
      renders[renders.length - 1].setSelectedCategory('Operaciones');
    });

    expect(renders[renders.length - 1].selectedCategory).toBe('Operaciones');
    expect(renders[renders.length - 1].visibleItems).toHaveLength(1);

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });
});
