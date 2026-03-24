jest.mock('../hooks/useOnboardingChecklist', () => ({
  useOnboardingChecklist: jest.fn()
}));

import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import OnboardingChecklist from './OnboardingChecklist';
import type { IOnboardingChecklistProps } from './IOnboardingChecklistProps';
import { useOnboardingChecklist } from '../hooks/useOnboardingChecklist';

const mockedUseOnboardingChecklist = useOnboardingChecklist as jest.MockedFunction<typeof useOnboardingChecklist>;

function buildProps(overrides: Partial<IOnboardingChecklistProps> = {}): IOnboardingChecklistProps {
  return {
    title: 'Checklist de onboarding',
    description: 'Checklist secuencial para acompañar la incorporacion.',
    dataSourceType: 'StaticConfig',
    webUrl: 'https://contoso.sharepoint.com/sites/onboarding',
    listTitleOrUrl: '',
    jsonUrl: '',
    staticConfigJson: '',
    defaultVariant: 'all',
    defaultPhase: 'all',
    isDarkTheme: false,
    environmentMessage: 'Running in SharePoint',
    hasTeamsContext: false,
    userDisplayName: 'Ada Lovelace',
    ...overrides
  };
}

describe('OnboardingChecklist', () => {
  it('renders checklist items and filters', () => {
    mockedUseOnboardingChecklist.mockReturnValue({
      status: 'ready',
      items: [
        {
          id: '1',
          title: 'Revisar bienvenida',
          description: 'Compartir contexto y contactos clave.',
          phase: 'Inicio',
          variant: 'General',
          mandatory: true,
          order: 1,
          relatedUrl: '/sites/onboarding/Documentos/Bienvenida',
          relatedLabel: 'Guia de bienvenida',
          partialData: false
        }
      ],
      filteredItems: [
        {
          id: '1',
          title: 'Revisar bienvenida',
          description: 'Compartir contexto y contactos clave.',
          phase: 'Inicio',
          variant: 'General',
          mandatory: true,
          order: 1,
          relatedUrl: '/sites/onboarding/Documentos/Bienvenida',
          relatedLabel: 'Guia de bienvenida',
          partialData: false
        }
      ],
      sourceLabel: 'Lista SharePoint',
      notes: [],
      hasPartialData: false,
      errorMessage: undefined,
      activeVariant: 'all',
      activePhase: 'all',
      variantOptions: [
        { key: 'all', text: 'Todas las variantes' },
        { key: 'General', text: 'General' }
      ],
      phaseOptions: [
        { key: 'all', text: 'Todas las fases' },
        { key: 'Inicio', text: 'Inicio' }
      ],
      mandatoryCount: 1,
      reload: jest.fn(),
      setVariantFilter: jest.fn(),
      setPhaseFilter: jest.fn(),
      resetFilters: jest.fn()
    });

    const markup = renderToStaticMarkup(<OnboardingChecklist {...buildProps()} />);

    expect(markup).toContain('Checklist de onboarding');
    expect(markup).toContain('Revisar bienvenida');
    expect(markup).toContain('Guia de bienvenida');
    expect(markup).toContain('Variante');
  });

  it('renders the empty state', () => {
    mockedUseOnboardingChecklist.mockReturnValue({
      status: 'empty',
      items: [],
      filteredItems: [],
      sourceLabel: 'Checklist de onboarding',
      notes: [],
      hasPartialData: false,
      errorMessage: undefined,
      activeVariant: 'all',
      activePhase: 'all',
      variantOptions: [{ key: 'all', text: 'Todas las variantes' }],
      phaseOptions: [{ key: 'all', text: 'Todas las fases' }],
      mandatoryCount: 0,
      reload: jest.fn(),
      setVariantFilter: jest.fn(),
      setPhaseFilter: jest.fn(),
      resetFilters: jest.fn()
    });

    const markup = renderToStaticMarkup(<OnboardingChecklist {...buildProps()} />);

    expect(markup).toContain('No hay pasos configurados');
  });

  it('renders the error state', () => {
    mockedUseOnboardingChecklist.mockReturnValue({
      status: 'error',
      items: [],
      filteredItems: [],
      sourceLabel: 'Checklist de onboarding',
      notes: [],
      hasPartialData: false,
      errorMessage: 'boom',
      activeVariant: 'all',
      activePhase: 'all',
      variantOptions: [{ key: 'all', text: 'Todas las variantes' }],
      phaseOptions: [{ key: 'all', text: 'Todas las fases' }],
      mandatoryCount: 0,
      reload: jest.fn(),
      setVariantFilter: jest.fn(),
      setPhaseFilter: jest.fn(),
      resetFilters: jest.fn()
    });

    const markup = renderToStaticMarkup(<OnboardingChecklist {...buildProps()} />);

    expect(markup).toContain('No se ha podido cargar el checklist');
    expect(markup).toContain('boom');
  });
});
