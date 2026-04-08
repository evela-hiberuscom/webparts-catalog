import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { INewsSummaryConfiguration, INewsSummaryService } from '../models/newsSummaryModels';
import { useNewsSummary } from '../hooks/useNewsSummary';

describe('useNewsSummary', () => {
  let container: HTMLDivElement;

  const configuration: INewsSummaryConfiguration = {
    title: 'Resumen de noticias',
    description: 'Pulso editorial.',
    sitePagesListTitle: 'Site Pages',
    maxItems: 4,
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
    const service: INewsSummaryService = {
      load: async () => ({
        status: 'ready',
        hasPartialData: false,
        items: []
      })
    };

    function Harness(): React.ReactElement {
      const result = useNewsSummary(service, configuration);
      return <span>{result.state.status}</span>;
    }

    await act(async () => {
      ReactDOM.render(<Harness />, container);
      await Promise.resolve();
    });

    expect(container.textContent).toBe('ready');
  });
});
