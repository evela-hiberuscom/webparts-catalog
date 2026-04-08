import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { IWhatChangedFeedConfiguration, IWhatChangedFeedService } from '../models/whatChangedFeedModels';
import { useWhatChangedFeed } from '../hooks/useWhatChangedFeed';

describe('useWhatChangedFeed', () => {
  let container: HTMLDivElement;

  const configuration: IWhatChangedFeedConfiguration = {
    title: 'Qué ha cambiado',
    description: 'Feed de cambios.',
    sourceKind: 'list',
    listTitleOrUrl: 'Recent Changes',
    defaultTypeFilter: '',
    maxItems: 5
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
    const service: IWhatChangedFeedService = {
      load: async () => ({
        status: 'ready',
        hasPartialData: false,
        items: []
      })
    };

    function Harness(): React.ReactElement {
      const result = useWhatChangedFeed(service, configuration);
      return <span>{result.state.status}</span>;
    }

    await act(async () => {
      ReactDOM.render(<Harness />, container);
      await Promise.resolve();
    });

    expect(container.textContent).toBe('ready');
  });
});
