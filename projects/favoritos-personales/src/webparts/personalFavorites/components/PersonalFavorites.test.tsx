import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import PersonalFavorites from './PersonalFavorites';

describe('PersonalFavorites', () => {
  const container = document.createElement('div');

  beforeEach(() => {
    document.body.appendChild(container);
  });

  it('renders the header and metadata from the loaded view model', async () => {
    await act(async () => {
      ReactDOM.render(
        <PersonalFavorites
          title="Favoritos personales"
          description="Accesos personales"
          dataSourceType="StaticConfig"
          listTitleOrUrl="FavoritesList"
          maxItems={8}
          showMetadata={true}
          favoritesJson={`[
            {
              "id": "portal-comercial",
              "title": "Portal Comercial",
              "description": "Acceso rápido",
              "openUrl": "https://contoso.example.com",
              "icon": "Page",
              "type": "site",
              "category": "Negocio",
              "featured": true,
              "sortOrder": 1
            }
          ]`}
          userDisplayName="Ada Lovelace"
          webPartContext={{
            pageContext: {
              user: {
                displayName: 'Ada Lovelace'
              },
              web: {
                absoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
              },
              legacyPageContext: {
                userId: 17
              }
            }
          }}
        />,
        container
      );

      await Promise.resolve();
    });

    expect(container.textContent).toContain('Favoritos personales');
    expect(container.textContent).toContain('Static config');
    expect(container.textContent).toContain('Portal Comercial');

    ReactDOM.unmountComponentAtNode(container);
    container.innerHTML = '';
    container.remove();
  });
});
