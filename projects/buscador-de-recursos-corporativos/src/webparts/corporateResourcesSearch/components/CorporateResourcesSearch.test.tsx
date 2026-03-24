jest.mock('../hooks/useCorporateResourcesSearch', () => ({
  useCorporateResourcesSearch: jest.fn()
}));

import * as React from 'react';
import ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import CorporateResourcesSearch from './CorporateResourcesSearch';

const mockedUseCorporateResourcesSearch = jest.requireMock('../hooks/useCorporateResourcesSearch')
  .useCorporateResourcesSearch as jest.Mock;

describe('CorporateResourcesSearch', () => {
  it('renders search controls and results', () => {
    mockedUseCorporateResourcesSearch.mockReturnValue({
      status: 'ready',
      query: '',
      items: [],
      featuredItems: [],
      filteredItems: [
        {
          id: '1',
          title: 'Política de vacaciones',
          resourceType: 'Policy',
          category: 'RRHH',
          summary: 'Documento oficial',
          openUrl: '/sites/hr/politicas/vacaciones',
          isExactMatch: true,
          isFeatured: true,
          sourceType: 'SharePointList',
          sourceLabel: 'SharePointList',
          keywords: ['vacaciones']
        }
      ],
      facets: {
        resourceTypes: [{ label: 'Policy', value: 'policy', count: 1 }],
        categories: [{ label: 'RRHH', value: 'rrhh', count: 1 }]
      },
      filters: { resourceType: '', category: '' },
      sourceLabel: 'SharePointList',
      hasPartialData: false,
      errorMessage: undefined,
      setQuery: jest.fn(),
      setResourceType: jest.fn(),
      setCategory: jest.fn(),
      refresh: jest.fn()
    });

    const container = document.createElement('div');

    act(() => {
      ReactDom.render(
        <CorporateResourcesSearch
          title="Buscador de recursos corporativos"
          subtitle="Encuentra políticas y manuales"
          dataSourceTypesCsv="SearchAPI,SharePointList"
          listTitleOrUrl="Resources"
          searchScopeUrl=""
          showFeaturedWhenEmpty={true}
          maxItems={10}
          webUrl="https://contoso.sharepoint.com/sites/portal"
          isDarkTheme={false}
          hasTeamsContext={false}
          userDisplayName="Ada Lovelace"
        />,
        container
      );
    });

    expect(container.textContent).toContain('Buscador de recursos corporativos');
    expect(container.textContent).toContain('Política de vacaciones');
    expect(container.textContent).toContain('Ada Lovelace');

    act(() => {
      ReactDom.unmountComponentAtNode(container);
    });
  });
});
