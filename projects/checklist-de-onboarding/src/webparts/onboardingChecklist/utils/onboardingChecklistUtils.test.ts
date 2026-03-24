import {
  deriveServerRelativeListPath,
  filterOnboardingChecklistSteps,
  normalizeOnboardingChecklistStep,
  resolveSameOriginUrl,
  sortOnboardingChecklistSteps
} from './onboardingChecklistUtils';

describe('onboardingChecklistUtils', () => {
  it('normalizes steps and marks partial data when fields are missing', () => {
    const item = normalizeOnboardingChecklistStep(
      {
        Title: 'Completar perfil',
        Phase: 'Inicio',
        Variant: 'Nuevo ingreso',
        Mandatory: 'yes',
        RelatedUrl: '/sites/onboarding/Documentos/Perfil'
      },
      0,
      'General'
    );

    expect(item.title).toBe('Completar perfil');
    expect(item.mandatory).toBe(true);
    expect(item.partialData).toBe(false);
  });

  it('sorts by phase, mandatory and title', () => {
    const items = sortOnboardingChecklistSteps([
      {
        id: '2',
        title: 'B',
        phase: 'Inicio',
        variant: 'General',
        mandatory: false,
        order: 2,
        partialData: false
      },
      {
        id: '1',
        title: 'A',
        phase: 'Inicio',
        variant: 'General',
        mandatory: true,
        order: 1,
        partialData: false
      }
    ]);

    expect(items[0].mandatory).toBe(true);
    expect(items[0].title).toBe('A');
  });

  it('filters by variant and phase', () => {
    const filtered = filterOnboardingChecklistSteps(
      [
        {
          id: '1',
          title: 'A',
          phase: 'Inicio',
          variant: 'General',
          mandatory: true,
          order: 1,
          partialData: false
        },
        {
          id: '2',
          title: 'B',
          phase: 'Aprendizaje',
          variant: 'Nuevo ingreso',
          mandatory: false,
          order: 2,
          partialData: false
        }
      ],
      'Nuevo ingreso',
      'Aprendizaje'
    );

    expect(filtered).toHaveLength(1);
    expect(filtered[0].title).toBe('B');
  });

  it('normalizes a view url to the list root and keeps same-origin urls', () => {
    const listRoot = deriveServerRelativeListPath('/sites/onboarding/Lists/Checklist/Forms/AllItems.aspx', 'https://contoso.sharepoint.com/sites/onboarding');
    expect(listRoot).toBe('/sites/onboarding/Lists/Checklist');
    expect(resolveSameOriginUrl('/sites/onboarding/Lists/Checklist/Forms/AllItems.aspx', 'https://contoso.sharepoint.com/sites/onboarding')).toContain('/sites/onboarding/Lists/Checklist/Forms/AllItems.aspx');
  });
});
