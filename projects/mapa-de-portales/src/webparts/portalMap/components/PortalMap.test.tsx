jest.mock(
  'PortalMapWebPartStrings',
  () => ({
    WebPartTitle: 'Portal map',
    WebPartSubtitle: 'Understand the structure of hubs, sites and key areas before you navigate.',
    SourceLabelPrefix: 'Source',
    ViewSwitcherLabel: 'Display mode',
    ViewModeTreeOption: 'Tree',
    ViewModeGroupedOption: 'Grouped',
    ViewModeCardsOption: 'Cards',
    StatsRootsLabel: 'Roots',
    StatsNodesLabel: 'Nodes',
    PartialDataBanner: 'The portal map loaded with partial data.',
    StructureSectionTitle: 'Portal structure',
    GroupsHubLabel: 'Main hubs',
    GroupsSiteLabel: 'Sites',
    GroupsAreaLabel: 'Areas',
    GroupsUtilityLabel: 'Utilities',
    GroupsUnknownLabel: 'Unclassified',
    NodeOpenButton: 'Open portal',
    NodeNoLinkMessage: 'Informational node with no valid link.',
    TreeAriaLabel: 'Portal tree',
    GroupedAriaLabel: 'Portal groups',
    CardsAriaLabel: 'Portal cards',
    StateLoadingTitle: 'Loading portal structure',
    StateLoadingMessage: 'The map is preparing the portal nodes and relationships.',
    StateEmptyTitle: 'No portal structure available',
    StateEmptyMessage: 'There is no configured structure to show right now.',
    StateErrorTitle: 'Unable to load the portal map',
    StateErrorMessage: 'Review the configured source and try again later.'
  }),
  { virtual: true }
);
jest.mock('../hooks/usePortalMap', () => ({
  usePortalMap: jest.fn()
}));

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { usePortalMap } from '../hooks/usePortalMap';
import PortalMap from './PortalMap';

describe('PortalMap', () => {
  it('renders the partial-data banner and grouped fallback when returned by the hook', () => {
    const container = document.createElement('div');
    (usePortalMap as jest.Mock).mockReturnValue({
      state: 'partialData',
      roots: [],
      flatItems: [
        {
          id: 'hub-1',
          title: 'Hub Comercial',
          nodeType: 'hub',
          openUrl: '/sites/sales-hub',
          featured: true,
          sortOrder: 1,
          partialData: false
        }
      ],
      groupedItems: [
        {
          nodeType: 'hub',
          items: [
            {
              id: 'hub-1',
              title: 'Hub Comercial',
              nodeType: 'hub',
              openUrl: '/sites/sales-hub',
              featured: true,
              sortOrder: 1,
              partialData: false
            }
          ]
        }
      ],
      sourceLabel: 'SharePoint list: PortalMapList',
      hasPartialData: true,
      notes: ['A cyclic relationship was detected.'],
      errorMessage: undefined,
      resolvedViewMode: 'grouped'
    });

    ReactDom.render(
      <PortalMap
        dataSourceType="SharePointList"
        listTitleOrUrl="PortalMapList"
        viewMode="grouped"
        maxDepth={4}
        webUrl="https://contoso.sharepoint.com/sites/intranet"
        isDarkTheme={false}
        hasTeamsContext={false}
      />,
      container
    );

    expect(container.textContent).toContain('Hub Comercial');

    ReactDom.unmountComponentAtNode(container);
  });
});
