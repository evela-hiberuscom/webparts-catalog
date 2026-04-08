import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { ISmartFaqConfiguration, ISmartFaqService } from '../models/smartFaqModels';
import { useSmartFaq } from '../hooks/useSmartFaq';

describe('useSmartFaq', () => {
  let container: HTMLDivElement;

  const configuration: ISmartFaqConfiguration = {
    title: 'FAQ inteligente',
    description: 'Soporte ligero.',
    listTitleOrUrl: 'FAQ',
    defaultCategory: 'General',
    enableSearch: true,
    maxItems: 50
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
    const service: ISmartFaqService = {
      load: async () => ({
        status: 'ready',
        items: [],
        categories: [],
        hasPartialData: false
      })
    };

    function Harness(): React.ReactElement {
      const result = useSmartFaq(service, configuration);
      return <span>{result.state.status}</span>;
    }

    await act(async () => {
      ReactDOM.render(<Harness />, container);
      await Promise.resolve();
    });

    expect(container.textContent).toBe('ready');
  });
});
