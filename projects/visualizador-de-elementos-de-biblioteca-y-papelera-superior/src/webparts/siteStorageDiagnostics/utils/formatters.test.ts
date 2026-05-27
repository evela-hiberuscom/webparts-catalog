import { formatBytes, formatDate, formatPercent } from './formatters';

describe('formatters', () => {
  describe('formatBytes', () => {
    it('formats undefined as dash', () => {
      expect(formatBytes(undefined)).toBe('—');
    });

    it('formats zero', () => {
      expect(formatBytes(0)).toBe('0 B');
    });

    it('formats bytes', () => {
      expect(formatBytes(512)).toBe('512 B');
    });

    it('formats kilobytes', () => {
      expect(formatBytes(1536)).toBe('1.5 KB');
    });

    it('formats megabytes', () => {
      expect(formatBytes(1048576)).toBe('1.0 MB');
    });

    it('formats gigabytes', () => {
      expect(formatBytes(1073741824)).toBe('1.0 GB');
    });
  });

  describe('formatDate', () => {
    it('formats undefined as dash', () => {
      expect(formatDate(undefined)).toBe('—');
    });

    it('formats ISO string', () => {
      const result = formatDate('2026-05-27T10:00:00Z');
      expect(result).not.toBe('—');
      expect(result.length).toBeGreaterThan(0);
    });
  });

  describe('formatPercent', () => {
    it('returns dash for undefined values', () => {
      expect(formatPercent(undefined, 100)).toBe('—');
      expect(formatPercent(100, undefined)).toBe('—');
    });

    it('returns dash for zero quota', () => {
      expect(formatPercent(50, 0)).toBe('—');
    });

    it('calculates percentage', () => {
      expect(formatPercent(80, 100)).toBe('80.0%');
    });
  });
});
