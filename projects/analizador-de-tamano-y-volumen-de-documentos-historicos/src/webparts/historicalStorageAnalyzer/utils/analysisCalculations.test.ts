import {
  calculateHistoricalRatio,
  derivePrecisionState,
  formatBytes,
  formatPercent,
  formatRatio,
  sortDocumentsByHistoricalCost
} from './analysisCalculations';

describe('analysisCalculations', () => {
  it('formats bytes, percent and ratio consistently', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1536)).toBe('1.5 KB');
    expect(formatPercent(83.4)).toBe('83.4%');
    expect(formatRatio(2)).toBe('2.0x');
  });

  it('calculates ratios and document ordering by historical cost', () => {
    expect(calculateHistoricalRatio(300, 100)).toBe(3);

    const ordered = sortDocumentsByHistoricalCost([
      {
        id: 1,
        title: 'B',
        serverRelativeUrl: '/sites/demo/b.docx',
        currentSizeBytes: 100,
        historicalVersionCount: 2,
        historicalSizeBytes: 200,
        ratio: 2,
        precision: 'exact',
        warnings: []
      },
      {
        id: 2,
        title: 'A',
        serverRelativeUrl: '/sites/demo/a.docx',
        currentSizeBytes: 200,
        historicalVersionCount: 1,
        historicalSizeBytes: 200,
        ratio: 1,
        precision: 'exact',
        warnings: []
      }
    ]);

    expect(ordered[0].title).toBe('A');
    expect(ordered[1].title).toBe('B');
  });

  it('derives precision from coverage and throttling', () => {
    expect(derivePrecisionState({ coveragePercent: 100, partialCount: 0, throttled: false })).toBe('exact');
    expect(derivePrecisionState({ coveragePercent: 50, partialCount: 2, throttled: false })).toBe('partial');
    expect(derivePrecisionState({ coveragePercent: 0, partialCount: 0, throttled: true })).toBe('estimated');
  });
});
