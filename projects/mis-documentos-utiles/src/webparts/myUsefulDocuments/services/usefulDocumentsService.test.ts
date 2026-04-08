import type { IUsefulDocumentsConfiguration } from '../models/usefulDocumentModels';
import type { UsefulDocumentsRepository } from '../repositories/usefulDocumentsRepository';
import { UsefulDocumentsService } from './usefulDocumentsService';

describe('UsefulDocumentsService', () => {
  const configuration: IUsefulDocumentsConfiguration = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: '',
    maxItems: 6,
    defaultCategory: undefined
  };

  it('returns ready when the repository response is complete', async () => {
    const repository = {
      getDocuments: jest.fn(async () => [
        {
          id: 'doc-1',
          title: 'Manual corporativo',
          category: 'Políticas',
          updatedAt: '2026-04-01T10:00:00.000Z',
          owner: 'People',
          openUrl: '/sites/docs/manual.pdf',
          priority: 'featured'
        }
      ])
    } as unknown as UsefulDocumentsRepository;

    const service = new UsefulDocumentsService(repository);
    const result = await service.loadDocuments(configuration);

    expect(result.status).toBe('ready');
  });

  it('returns partialData when documents miss metadata', async () => {
    const repository = {
      getDocuments: jest.fn(async () => [
        {
          id: 'doc-2',
          title: 'Plantilla',
          category: undefined,
          updatedAt: '2026-04-01T10:00:00.000Z',
          owner: undefined,
          openUrl: undefined,
          priority: 'normal'
        }
      ])
    } as unknown as UsefulDocumentsRepository;

    const service = new UsefulDocumentsService(repository);
    const result = await service.loadDocuments(configuration);

    expect(result.status).toBe('partialData');
  });
});
