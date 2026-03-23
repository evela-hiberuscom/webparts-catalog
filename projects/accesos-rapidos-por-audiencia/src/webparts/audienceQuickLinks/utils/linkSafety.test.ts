import { resolveSafeLink } from './linkSafety';

describe('linkSafety', () => {
  it('rejects dangerous schemes', () => {
    const dangerousUrl = ['java', 'script:alert(1)'].join('');
    expect(resolveSafeLink(dangerousUrl)).toBeUndefined();
  });

  it('keeps internal links relative', () => {
    expect(resolveSafeLink('/sites/intranet')).toEqual({ href: '/sites/intranet' });
  });

  it('marks external links as safe external links', () => {
    expect(resolveSafeLink('https://example.com')).toEqual({
      href: 'https://example.com',
      rel: 'noopener noreferrer',
      target: '_blank'
    });
  });
});
