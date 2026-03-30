import {
  normalizeListReference,
  parsePollOptions
} from './pollUtils';

describe('pollUtils', () => {
  it('parses unique options from delimited text', () => {
    const options = parsePollOptions('Si;No;Parcialmente;Si');

    expect(options.map((option) => option.label)).toEqual([
      'Si',
      'No',
      'Parcialmente'
    ]);
  });

  it('normalizes SharePoint AllItems list URLs', () => {
    const reference = normalizeListReference(
      'https://contoso.sharepoint.com/sites/portal/Lists/Polls/Forms/AllItems.aspx?viewid=123',
      'https://contoso.sharepoint.com/sites/portal'
    );

    expect(reference.kind).toBe('url');
    if (reference.kind === 'url') {
      expect(reference.serverRelativeUrl).toBe('/sites/portal/Lists/Polls');
    }
  });
});
