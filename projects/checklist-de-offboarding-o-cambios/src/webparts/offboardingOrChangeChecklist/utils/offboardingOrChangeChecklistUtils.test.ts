import {
  buildFallbackChecklistSteps,
  collectPhaseOptions,
  collectScenarioOptions,
  filterChecklistSteps,
  getScenarioLabel,
  normalizeChecklistStep,
  normalizeScenario,
  parseChecklistCollection,
  sortChecklistSteps
} from './offboardingOrChangeChecklistUtils';

describe('offboarding checklist utils', () => {
  it('normalizes scenarios and falls back to generic when missing', () => {
    expect(normalizeScenario('roleChange').scenario).toBe('roleChange');
    expect(normalizeScenario('unknown').scenario).toBe('generic');
    expect(normalizeScenario('unknown').isPartial).toBe(true);
  });

  it('parses collections and normalizes records', () => {
    const records = parseChecklistCollection({
      items: [
        {
          Title: 'Cerrar accesos',
          Scenario: 'offboarding',
          Phase: 'Seguridad',
          Critical: true,
          Priority: '1',
          RelatedUrl: '/sites/it/security'
        }
      ]
    });
    const step = normalizeChecklistStep(records[0], 0, '');

    expect(step.title).toBe('Cerrar accesos');
    expect(step.scenario).toBe('offboarding');
    expect(step.critical).toBe(true);
    expect(step.partialData).toBe(false);
  });

  it('filters and sorts steps', () => {
    const steps = sortChecklistSteps(
      buildFallbackChecklistSteps('generic', '').concat([
        {
          id: 'partial',
          title: 'Paso parcial',
          scenario: 'generic',
          phase: 'Sin fase',
          critical: false,
          priority: 99,
          partialData: true
        }
      ])
    );

    expect(filterChecklistSteps(steps, 'offboarding', 'all').length).toBeGreaterThan(0);
    expect(getScenarioLabel('transfer')).toBe('Transferencia');
    expect(collectScenarioOptions(steps)[0].key).toBe('all');
    expect(collectPhaseOptions(steps)[0].key).toBe('all');
  });
});
