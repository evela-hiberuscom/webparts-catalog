import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { INewsByAreaConfiguration, INewsByAreaService } from '../models/newsByAreaModels';
import { useNewsByArea } from '../hooks/useNewsByArea';

describe('useNewsByArea', () => {
  let container: HTMLDivElement;

  const configuration: INewsByAreaConfiguration = {
    title: 'Noticias por área',
    description: 'Pulso de IT.',
    areaFilter: 'IT',
    sitePagesListTitle: 'Site Pages',
    maxItems: 4,
    showImage: true,
    featuredFirst: true
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
    const service: INewsByAreaService = {
      load: async () => ({
        status: 'ready',
        hasPartialData: false,
        items: []
      })
    };

    function Harness(): React.ReactElement {
      const result = useNewsByArea(service, configuration);
      return <span>{result.state.status}</span>;
    }

    await act(async () => {
      ReactDOM.render(<Harness />, container);
      await Promise.resolve();
    });

    expect(container.textContent).toBe('ready');
  });
});
