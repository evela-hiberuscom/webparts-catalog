import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { IUpcomingMilestonesConfiguration, IUpcomingMilestonesService } from '../models/upcomingMilestonesModels';
import { useUpcomingMilestones } from '../hooks/useUpcomingMilestones';

describe('useUpcomingMilestones', () => {
  let container: HTMLDivElement;

  const configuration: IUpcomingMilestonesConfiguration = {
    title: 'Próximos hitos',
    description: 'Timeline',
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'MilestonesList',
    maxItems: 5,
    viewMode: 'timeline',
    webUrl: 'https://contoso.sharepoint.com/sites/comms',
    localeName: 'es-ES'
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('moves from loading to ready', async () => {
    const service: IUpcomingMilestonesService = {
      load: async () => ({
        status: 'ready',
        items: [],
        hasPartialData: false
      })
    };

    function Harness(): React.ReactElement {
      const result = useUpcomingMilestones(service, configuration);
      return <span>{result.state.status}</span>;
    }

    await act(async () => {
      ReactDOM.render(<Harness />, container);
      await Promise.resolve();
    });

    expect(container.textContent).toBe('ready');
  });
});
