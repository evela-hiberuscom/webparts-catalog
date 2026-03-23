import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import { FavoriteCard } from './FavoriteCard';

describe('FavoriteCard', () => {
  const container = document.createElement('div');

  beforeEach(() => {
    document.body.appendChild(container);
  });

  it('renders unsafe links as non-clickable cards', () => {
    const unsafeUrl = ['java', 'script:alert(1)'].join('');

    act(() => {
      ReactDOM.render(
        <FavoriteCard
          item={{
            id: 'unsafe',
            title: 'Enlace sospechoso',
            openUrl: unsafeUrl,
            icon: 'Page',
            type: 'site',
            featured: false,
            hasAction: true
          }}
        />,
        container
      );
    });

    expect(container.querySelector('a')).toBeNull();
    expect(container.textContent).toContain('Enlace no disponible');

    ReactDOM.unmountComponentAtNode(container);
    container.innerHTML = '';
    container.remove();
  });

  it('opens safe external links in a new tab', () => {
    act(() => {
      ReactDOM.render(
        <FavoriteCard
          item={{
            id: 'safe',
            title: 'Portal Comercial',
            openUrl: 'https://contoso.example.com',
            icon: 'Page',
            type: 'site',
            featured: true,
            hasAction: true
          }}
        />,
        container
      );
    });

    const anchor = container.querySelector('a');
    expect(anchor).not.toBeNull();
    expect(anchor?.getAttribute('target')).toBe('_blank');
    expect(anchor?.getAttribute('rel')).toContain('noopener');

    ReactDOM.unmountComponentAtNode(container);
    container.innerHTML = '';
    container.remove();
  });
});
