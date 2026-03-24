import {
  aggregateStage,
  buildRecycleBinPageUrl,
  buildRecycleBinUrl,
  coerceRecycleBinItem,
  evaluateHealth,
  formatBytes
} from './recycleBinSpaceCalculatorUtils';

describe('recycleBinSpaceCalculatorUtils', () => {
  it('formats bytes into readable units', () => {
    expect(formatBytes(0)).toBe('0 B');
    expect(formatBytes(1048576)).toBe('1 MB');
  });

  it('builds recycle bin endpoints for both stages', () => {
    expect(buildRecycleBinUrl('https://contoso.sharepoint.com/sites/portal', 1)).toBe(
      'https://contoso.sharepoint.com/sites/portal/_api/web/RecycleBin'
    );
    expect(buildRecycleBinUrl('https://contoso.sharepoint.com/sites/portal', 2)).toBe(
      'https://contoso.sharepoint.com/sites/portal/_api/site/RecycleBin'
    );
    expect(buildRecycleBinPageUrl('https://contoso.sharepoint.com/sites/portal')).toContain('/_layouts/15/RecycleBin.aspx');
  });

  it('coerces recycle bin items and aggregates stage data', () => {
    const item = coerceRecycleBinItem(
      {
        Id: '1',
        LeafName: 'Documento.docx',
        DeletedDate: '2026-03-24T10:00:00Z',
        DirName: '/sites/portal/Shared Documents',
        Size: 2048
      },
      1
    );

    const stage = aggregateStage([item], 1);

    expect(stage.itemCount).toBe(1);
    expect(stage.sizeBytes).toBe(2048);
    expect(stage.precision).toBe('exact');
  });

  it('elevates health when thresholds are exceeded', () => {
    const stage1 = aggregateStage(
      [
        {
          id: '1',
          stage: 1,
          title: 'A',
          deletedDate: null,
          path: null,
          sizeBytes: 1024 * 1024 * 600
        }
      ],
      1
    );
    const stage2 = aggregateStage([], 2);
    const health = evaluateHealth({
      stage1,
      stage2,
      warningThresholdItems: 1,
      warningThresholdSizeMb: 512
    });

    expect(health.level).toBe('critical');
  });
});
