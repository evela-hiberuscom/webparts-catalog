import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type {
  AsyncState,
  IFeaturedQuestion,
  IFeaturedQuestionConfiguration
} from '../models/featuredQuestionModels';
import type { FeaturedQuestionService } from '../services/featuredQuestionService';
import { useFeaturedQuestion } from './useFeaturedQuestion';

describe('useFeaturedQuestion', () => {
  let container: HTMLDivElement;

  const configuration: IFeaturedQuestionConfiguration = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'Questions',
    showVotes: true,
    allowMultipleVotes: false
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
    let resolveLoad: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      resolveLoad = resolve;
    });

    const service: FeaturedQuestionService = {
      loadQuestion: jest.fn(async (): Promise<AsyncState<IFeaturedQuestion[]>> => {
        await gate;

        return {
          status: 'ready',
          data: [
            {
              id: 'question-1',
              question: 'Which initiative should we prioritize?',
              context: 'Planning for the next quarter.',
              category: 'Strategy',
              authorName: 'PMO',
              authorPhotoUrl: undefined,
              options: [{ text: 'Automation', votes: 8 }],
              expiresAt: undefined
            }
          ]
        };
      })
    } as never;

    let latestStatus = '';
    let latestQuestion = '';

    function Probe(): null {
      const state = useFeaturedQuestion({ service, configuration });
      latestStatus = state.status;
      latestQuestion =
        state.status === 'ready' || state.status === 'partialData'
          ? state.data[0]?.question ?? ''
          : '';

      return null;
    }

    await act(async () => {
      ReactDOM.render(<Probe />, container);
    });

    expect(latestStatus).toBe('loading');

    await act(async () => {
      resolveLoad?.();
      await gate;
      await Promise.resolve();
    });

    expect(latestStatus).toBe('ready');
    expect(latestQuestion).toBe('Which initiative should we prioritize?');
  });
});
