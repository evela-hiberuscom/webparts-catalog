import { PollRepository } from './pollRepository';
import type {
  FetchLike,
  IKeyValueStorageLike,
  ISharePointHttpClientLike
} from '../models/pollModels';

function createRepository(storage?: IKeyValueStorageLike): PollRepository {
  return new PollRepository({
    fetchClient: (jest.fn() as unknown) as FetchLike,
    spHttpClient: {
      get: jest.fn(),
      post: jest.fn()
    } as unknown as ISharePointHttpClientLike,
    spHttpClientConfiguration: {},
    storage: storage || {
      getItem: jest.fn().mockReturnValue(undefined),
      setItem: jest.fn()
    },
    webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/portal'
  });
}

describe('PollRepository', () => {
  it('loads static config and existing local answer', async () => {
    const storage: IKeyValueStorageLike = {
      getItem: jest
        .fn()
        .mockReturnValue(
          JSON.stringify({ selectedOption: 'Si', submittedAt: '2026-03-30T10:00:00.000Z' })
        ),
      setItem: jest.fn()
    };
    const repository = createRepository(storage);

    const response = await repository.load(
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
        displayName: 'Ada Lovelace',
        email: 'ada@contoso.com',
        loginName: 'i:0#.f|membership|ada@contoso.com'
      }
    );

    expect(response.question?.question).toBe('¿Te ayuda esta home?');
    expect(response.existingSubmission?.selectedOption).toBe('Si');
  });

  it('stores static submissions in local storage', async () => {
    const storage: IKeyValueStorageLike = {
      getItem: jest.fn().mockReturnValue(undefined),
      setItem: jest.fn()
    };
    const repository = createRepository(storage);

    const response = await repository.submit(
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
        displayName: 'Ada Lovelace',
        email: 'ada@contoso.com',
        loginName: 'i:0#.f|membership|ada@contoso.com'
      },
      {
        id: 'static-microencuesta',
        question: '¿Te ayuda esta home?',
        options: [
          { id: 'si', label: 'Si' },
          { id: 'no', label: 'No' }
        ],
        source: 'StaticConfig'
      },
      {
        questionId: 'static-microencuesta',
        selectedOption: 'Si'
      }
    );

    expect(response.selectedOption).toBe('Si');
    expect(storage.setItem).toHaveBeenCalled();
  });
});
