import type { IRecognitionsConfiguration } from '../models/recognitionsModels';
import type { IRecognitionsRepository } from '../repositories/recognitionsRepository';
import { loadRecognitionsViewModel } from './recognitionsService';

describe('recognitionsService', () => {
  const config: IRecognitionsConfiguration = {
    title: 'Reconocimientos',
    description: 'Feed del equipo',
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'RecognitionsList',
    maxItems: 5,
    showPhotos: true,
    webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
  };

  it('returns ready when the repository response is complete', async () => {
    const repository: IRecognitionsRepository = {
      load: async () => ({
        items: [
          {
            id: '1',
            targetName: 'Equipo Soporte',
            message: 'Excelente entrega',
            date: '2026-03-20T12:00:00.000Z',
            photoUrl: '/photo.png',
            detailUrl: '/detail'
          }
        ],
        warnings: [],
        sourceLabel: 'Static config',
        isFallback: false
      })
    };

    const viewModel = await loadRecognitionsViewModel(config, repository);

    expect(viewModel.state).toBe('ready');
    expect(viewModel.items).toHaveLength(1);
  });

  it('returns partialData when recognitions miss required metadata', async () => {
    const repository: IRecognitionsRepository = {
      load: async () => ({
        items: [
          {
            id: '2',
            targetName: 'People',
            message: 'Buena coordinación',
            date: '2026-03-19T08:00:00.000Z',
            photoUrl: '/photo.png'
          }
        ],
        warnings: [],
        sourceLabel: 'Static config',
        isFallback: false
      })
    };

    const viewModel = await loadRecognitionsViewModel(config, repository);

    expect(viewModel.state).toBe('partialData');
    expect(viewModel.hasPartialData).toBe(true);
  });

  it('returns error when the repository throws', async () => {
    const repository: IRecognitionsRepository = {
      load: async () => {
        throw new Error('Boom');
      }
    };

    const viewModel = await loadRecognitionsViewModel(config, repository);

    expect(viewModel.state).toBe('error');
    expect(viewModel.items).toHaveLength(0);
  });
});
