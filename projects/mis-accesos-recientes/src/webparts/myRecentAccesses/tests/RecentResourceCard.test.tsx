import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { RecentResourceCard } from '../components/RecentResourceCard';

describe('RecentResourceCard', () => {
  it('renders title and open action when url exists', () => {
    const markup = renderToStaticMarkup(
      <RecentResourceCard
        item={{
          id: 'recent-1',
          title: 'Portal RRHH',
          type: 'page',
          lastAccessedAt: '2026-03-21T08:20:00Z',
          openUrl: '/sites/hr',
          sourceLabel: 'Fallback local'
        }}
      />
    );

    expect(markup).toContain('Portal RRHH');
    expect(markup).toContain('Abrir recurso');
    expect(markup).toContain('Fallback local');
  });
});
