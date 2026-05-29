import * as React from 'react';
import * as ReactDom from 'react-dom';
import ProfileBasedComponentView from './ProfileBasedComponentView';
import type { IProfileBasedComponentProps } from './IProfileBasedComponentProps';

describe('ProfileBasedComponentView', () => {
  it('renders a personalized card', () => {
    const host = document.createElement('div');
    const props: IProfileBasedComponentProps = {
      title: 'Componente según tu perfil',
      description: 'Personaliza el contenido según la audiencia del usuario.',
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: '',
      jsonUrl: '',
      staticConfigJson: '',
      audienceMode: 'hybrid',
      fallbackMode: 'generic',
      maxItems: 3,
      profileTokens: 'sales,es',
      siteUrl: 'https://contoso.sharepoint.com/sites/portal',
      displayName: 'Ana Pérez',
      email: 'ana.perez@contoso.com',
      loginName: 'i:0#.f|membership|ana.perez@contoso.com',
      isDarkTheme: false,
      hasTeamsContext: false
    };

    ReactDom.render(
      <ProfileBasedComponentView
        props={props}
        viewModel={{
          state: 'ready',
          title: props.title,
          description: props.description,
          sourceLabel: 'Static config',
          currentTokens: ['sales', 'es'],
          matchedTokens: ['sales', 'es'],
          fallbackApplied: false,
          variants: [],
          message: 'Variante personalizada resuelta.',
          variant: {
            id: 'sales',
            title: 'Ventas',
            summary: 'Resumen de ventas',
            body: 'Contenido específico para ventas.',
            accentLabel: 'Prioritario',
            ctaLabel: 'Abrir',
            ctaUrl: '/sites/portal/ventas',
            audienceTokens: ['sales', 'es'],
            isGeneric: false,
            contentType: 'card',
            priority: 1,
            tags: ['ventas'],
            payload: {}
          }
        }}
        onRetry={jest.fn()}
      />,
      host
    );

    expect(host.textContent).toContain('Ventas');
    expect(host.textContent).toContain('Resumen de ventas');

    ReactDom.unmountComponentAtNode(host);
  });

  it('drops unsafe CTA and payload links before rendering', () => {
    const host = document.createElement('div');
    const unsafeUrl = `java${'script'}:alert(1)`;
    const props: IProfileBasedComponentProps = {
      title: 'Componente según tu perfil',
      description: 'Personaliza el contenido según la audiencia del usuario.',
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: '',
      jsonUrl: '',
      staticConfigJson: '',
      audienceMode: 'hybrid',
      fallbackMode: 'generic',
      maxItems: 3,
      profileTokens: 'sales,es',
      siteUrl: 'https://contoso.sharepoint.com/sites/portal',
      displayName: 'Ana Pérez',
      email: 'ana.perez@contoso.com',
      loginName: 'i:0#.f|membership|ana.perez@contoso.com',
      isDarkTheme: false,
      hasTeamsContext: false
    };

    ReactDom.render(
      <ProfileBasedComponentView
        props={props}
        viewModel={{
          state: 'ready',
          title: props.title,
          description: props.description,
          sourceLabel: 'Static config',
          currentTokens: ['sales', 'es'],
          matchedTokens: ['sales', 'es'],
          fallbackApplied: false,
          variants: [],
          message: 'Variante personalizada resuelta.',
          variant: {
            id: 'sales',
            title: 'Ventas',
            summary: 'Resumen de ventas',
            body: 'Contenido específico para ventas.',
            accentLabel: 'Prioritario',
            ctaLabel: 'Abrir',
            ctaUrl: unsafeUrl,
            audienceTokens: ['sales', 'es'],
            isGeneric: false,
            contentType: 'links',
            priority: 1,
            tags: ['ventas'],
            payload: {
              links: [{ label: 'Peligroso', url: unsafeUrl }]
            }
          }
        }}
        onRetry={jest.fn()}
      />,
      host
    );

    expect(host.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(host.textContent).not.toContain('Peligroso');

    ReactDom.unmountComponentAtNode(host);
  });
});
