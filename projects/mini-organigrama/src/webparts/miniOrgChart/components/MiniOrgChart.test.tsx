jest.mock('@microsoft/sp-http', () => ({
  SPHttpClient: {
    configurations: {
      v1: {}
    }
  }
}), { virtual: true });

jest.mock('../hooks/useMiniOrgChart', () => ({
  useMiniOrgChart: () => ({
    isLoading: false,
    loadResult: {
      people: [
        {
          id: '1',
          displayName: 'Root Person',
          jobTitle: 'Director',
          profileUrl: 'https://contoso.sharepoint.com/sites/hr/person/1',
          reportIds: ['2'],
          sourceLabel: 'StaticConfig',
          isPartial: false
        },
        {
          id: '2',
          displayName: 'Direct Report',
          jobTitle: 'Manager',
          profileUrl: 'https://contoso.sharepoint.com/sites/hr/person/2',
          managerId: '1',
          reportIds: [],
          sourceLabel: 'StaticConfig',
          isPartial: true
        }
      ],
      sourceSummaries: [],
      warnings: ['partial'],
      errors: []
    },
    reload: jest.fn()
  })
}));

jest.mock('MiniOrgChartWebPartStrings', () => ({
  Title: 'Mini organigrama',
  SearchLabel: 'Search people',
  SearchPlaceholder: 'Search by name, title, department or email',
  ViewModeFieldLabel: 'View mode',
  ViewModeManagerWithReportsLabel: 'Manager with reports',
  ViewModeChainLabel: 'Reporting chain',
  ViewModeSmallTreeLabel: 'Small tree',
  MaxDepthFieldLabel: 'Max depth',
  ResultsCountLabel: 'Visible people',
  ReloadLabel: 'Reload',
  ErrorTitle: 'Unable to load the mini organigram.',
  ErrorMessage: 'Check the configured sources and try again.',
  PartialDataTitle: 'Partial data',
  PartialDataMessage: 'Some relationships or profile data are missing.',
  NoMatchesTitle: 'No matches',
  NoMatchesMessage: 'Try a different search term or view mode.',
  EmptyTitle: 'No structure available',
  EmptyMessage: 'No organizational structure is available for this configuration.',
  RootBadgeLabel: 'Root',
  PartialBadgeLabel: 'Partial',
  OpenProfileLabel: 'Open profile'
}), { virtual: true });

import * as React from 'react';
import ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import MiniOrgChart from './MiniOrgChart';
import type { IMiniOrgChartProps } from './IMiniOrgChartProps';

describe('MiniOrgChart', () => {
  it('renders the hierarchy and partial state banner', async () => {
    const container = document.createElement('div');
    const props = {
      context: {
        pageContext: {
          web: {
            absoluteUrl: 'https://contoso.sharepoint.com/sites/hr'
          }
        }
      },
      config: {
        dataSourceTypes: ['StaticConfig'],
        viewMode: 'managerWithReports',
        maxDepth: 2
      },
      title: 'Mini organigrama',
      description: 'Hierarchy preview',
      userDisplayName: 'User',
      isDarkTheme: false,
      environmentMessage: 'SharePoint',
      hasTeamsContext: false
    } as unknown as IMiniOrgChartProps;

    await act(async () => {
      ReactDom.render(<MiniOrgChart {...props} />, container);
    });

    expect(container.textContent).toContain('Root Person');
    expect(container.textContent).toContain('Partial data');
    expect(container.textContent).toContain('Open profile');

    ReactDom.unmountComponentAtNode(container);
  });
});

