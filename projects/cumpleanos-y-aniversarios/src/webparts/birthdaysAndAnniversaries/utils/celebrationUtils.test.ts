import {
  formatCelebrationDateLabel,
  getDaysRemaining,
  normalizeCelebrationType,
  normalizeListReference,
  parseDataSourceTypes
} from './celebrationUtils';

describe('celebrationUtils', () => {
  it('parses and deduplicates data source types', () => {
    expect(parseDataSourceTypes('Directory, SharePointList, Directory, JsonUrl')).toEqual(['Directory', 'SharePointList', 'JsonUrl']);
  });

  it('normalizes SharePoint list urls from view urls to list roots', () => {
    expect(normalizeListReference('/sites/portal/Lists/PeopleCelebrations/Forms/AllItems.aspx?view=1', 'https://contoso.sharepoint.com/sites/portal')).toEqual({
      mode: 'url',
      value: '/sites/portal/Lists/PeopleCelebrations'
    });
  });

  it('computes days remaining and today labels', () => {
    expect(getDaysRemaining('2026-03-24T10:00:00.000Z', new Date('2026-03-24T08:00:00.000Z'))).toBe(0);
    expect(formatCelebrationDateLabel('2026-03-24T10:00:00.000Z', new Date('2026-03-24T08:00:00.000Z'))).toBe('Hoy');
  });

  it('normalizes celebration type aliases', () => {
    expect(normalizeCelebrationType('cumpleaños')).toBe('birthday');
    expect(normalizeCelebrationType('aniversario')).toBe('anniversary');
    expect(normalizeCelebrationType(undefined)).toBe('unknown');
  });
});

