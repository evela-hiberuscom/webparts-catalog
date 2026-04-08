import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type {
  IRecognitionsConfiguration,
  IRecognitionsService
} from '../models/recognitionsModels';
import { useRecognitions } from './useRecognitions';

describe('useRecognitions', () => {
  let container: HTMLDivElement;

  const configuration: IRecognitionsConfiguration = {
    title: 'Reconocimientos',
    description: 'Feed del equipo',
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'RecognitionsList',
    maxItems: 5,
    showPhotos: true,
    webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.innerHTML = '';
    container.remove();
  });

  it('transitions from loading to ready when the service resolves', async () => {
    let resolveLoad: () => void = () => undefined;
    const loadPromise = new Promise<void>((resolve) => {
      resolveLoad = resolve;
    });

    const service: IRecognitionsService = {
      load: jest.fn(async () => {
        await loadPromise;
        return {
          state: 'ready' as const,
          title: 'Reconocimientos',
          description: 'Feed del equipo',
          sourceLabel: 'Static config',
          items: [
            {
              id: '1',
              targetName: 'Equipo Soporte',
              message: 'Gracias',
              date: '2026-03-20T12:00:00.000Z',
              photoUrl: '/photo.png',
              detailUrl: '/detail',
              hasAction: true,
              hasPhoto: true,
              isPartial: false
            }
          ],
          hasPartialData: false,
          warningMessages: []
        };
      })
    };

    let latestState = '';
    let latestCount = 0;

    function Probe(): React.ReactElement | null {
      const viewModel = useRecognitions({ configuration, service });
      latestState = viewModel.state;
      latestCount = viewModel.items.length;
      return null;
    }

    await act(async () => {
      ReactDOM.render(<Probe />, container);
    });

    expect(latestState).toBe('loading');

    await act(async () => {
      resolveLoad();
      await loadPromise;
      await Promise.resolve();
    });

    expect(latestState).toBe('ready');
    expect(latestCount).toBe(1);
  });
});
