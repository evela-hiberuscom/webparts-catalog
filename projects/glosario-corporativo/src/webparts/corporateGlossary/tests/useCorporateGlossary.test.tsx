import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { ICorporateGlossaryConfiguration, ICorporateGlossaryService } from '../models/corporateGlossaryModels';
import { useCorporateGlossary } from '../hooks/useCorporateGlossary';

describe('useCorporateGlossary', () => {
  let container: HTMLDivElement;

  const configuration: ICorporateGlossaryConfiguration = {
    title: 'Glosario corporativo',
    description: 'Términos internos.',
    listTitle: 'Glossary',
    defaultCategory: 'General',
    maxItems: 50,
    enableAlphabetNav: true
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('loads items and exposes filtered state', async () => {
    const service: ICorporateGlossaryService = {
      load: async () => ({
        status: 'ready',
        items: [
          {
            id: '1',
            title: 'API',
            definition: 'Interfaz',
            aliases: ['Plataforma'],
            featured: false,
            partialData: false,
            category: 'IT'
          }
        ],
        categories: ['IT'],
        letters: ['A'],
        hasPartialData: false
      })
    };

    function Harness(): React.ReactElement {
      const result = useCorporateGlossary(service, configuration);
      return <span>{result.visibleItems.length}</span>;
    }

    await act(async () => {
      ReactDOM.render(<Harness />, container);
      await Promise.resolve();
    });

    expect(container.textContent).toBe('1');
  });
});
