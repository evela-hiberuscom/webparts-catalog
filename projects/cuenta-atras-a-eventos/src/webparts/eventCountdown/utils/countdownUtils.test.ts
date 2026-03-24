import {
  buildListItemsEndpoint,
  calculateRemaining,
  deriveCountdownPhase,
  formatEventDate,
  mapSourceRecordToCountdownItem,
  normalizeListServerRelativePath,
  parseCountdownDate,
  selectPrimaryRecord
} from './countdownUtils';

describe('countdownUtils', () => {
  it('normalizes SharePoint list view URLs to the list root', () => {
    expect(normalizeListServerRelativePath('/sites/portal/Lists/Events/Forms/AllItems.aspx')).toBe('/sites/portal/Lists/Events');
    expect(normalizeListServerRelativePath('/sites/portal/Lists/Events/AllItems.aspx')).toBe('/sites/portal/Lists/Events');
  });

  it('builds list endpoints from titles and same-origin URLs', () => {
    expect(buildListItemsEndpoint('https://contoso.sharepoint.com/sites/portal', 'Events')).toBe(
      "https://contoso.sharepoint.com/sites/portal/_api/web/lists/getbytitle('Events')/items?$top=100"
    );

    expect(buildListItemsEndpoint('https://contoso.sharepoint.com/sites/portal', '/sites/portal/Lists/Events/Forms/AllItems.aspx')).toContain('GetList(@listUrl)');
    expect(buildListItemsEndpoint('https://contoso.sharepoint.com/sites/portal', '/sites/portal/Lists/Events/Forms/AllItems.aspx')).not.toContain('AllItems.aspx');
  });

  it('calculates remaining time and phase correctly', () => {
    const now = new Date('2026-03-24T09:00:00Z');
    const target = new Date('2026-03-25T11:12:00Z');
    const remaining = calculateRemaining(target, now);

    expect(remaining.days).toBe(1);
    expect(remaining.hours).toBe(2);
    expect(remaining.minutes).toBe(12);
    expect(parseCountdownDate('2026-03-25T11:12:00Z')).toBeInstanceOf(Date);
    expect(deriveCountdownPhase({ title: 'Launch', targetDate: '2026-03-25T11:12:00Z', state: 'unknown', showCompleted: true, hasPartialData: false }, now)).toBe('countdown');
    expect(deriveCountdownPhase({ title: 'Launch', targetDate: '2026-03-24T12:00:00Z', state: 'unknown', showCompleted: true, hasPartialData: false }, now)).toBe('live');
    expect(deriveCountdownPhase({ title: 'Launch', targetDate: '2026-03-23T12:00:00Z', state: 'unknown', showCompleted: true, hasPartialData: false }, now)).toBe('completed');
  });

  it('maps records and picks the first usable record', () => {
    const config = {
      eventTitle: 'Cuenta atrás a eventos',
      targetDate: '2026-04-01T09:00:00Z',
      subtitle: 'Campaña Q2',
      detailUrl: 'https://contoso.sharepoint.com/sites/portal/SitePages/evento.aspx',
      titleField: 'Title',
      targetDateField: 'TargetDate',
      subtitleField: 'Subtitle',
      detailUrlField: 'DetailUrl',
      showCompleted: false
    } as const;

    const item = mapSourceRecordToCountdownItem(
      {
        Title: 'Lanzamiento Q2',
        TargetDate: '2026-04-01T09:00:00Z',
        Subtitle: 'Campaña Q2',
        DetailUrl: 'https://contoso.sharepoint.com/sites/portal/SitePages/evento.aspx'
      },
      config
    );

    expect(item.title).toBe('Lanzamiento Q2');
    expect(item.targetDate).toBe('2026-04-01T09:00:00.000Z');
    expect(item.hasPartialData).toBe(false);

    expect(
      selectPrimaryRecord(
        [{}, { Title: 'Lanzamiento Q2', TargetDate: '2026-04-01T09:00:00Z' }],
        { targetDate: '2026-04-01T09:00:00Z' }
      )
    ).toEqual({ Title: 'Lanzamiento Q2', TargetDate: '2026-04-01T09:00:00Z' });
    expect(formatEventDate('2026-04-01T09:00:00Z')).toContain('2026');
  });
});
