import { MicroSurveyService, PollServiceError } from './microSurveyService';
import { PollRepository } from '../repositories/pollRepository';

describe('MicroSurveyService', () => {
  it('classifies an active question as ready', async () => {
    const repository = {
      load: jest.fn().mockResolvedValue({
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
      submit: jest.fn()
    } as unknown as PollRepository;
    const service = new MicroSurveyService(repository, {
      displayName: 'Ada Lovelace',
      email: 'ada@contoso.com',
      loginName: 'i:0#.f|membership|ada@contoso.com'
    });

    const state = await service.resolveSurvey({
      description: 'Pulse',
      dataSourceType: 'StaticConfig',
      listTitleOrUrl: '',
      responsesListTitleOrUrl: '',
      apiEndpointUrl: '',
      questionText: '¿Te ayuda esta home?',
      optionsCsv: 'Si;No',
      oneResponsePerUser: true
    });

    expect(state.status).toBe('ready');
  });

  it('requires an option before submit', async () => {
    const repository = {
      load: jest.fn(),
      submit: jest.fn()
    } as unknown as PollRepository;
    const service = new MicroSurveyService(repository, {
      displayName: 'Ada Lovelace',
      email: 'ada@contoso.com',
      loginName: 'i:0#.f|membership|ada@contoso.com'
    });

    await expect(
      service.submitAnswer(
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
        {
          id: '1',
          question: '¿Te ayuda esta home?',
          options: [
            { id: 'si', label: 'Si' },
            { id: 'no', label: 'No' }
          ],
          source: 'StaticConfig'
        },
        undefined
      )
    ).rejects.toMatchObject({
      code: 'selectionRequired'
    } as Partial<PollServiceError>);
  });
});
