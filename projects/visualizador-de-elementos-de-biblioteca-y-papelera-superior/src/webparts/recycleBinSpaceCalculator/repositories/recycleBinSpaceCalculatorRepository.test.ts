import { RecycleBinSpaceCalculatorRepository } from './recycleBinSpaceCalculatorRepository';

describe('RecycleBinSpaceCalculatorRepository', () => {
  it('loads the first stage recycle bin from web recycle bin endpoint', async () => {
    const get = jest.fn(async () => ({
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
    }));

    const repository = new RecycleBinSpaceCalculatorRepository({
      siteUrl: 'https://contoso.sharepoint.com/sites/portal',
      spHttpClient: { get } as never
    });

    const stage1 = await repository.loadStage(1);

    expect(get).toHaveBeenCalledWith(
      'https://contoso.sharepoint.com/sites/portal/_api/web/RecycleBin',
      undefined,
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json;odata=nometadata'
        })
      })
    );
    expect(stage1.itemCount).toBe(1);
    expect(stage1.sizeBytes).toBe(2048);
  });

  it('marks second stage as unavailable when the request fails', async () => {
    const get = jest.fn(async () => ({
      ok: false,
      status: 403,
      json: async () => ({})
    }));

    const repository = new RecycleBinSpaceCalculatorRepository({
      siteUrl: 'https://contoso.sharepoint.com/sites/portal',
      spHttpClient: { get } as never
    });

    const stage2 = await repository.loadStage(2);

    expect(stage2.isAccessible).toBe(false);
    expect(stage2.precision).toBe('partial');
    expect(stage2.errorMessage).toContain('HTTP 403');
  });
});
