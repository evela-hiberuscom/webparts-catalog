import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import InternalServicesStatus from './InternalServicesStatus';
import * as hookModule from '../hooks/useInternalServicesStatus';
import type { IInternalServicesStatusProps } from './IInternalServicesStatusProps';

function buildProps(): IInternalServicesStatusProps {
  return {
    description: 'Consulta operativa con datos de SharePoint.',
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'ServiceStatusList',
    autoRefreshSeconds: 300,
    showOnlyCritical: false,
    staleThresholdMinutes: 120,
    webUrl: 'https://contoso.sharepoint.com/sites/intranet',
    userDisplayName: 'Ada Lovelace'
  };
}

describe('InternalServicesStatus', () => {
  const useInternalServicesStatusSpy = jest.spyOn(hookModule, 'useInternalServicesStatus');

  afterEach(() => {
    useInternalServicesStatusSpy.mockReset();
  });

  it('renders loading state copy', () => {
    useInternalServicesStatusSpy.mockReturnValue({
      status: 'loading',
      refresh: jest.fn()
    });

    const markup = renderToStaticMarkup(<InternalServicesStatus {...buildProps()} />);

    expect(markup).toContain('Consultando el origen');
    expect(markup).toContain('Vista: Cargando');
  });

  it('renders ready state with cards and contextual filters', () => {
    useInternalServicesStatusSpy.mockReturnValue({
      status: 'ready',
      result: {
        status: 'ready',
        items: [
          {
            id: 'svc-1',
            name: 'Núcleo de identidad',
            status: 'critical',
            criticality: 'high',
            summary: 'Caída de autenticación',
            updatedAt: '2026-03-23T10:00:00.000Z',
            detailUrl: '/sites/intranet/status',
            domain: 'Plataforma',
            isPartial: false,
            isStale: true
          }
        ],
        hasPartialData: false,
        sourceCount: 1,
        lastUpdated: '2026-03-23T10:00:00.000Z',
        staleCount: 1
      },
      refresh: jest.fn()
    });

    const markup = renderToStaticMarkup(<InternalServicesStatus {...buildProps()} />);

    expect(markup).toContain('Vista personalizada para Ada Lovelace');
    expect(markup).toContain('Núcleo de identidad');
    expect(markup).toContain('Plataforma');
    expect(markup).toContain('Vista: Lista');
  });

  it('renders error state with the repository message', () => {
    useInternalServicesStatusSpy.mockReturnValue({
      status: 'error',
      error: 'Boom',
      refresh: jest.fn()
    });

    const markup = renderToStaticMarkup(<InternalServicesStatus {...buildProps()} />);

    expect(markup).toContain('No se ha podido cargar el estado de servicios');
    expect(markup).toContain('Boom');
    expect(markup).toContain('Reintentar');
  });
});
