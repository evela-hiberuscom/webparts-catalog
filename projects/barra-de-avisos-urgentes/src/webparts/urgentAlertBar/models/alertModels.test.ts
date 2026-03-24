import { normalizeSeverity } from '../utils/alertRules';

describe('alertModels', () => {
  it('normalizes severity values', () => {
    expect(normalizeSeverity('critical')).toBe('critical');
    expect(normalizeSeverity('Warning')).toBe('warning');
    expect(normalizeSeverity('anything-else')).toBe('unknown');
  });
});
