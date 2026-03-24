jest.mock('../hooks/useOffboardingOrChangeChecklist', () => ({
  useOffboardingOrChangeChecklist: jest.fn()
}));

import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import OffboardingOrChangeChecklist from './OffboardingOrChangeChecklist';
import type { IOffboardingOrChangeChecklistProps } from './IOffboardingOrChangeChecklistProps';
import { useOffboardingOrChangeChecklist } from '../hooks/useOffboardingOrChangeChecklist';

const mockedUseOffboardingOrChangeChecklist = useOffboardingOrChangeChecklist as jest.MockedFunction<typeof useOffboardingOrChangeChecklist>;

function buildProps(overrides: Partial<IOffboardingOrChangeChecklistProps> = {}): IOffboardingOrChangeChecklistProps {
  return {
    title: 'Checklist de offboarding o cambios',
    description: 'Organiza pasos de salida, transferencia o cambio organizativo.',
    dataSourceType: 'StaticConfig',
    webUrl: 'https://contoso.sharepoint.com/sites/portal',
    listTitleOrUrl: '',
    jsonUrl: '',
    staticConfigJson: '',
    defaultScenario: 'generic',
    defaultPhase: '',
    isDarkTheme: false,
    environmentMessage: 'Running in SharePoint',
    hasTeamsContext: false,
    userDisplayName: 'Ada Lovelace',
    ...overrides
  };
}

describe('OffboardingOrChangeChecklist', () => {
  it('renders the checklist and filters', () => {
    mockedUseOffboardingOrChangeChecklist.mockReturnValue({
      status: 'ready',
      items: [
        {
          id: '1',
          title: 'Cerrar accesos',
          description: 'VPN y correo',
          scenario: 'offboarding',
          phase: 'Seguridad',
          critical: true,
          priority: 1,
          relatedUrl: '/sites/it/security',
          relatedLabel: 'Guia de accesos',
          partialData: false
        }
      ],
      filteredItems: [
        {
          id: '1',
          title: 'Cerrar accesos',
          description: 'VPN y correo',
          scenario: 'offboarding',
          phase: 'Seguridad',
          critical: true,
          priority: 1,
          relatedUrl: '/sites/it/security',
          relatedLabel: 'Guia de accesos',
          partialData: false
        }
      ],
      sourceLabel: 'Lista SharePoint',
      notes: [],
      hasPartialData: false,
      errorMessage: undefined,
      activeScenario: 'offboarding',
      activePhase: 'all',
      scenarioOptions: [
        { key: 'all', text: 'Todos los escenarios' },
        { key: 'offboarding', text: 'Offboarding' }
      ],
      phaseOptions: [
        { key: 'all', text: 'Todas las fases' },
        { key: 'Seguridad', text: 'Seguridad' }
      ],
      criticalCount: 1,
      reload: jest.fn(),
      setScenarioFilter: jest.fn(),
      setPhaseFilter: jest.fn(),
      resetFilters: jest.fn()
    });

    const markup = renderToStaticMarkup(<OffboardingOrChangeChecklist {...buildProps()} />);

    expect(markup).toContain('Checklist de offboarding o cambios');
    expect(markup).toContain('Cerrar accesos');
    expect(markup).toContain('Guia de accesos');
    expect(markup).toContain('Escenario');
  });

  it('renders the error state', () => {
    mockedUseOffboardingOrChangeChecklist.mockReturnValue({
      status: 'error',
      items: [],
      filteredItems: [],
      sourceLabel: 'Checklist de offboarding o cambios',
      notes: [],
      hasPartialData: false,
      errorMessage: 'boom',
      activeScenario: 'generic',
      activePhase: 'all',
      scenarioOptions: [{ key: 'all', text: 'Todos los escenarios' }],
      phaseOptions: [{ key: 'all', text: 'Todas las fases' }],
      criticalCount: 0,
      reload: jest.fn(),
      setScenarioFilter: jest.fn(),
      setPhaseFilter: jest.fn(),
      resetFilters: jest.fn()
    });

    const markup = renderToStaticMarkup(<OffboardingOrChangeChecklist {...buildProps()} />);

    expect(markup).toContain('No se ha podido cargar el checklist');
    expect(markup).toContain('boom');
  });
});
