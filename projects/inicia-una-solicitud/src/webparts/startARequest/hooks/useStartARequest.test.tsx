/* eslint-disable @rushstack/pair-react-dom-render-unmount */

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { StartARequestProvider } from '../contexts/StartARequestContext';
import type { IStartARequestViewModel } from '../models/startARequestModels';
import { useStartARequest } from './useStartARequest';

function flush(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

describe('useStartARequest', () => {
  it('loads items and updates the active category', async () => {
    const service = {
      resolve: jest.fn(async () => ({
        status: 'ready',
        activeCategory: 'all',
        items: [
          {
            id: '1',
            title: 'Solicitar vacaciones',
            category: 'RRHH',
            audience: 'Empleado',
            description: 'Inicia una solicitud',
            prerequisites: 'Revisa el saldo',
            featured: true,
            order: 1,
            actionable: true,
            partialData: false
          },
          {
            id: '2',
            title: 'Pedir material',
            category: 'Operaciones',
            audience: 'Empleado',
            description: 'Solicita material',
            featured: false,
            order: 2,
            actionable: true,
            partialData: false
          }
        ],
        filteredItems: [],
        categories: ['Operaciones', 'RRHH'],
        sourceLabel: 'SharePointList',
        notes: [],
        hasPartialData: false
      }))
    };

    let latest: IStartARequestViewModel | undefined;

    function Probe(): React.ReactElement | null {
      latest = useStartARequest({
        title: 'Inicia una solicitud',
        subtitle: 'Launcher',
        dataSourceType: 'SharePointList',
        listTitleOrUrl: 'RequestsCatalogList',
        defaultCategory: '',
        showPrerequisites: true,
        webUrl: 'https://contoso.sharepoint.com/sites/hr'
      });
      return null;
    }

    const container = document.createElement('div');
    document.body.appendChild(container);

    await act(async () => {
      ReactDOM.render(
        <StartARequestProvider service={service as never}>
          <Probe />
        </StartARequestProvider>,
        container
      );
      await flush();
    });

    expect(service.resolve).toHaveBeenCalledTimes(1);
    expect(latest?.status).toBe('ready');
    expect(latest?.filteredItems).toHaveLength(2);

    await act(async () => {
      latest?.setActiveCategory('RRHH');
      await flush();
    });

    expect(latest?.filteredItems).toHaveLength(1);
    expect(latest?.filteredItems[0].title).toBe('Solicitar vacaciones');

    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });
});
