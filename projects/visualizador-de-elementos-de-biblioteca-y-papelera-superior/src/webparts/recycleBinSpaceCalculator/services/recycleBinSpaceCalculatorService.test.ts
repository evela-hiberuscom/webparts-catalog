import { RecycleBinSpaceCalculatorService } from './recycleBinSpaceCalculatorService';

describe('RecycleBinSpaceCalculatorService', () => {
  it('builds a partial view model when one stage is unavailable', async () => {
    const get = jest.fn(async (url: string) => {
      if (url.includes('/_api/web/RecycleBin')) {
        return {
          ok: true,
          status: 200,
          json: async () => ({
            value: [
              {
                Id: '1',
                LeafName: 'Documento.docx',
                DeletedDate: '2026-03-24T10:00:00Z',
                DirName: '/sites/portal/Shared Documents',
                Size: 2048
              }
            ]
          })
        };
      }

      return {
        ok: false,
        status: 403,
        json: async () => ({})
      };
    });

    const service = new RecycleBinSpaceCalculatorService({
      siteUrl: 'https://contoso.sharepoint.com/sites/portal',
      spHttpClient: { get } as never
    });

    const viewModel = await service.load({
      siteUrl: 'https://contoso.sharepoint.com/sites/portal',
      description: 'Diagnóstico de papelera',
      showStageBreakdown: true,
      refreshIntervalSeconds: 0,
      warningThresholdItems: 1,
      warningThresholdSizeMb: 1
    });

    expect(viewModel.stage1.isAccessible).toBe(true);
    expect(viewModel.stage2.isAccessible).toBe(false);
    // Stage 2 inaccessibility is expected for non-admin users: totals use stage 1 data.
    expect(viewModel.stage2PermissionLimited).toBe(true);
    expect(viewModel.hasPartialData).toBe(false);
    expect(viewModel.totalSizeBytes).toBe(2048);
  });
});
