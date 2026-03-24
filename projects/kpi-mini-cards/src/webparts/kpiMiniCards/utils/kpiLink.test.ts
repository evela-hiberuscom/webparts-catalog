import { sanitizeKpiUrl, describeTrend, getBadgeLabel } from './kpiLink';

describe('kpiLink', () => {
  it('rejects dangerous protocols', () => {
    const dangerousUrl = ['java', 'script:alert(1)'].join('');
    expect(sanitizeKpiUrl(dangerousUrl, true)).toBeUndefined();
  });

  it('keeps safe relative links', () => {
    expect(sanitizeKpiUrl('/sites/finance', false)).toEqual({
      href: '/sites/finance',
      target: '_self',
      rel: undefined
    });
  });

  it('describes trend and badge labels', () => {
    expect(describeTrend('up')).toBe('Sube');
    expect(getBadgeLabel('warning')).toBe('Aviso');
  });
});
