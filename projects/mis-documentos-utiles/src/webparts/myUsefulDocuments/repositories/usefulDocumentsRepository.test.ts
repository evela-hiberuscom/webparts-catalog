import type { IUsefulDocumentsConfiguration } from '../models/usefulDocumentModels';
import { UsefulDocumentsRepository } from './usefulDocumentsRepository';

describe('UsefulDocumentsRepository', () => {
  const baseConfiguration: IUsefulDocumentsConfiguration = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: '',
    maxItems: 6,
    defaultCategory: undefined
  };

  it('returns the static dataset', async () => {
    const repository = new UsefulDocumentsRepository({
      fetchClient: jest.fn() as unknown as typeof fetch,
      spHttpClient: {} as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
    });

    const result = await repository.getDocuments(baseConfiguration);

    expect(result).toHaveLength(3);
    expect(result[0]?.priority).toBe('featured');
  });

  it('loads same-origin json payloads', async () => {
    const fetchClient = jest.fn(async () => ({
      ok: true,
      json: async () => ({
        items: [
          {
            id: 'doc-1',
            title: 'Guía de uso',
            category: 'Guías',
            updatedAt: '2026-04-01T10:00:00.000Z',
            owner: 'IT',
            openUrl: '/sites/docs/guia.pdf',
            priority: 'frequent'
          }
        ]
      })
    })) as unknown as typeof fetch;

    const repository = new UsefulDocumentsRepository({
      fetchClient,
      spHttpClient: {} as never,
      spHttpClientConfiguration: {} as never,
      webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
    });

    const result = await repository.getDocuments({
      ...baseConfiguration,
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/sites/demo/siteassets/documents.json'
    });

    expect(fetchClient).toHaveBeenCalled();
    expect(result[0]?.title).toBe('Guía de uso');
  });
});
