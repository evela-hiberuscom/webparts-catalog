import {
  classifyIncidentCardTone,
  countDistinctSources,
  formatIncidentEta,
  mapIncidentRecord,
  normalizeIncidentStatus,
  normalizeSeverity,
  resolveIncidentDetailLink,
  sortIncidents,
  truncateIncidents
} from '../utils/highlightedIncidentsUtils';

describe('highlightedIncidentsUtils', () => {
  it('normalizes severities and statuses', () => {
    expect(normalizeSeverity('Sev 1')).toBe('critical');
    expect(normalizeSeverity('major outage')).toBe('high');
    expect(normalizeSeverity('moderate impact')).toBe('medium');
    expect(normalizeSeverity('minor issue')).toBe('low');
    expect(normalizeSeverity('other')).toBe('unknown');

    expect(normalizeIncidentStatus('monitoring')).toBe('monitoring');
    expect(normalizeIncidentStatus('open')).toBe('active');
    expect(normalizeIncidentStatus('resolved')).toBe('resolved');
    expect(normalizeIncidentStatus('other')).toBe('unknown');
  });

  it('maps records, resolves links and sorts by severity', () => {
    const dangerousScriptUrl = ['java', 'script:alert(1)'].join('');
    const incident = mapIncidentRecord(
      {
        Title: 'Portal caído',
        Severity: 'Critical',
        Impact: 'Los usuarios no pueden iniciar sesión',
        Status: 'Active',
        Workaround: 'Usar el acceso alternativo',
        ETA: '2026-03-25T10:30:00Z',
        DetailUrl: '/sites/support/portal-caido',
        Id: 'INC-001'
      },
      'IncidentsList',
      0
    );

    expect(incident.isPartial).toBe(false);
    expect(resolveIncidentDetailLink('https://contoso.sharepoint.com/sites/a', 'https://contoso.sharepoint.com/sites/app')?.href).toBe('/sites/a');
    expect(resolveIncidentDetailLink('https://example.com/incident', 'https://contoso.sharepoint.com/sites/app')?.target).toBe('_blank');
    expect(resolveIncidentDetailLink(dangerousScriptUrl, 'https://contoso.sharepoint.com/sites/app')).toBeUndefined();
    expect(classifyIncidentCardTone('critical')).toBe('severity-critical');
    expect(formatIncidentEta('2026-03-25T10:30:00Z')).toBeDefined();

    const items = sortIncidents([
      incident,
      {
        ...incident,
        id: 'INC-002',
        title: 'Sin prioridad',
        severity: 'low',
        status: 'monitoring'
      }
    ]);

    expect(items[0].severity).toBe('critical');
    expect(truncateIncidents(items, 1)).toHaveLength(1);
    expect(countDistinctSources(items)).toBe(1);
  });
});
