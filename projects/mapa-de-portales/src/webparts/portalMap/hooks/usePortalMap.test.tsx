jest.mock(
  'PortalMapWebPartStrings',
  () => ({
    SourceLabelStaticConfig: 'Static sample',
    StateErrorMessage: 'Review the configured source and try again later.'
  }),
  { virtual: true }
);

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { usePortalMap } from './usePortalMap';
import type { IPortalMapRequest, IPortalMapSnapshot } from '../models/portalMapModels';

function createRequest(overrides: Partial<IPortalMapRequest> = {}): IPortalMapRequest {
  return {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'PortalMapList',
    viewMode: 'tree',
    maxDepth: 4,
    webUrl: 'https://contoso.sharepoint.com/sites/intranet',
    ...overrides
  };
}

describe('usePortalMap', () => {
  it('resolves the async snapshot through the service', async () => {
    const container = document.createElement('div');
    const service = {
      resolve: jest.fn().mockResolvedValue({
        state: 'ready',
        roots: [],
        flatItems: [],
        groupedItems: [],
        sourceLabel: 'Static sample',
        hasPartialData: false,
        notes: [],
        errorMessage: undefined,
        resolvedViewMode: 'tree'
      } as IPortalMapSnapshot)
    };

    function Harness(): React.ReactElement {
      const snapshot = usePortalMap(createRequest(), service as never);
      return <div data-state={snapshot.state} data-source={snapshot.sourceLabel} />;
    }

    await new Promise<void>((resolve) => {
      ReactDom.render(<Harness />, container, () => {
        setTimeout(resolve, 0);
      });
    });

    expect(container.firstChild).not.toBeNull();
    expect((container.firstChild as HTMLElement).getAttribute('data-state')).toBe('ready');
    expect(service.resolve).toHaveBeenCalledTimes(1);

    ReactDom.unmountComponentAtNode(container);
  });
});
