import {
  applyAgendaTypeFilter,
  filterPastAgendaItems,
  getAgendaGroup,
  limitAgendaItems,
  normalizeAgendaItem,
  sortAgendaItems
} from './teamAgendaUtils';

describe('teamAgendaUtils', () => {
  it('groups events happening today', () => {
    const group = getAgendaGroup('2026-04-08T09:00:00.000Z', new Date('2026-04-08T07:00:00.000Z'));

    expect(group).toBe('today');
  });

  it('normalizes action urls and partial state', () => {
    const item = normalizeAgendaItem(
      {
        id: '1',
        title: 'Demo sprint',
        startsAt: '2026-04-09T09:00:00.000Z',
        endsAt: null,
        eventType: 'Demo',
        location: 'Teams',
        joinUrl: 'https://teams.microsoft.com/l/meetup-join/example',
        openUrl: null
      },
      0,
      'https://contoso.sharepoint.com/sites/demo',
      new Date('2026-04-08T07:00:00.000Z')
    );

    expect(item.joinUrl).toContain('teams.microsoft.com');
    expect(item.isPartial).toBe(false);
  });

  it('sorts agenda items by start date', () => {
    const sorted = sortAgendaItems([
      { id: '2', title: 'Later', startsAt: '2026-04-09T10:00:00.000Z', endsAt: null, eventType: 'Ritual', location: 'Teams', joinUrl: null, openUrl: null, group: 'tomorrow', isPartial: false },
      { id: '1', title: 'Sooner', startsAt: '2026-04-08T10:00:00.000Z', endsAt: null, eventType: 'Demo', location: 'Teams', joinUrl: null, openUrl: null, group: 'today', isPartial: false }
    ]);

    expect(sorted[0].title).toBe('Sooner');
  });

  it('limits visible items', () => {
    const limited = limitAgendaItems([
      { id: '1', title: 'One', startsAt: null, endsAt: null, eventType: null, location: null, joinUrl: null, openUrl: null, group: 'today', isPartial: false },
      { id: '2', title: 'Two', startsAt: null, endsAt: null, eventType: null, location: null, joinUrl: null, openUrl: null, group: 'tomorrow', isPartial: false }
    ], 1);

    expect(limited).toHaveLength(1);
  });

  it('filters out past items and applies type filters', () => {
    const visible = applyAgendaTypeFilter(
      filterPastAgendaItems([
        { id: '1', title: 'Daily', startsAt: '2026-04-08T09:00:00.000Z', endsAt: null, eventType: 'Ritual', location: 'Teams', joinUrl: null, openUrl: null, group: 'today', isPartial: false },
        { id: '2', title: 'Old event', startsAt: '2026-04-07T09:00:00.000Z', endsAt: null, eventType: 'Ritual', location: null, joinUrl: null, openUrl: null, group: 'past', isPartial: true }
      ], false),
      'Ritual'
    );

    expect(visible).toHaveLength(1);
    expect(visible[0].id).toBe('1');
  });
});
