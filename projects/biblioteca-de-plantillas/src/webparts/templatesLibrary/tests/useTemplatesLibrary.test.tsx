import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { ITemplatesLibraryConfiguration, ITemplatesLibraryService } from '../models/templatesLibraryModels';
import { useTemplatesLibrary } from '../hooks/useTemplatesLibrary';

describe('useTemplatesLibrary', () => {
  let container: HTMLDivElement;

  const configuration: ITemplatesLibraryConfiguration = {
    title: 'Biblioteca de plantillas',
    description: 'Catálogo oficial',
    sourceKind: 'library',
    listTitleOrUrl: 'Plantillas',
    defaultCategory: 'General',
    maxItems: 10
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
    const service: ITemplatesLibraryService = {
      load: async () => ({
        status: 'ready',
        items: [],
        categories: [],
        types: [],
        hasPartialData: false
      })
    };

    function Harness(): React.ReactElement {
      const result = useTemplatesLibrary(service, configuration);
      return <span>{result.state.status}</span>;
    }

    await act(async () => {
      ReactDOM.render(<Harness />, container);
      await Promise.resolve();
    });

    expect(container.textContent).toBe('ready');
  });
});
