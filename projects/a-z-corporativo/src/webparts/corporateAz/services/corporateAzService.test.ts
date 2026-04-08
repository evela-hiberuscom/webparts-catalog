import type { ICorporateAzConfiguration } from '../models/corporateAzModels';
import { CorporateAzService } from './corporateAzService';

describe('CorporateAzService', () => {
  const configuration: ICorporateAzConfiguration = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'CorporateAz',
    maxItems: 12
  };

  it('returns ready when entries are available', async () => {
    const service = new CorporateAzService({
      getEntries: async () => [{ id: '1', letter: 'A', title: 'Ausencias', description: undefined, linkUrl: '/absences' }]
    } as never);

    const result = await service.loadEntries(configuration);

    expect(result.status).toBe('ready');
  });

  it('returns empty when the repository returns no entries', async () => {
    const service = new CorporateAzService({
      getEntries: async () => []
    } as never);

    const result = await service.loadEntries(configuration);

    expect(result.status).toBe('empty');
  });

  it('returns error when the repository throws', async () => {
    const service = new CorporateAzService({
      getEntries: async () => {
        throw new Error('Boom');
      }
    } as never);

    const result = await service.loadEntries(configuration);

    expect(result.status).toBe('error');
  });
});
