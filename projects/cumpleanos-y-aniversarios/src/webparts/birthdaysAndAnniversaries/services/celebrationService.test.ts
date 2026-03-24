jest.mock('@microsoft/sp-http', () => ({
  SPHttpClient: {
    configurations: {
      v1: {}
    }
  }
}));

import { buildCelebrationViewModel } from './celebrationService';
import type { ICelebrationRecord } from '../models/celebrationModels';

const sampleItems: ICelebrationRecord[] = [
  {
    id: 'today',
    displayName: 'Sofía Martín',
    photoUrl: '/sites/portal/profile/sofia.jpg',
    celebrationType: 'birthday',
    date: '2026-03-24T00:00:00.000Z'
  },
  {
    id: 'upcoming',
    displayName: 'Andrés García',
    photoUrl: '/sites/portal/profile/andres.jpg',
    celebrationType: 'anniversary',
    date: '2026-03-27T00:00:00.000Z'
  },
  {
    id: 'partial',
    displayName: 'María López',
    photoUrl: null,
    celebrationType: 'unknown',
    date: null
  }
];

describe('celebrationService', () => {
  it('builds ready sections and keeps partial records visible', () => {
    const result = buildCelebrationViewModel({
      title: 'Cumpleaños y aniversarios',
      subtitle: 'Reconoce los hitos de hoy y los próximos en una vista ligera.',
      sourceLabel: 'SharePoint list',
      items: sampleItems,
      hasPartialData: false,
      notes: [],
      today: new Date('2026-03-24T08:00:00.000Z'),
      request: {
        dataSourceTypes: ['SharePointList'],
        webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal',
        showBirthdays: true,
        showAnniversaries: true,
        daysAhead: 14
      }
    });

    expect(result.status).toBe('partialData');
    expect(result.todayItems).toHaveLength(1);
    expect(result.upcomingItems).toHaveLength(1);
    expect(result.partialItems).toHaveLength(1);
    expect(result.items[0].displayName).toBe('Sofía Martín');
  });

  it('filters birthdays when the toggle is off', () => {
    const result = buildCelebrationViewModel({
      title: 'Cumpleaños y aniversarios',
      subtitle: 'Reconoce los hitos de hoy y los próximos en una vista ligera.',
      sourceLabel: 'SharePoint list',
      items: sampleItems,
      hasPartialData: false,
      notes: [],
      today: new Date('2026-03-24T08:00:00.000Z'),
      request: {
        dataSourceTypes: ['SharePointList'],
        webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal',
        showBirthdays: false,
        showAnniversaries: true,
        daysAhead: 14
      }
    });

    expect(result.items.find((item) => item.id === 'today')).toBeUndefined();
    expect(result.items.find((item) => item.id === 'upcoming')).toBeDefined();
  });
});
