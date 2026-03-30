import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useMicroSurvey } from './useMicroSurvey';
import type { MicroSurveyService } from '../services/microSurveyService';

describe('useMicroSurvey', () => {
  it('loads state and submits a selected option', async () => {
    const service = {
      resolveSurvey: jest.fn().mockResolvedValue({
        status: 'ready',
        question: {
          id: '1',
          question: '¿Te ayuda esta home?',
          options: [
            { id: 'si', label: 'Si' },
            { id: 'no', label: 'No' }
          ],
          source: 'StaticConfig'
        },
        sourceLabel: 'StaticConfig',
        hasPartialData: false,
        notes: []
      }),
      submitAnswer: jest.fn().mockResolvedValue({
        confirmationMessage: 'Respuesta registrada.',
        submittedAt: '2026-03-30T10:00:00.000Z',
        selectedOption: 'Si'
      })
    } as unknown as MicroSurveyService;

    function Harness(): React.ReactElement {
      const state = useMicroSurvey(
        {
          description: 'Pulse',
          dataSourceType: 'StaticConfig',
          listTitleOrUrl: '',
          responsesListTitleOrUrl: '',
          apiEndpointUrl: '',
          questionText: '¿Te ayuda esta home?',
          optionsCsv: 'Si;No',
          oneResponsePerUser: true
        },
        service
      );

      return (
        <div>
          <span data-status={state.status}>{state.status}</span>
          <span data-submit={state.submitStatus}>{state.submitStatus}</span>
          <button
            type="button"
            onClick={() => {
              state.selectOption('Si');
            }}
          >
            select
          </button>
          <button
            type="button"
            onClick={() => {
              state.submit().catch(() => undefined);
            }}
          >
            submit
          </button>
        </div>
      );
    }

    const container = document.createElement('div');
    document.body.appendChild(container);

    await act(async () => {
      ReactDom.render(<Harness />, container);
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(container.querySelector('[data-status]')?.textContent).toBe('ready');

    await act(async () => {
      container.querySelectorAll('button')[0]?.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    });
    await act(async () => {
      container.querySelectorAll('button')[1]?.dispatchEvent(
        new MouseEvent('click', { bubbles: true })
      );
    });
    await act(async () => {
      await Promise.resolve();
    });

    expect(container.querySelector('[data-submit]')?.textContent).toBe('success');

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });
});
