jest.mock('ExpressDirectoryWebPartStrings', () => ({
  WebPartTitle: 'Express directory',
  WebPartSubtitle: 'Find people by name, role, area, or basic contact info.',
  SearchLabel: 'Search',
  SearchPlaceholder: 'Search by name, title, area, or email',
  SearchSummaryLabel: 'Search prioritizes exact name matches.',
  RefreshButton: 'Refresh',
  AreaFilterLabel: 'Filter by area',
  AllAreasOption: 'All areas',
  LoadingLabel: 'Loading directory...',
  ResultsCountLabel: 'people visible',
  PartialDataMessage: 'Some people are missing a photo, profile, title, or complete area.',
  EmptyStateTitle: 'No people to show',
  EmptyStateMessage: 'Try changing the search term or area filter.',
  PartialDataBadgeLabel: 'Partial data',
  ContactEmailLabel: 'Send email',
  ContactProfileLabel: 'Open profile'
}), { virtual: true });

jest.mock('../hooks/useExpressDirectory', () => ({
  useExpressDirectory: () => ({
    status: 'partialData',
    errorMessage: undefined,
    items: [
        {
          id: '1',
          displayName: 'Marta Ruiz',
          jobTitle: 'HRBP',
          area: 'RRHH',
          email: 'marta@corp.com',
          profileUrl: '/profile/marta',
          photoUrl: undefined
        }
    ],
    areas: ['RRHH'],
    hasPartialData: true,
    sourceLabels: ['Directory API'],
    warnings: [],
    query: '',
    selectedArea: '',
    actions: {
      refresh: jest.fn(),
      setQuery: jest.fn(),
      setSelectedArea: jest.fn()
    }
  })
}));

import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ExpressDirectory from './ExpressDirectory';

describe('ExpressDirectory', () => {
  it('renders the main directory surface', () => {
    const markup = renderToStaticMarkup(
      <ExpressDirectory
        context={
          {
            pageContext: {
              web: { absoluteUrl: 'https://contoso.sharepoint.com/sites/demo' },
              user: { displayName: 'Tester' }
            },
            sdks: {},
            isServedFromLocalhost: true
          } as never
        }
        description="Directorio corporativo"
        dataSourceTypesCsv="Directory,SharePointList"
        listTitleOrUrl="PeopleList"
        jsonUrl=""
        staticPeopleJson=""
        maxItems={12}
        defaultAreaFilter=""
        isDarkTheme={false}
        environmentMessage="Local"
        hasTeamsContext={false}
        userDisplayName="Tester"
      />
    );

    expect(markup).toContain('Express directory');
    expect(markup).toContain('Marta Ruiz');
    expect(markup).toContain('ms-MessageBar--warning');
  });
});
