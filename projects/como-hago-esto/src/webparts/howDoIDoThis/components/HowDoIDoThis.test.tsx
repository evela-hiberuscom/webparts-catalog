jest.mock('HowDoIDoThisWebPartStrings', () => jest.requireActual('../testSupport/mockHowDoIDoThisStrings'), { virtual: true });

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import HowDoIDoThis from './HowDoIDoThis';

describe('HowDoIDoThis component', () => {
  it('renders guides and expands steps', async () => {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const service = {
      load: jest.fn().mockResolvedValue({
        status: 'ready',
        items: [
          {
            id: '1',
            title: 'Cómo pedir material',
            summary: 'Resumen',
            category: 'Compras',
            steps: ['Abre el portal', 'Rellena el formulario'],
            relatedUrl: '/sites/purchases/material',
            featured: true,
            isPartial: false
          }
        ],
        visibleItems: [
          {
            id: '1',
            title: 'Cómo pedir material',
            summary: 'Resumen',
            category: 'Compras',
            steps: ['Abre el portal', 'Rellena el formulario'],
            relatedUrl: '/sites/purchases/material',
            featured: true,
            isPartial: false
          }
        ],
        categories: ['Compras'],
        selectedCategory: 'All',
        sourceLabel: 'StaticConfig',
        hasPartialData: false
      })
    };

    await act(async () => {
      ReactDom.render(
        <HowDoIDoThis
          title="Cómo hago esto"
          description="Guías breves"
          request={{
            title: 'Cómo hago esto',
            description: 'Guías breves',
            dataSourceType: 'StaticConfig',
            listTitleOrUrl: '',
            defaultCategory: '',
            maxItems: 8,
            webUrl: 'https://contoso.sharepoint.com/sites/intranet',
            userDisplayName: 'Ada Lovelace'
          }}
          service={service as never}
          isDarkTheme={false}
          environmentMessage=""
          hasTeamsContext={false}
          userDisplayName="Ada Lovelace"
        />,
        container
      );
    });

    expect(container.textContent).toContain('Cómo pedir material');
    const button = Array.from(container.querySelectorAll('button')).find((candidate) => candidate.textContent?.includes('Show steps'));
    expect(button?.textContent).toContain('Show steps');

    await act(async () => {
      button?.dispatchEvent(new MouseEvent('click', { bubbles: true }));
    });

    expect(container.textContent).toContain('Abre el portal');
    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });
});
