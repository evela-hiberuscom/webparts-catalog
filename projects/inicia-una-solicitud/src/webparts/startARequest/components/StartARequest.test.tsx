jest.mock('StartARequestWebPartStrings', () => jest.requireActual('../testSupport/mockStartARequestStrings').mockStartARequestStrings, {
  virtual: true
});

jest.mock('../hooks/useStartARequest', () => ({
  useStartARequest: jest.fn()
}));

import * as React from 'react';
import ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { StartARequest } from './StartARequest';

const mockedHook = jest.requireMock('../hooks/useStartARequest').useStartARequest as jest.Mock;

describe('StartARequest', () => {
  it('renders request cards and filter labels', () => {
    mockedHook.mockReturnValue({
      status: 'ready',
      activeCategory: 'all',
      items: [],
      filteredItems: [
        {
          id: '1',
          title: 'Solicitar vacaciones',
          category: 'RRHH',
          audience: 'Empleado',
          description: 'Inicia una solicitud de vacaciones',
          prerequisites: 'Comprueba el saldo',
          startUrl: '/sites/hr/requests/vacaciones',
          featured: true,
          order: 1,
          actionable: true,
          partialData: false,
          startLink: {
            href: 'https://contoso.sharepoint.com/sites/hr/requests/vacaciones',
            external: false
          }
        }
      ],
      categories: ['RRHH'],
      sourceLabel: 'SharePointList',
      notes: [],
      hasPartialData: false,
      setActiveCategory: jest.fn(),
      refresh: jest.fn()
    });

    const container = document.createElement('div');

    act(() => {
      ReactDOM.render(
        <StartARequest
          title="Inicia una solicitud"
          subtitle="Launcher"
          webUrl="https://contoso.sharepoint.com/sites/hr"
          dataSourceType="SharePointList"
          listTitleOrUrl="RequestsCatalogList"
          defaultCategory=""
          showPrerequisites={true}
        />,
        container
      );
    });

    expect(container.textContent).toContain('Inicia una solicitud');
    expect(container.textContent).toContain('Solicitar vacaciones');
    expect(container.textContent).toContain('RRHH');

    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
  });
});
