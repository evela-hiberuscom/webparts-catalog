import { IdeaSubmissionService } from './ideaSubmissionService';
import type { IIdeaDraft, IIdeaSubmissionRequest, IIdeaSubmissionResult } from '../models/ideaMailboxModels';

describe('IdeaSubmissionService', () => {
  const draft: IIdeaDraft = {
    title: 'Idea',
    description: 'Descripción',
    category: 'Procesos'
  };

  const request: IIdeaSubmissionRequest = {
    title: 'Buzón de ideas',
    subtitle: 'Comparte una propuesta sin fricción y con validación clara.',
    sourceType: 'JsonBridge',
    listTitleOrUrl: '',
    endpointUrl: '/api/ideas',
    allowAnonymous: true,
    showCategory: true,
    submitLabel: 'Enviar idea',
    categoryLabel: 'Categoría',
    userDisplayName: 'Ada Lovelace',
    pageUrl: 'https://contoso.sharepoint.com/sites/intranet'
  };

  it('builds the payload and forwards validated submissions to the repository', async () => {
    const validationService = {
      validateDraft: jest.fn().mockReturnValue({
        draft,
        errors: {},
        isValid: true
      })
    };

    const repository = {
      submitIdea: jest.fn<Promise<IIdeaSubmissionResult>, [IIdeaSubmissionRequest, unknown]>().mockResolvedValue({
        persisted: true,
        sourceLabel: 'JsonBridge',
        acknowledgement: 'idea-1',
        notes: ['ok']
      })
    };

    const service = new IdeaSubmissionService(repository as never, validationService as never);
    const payload = service.buildPayload(request, draft);
    const result = await service.submit(request, draft);

    expect(payload).toMatchObject({
      title: 'Idea',
      sourceType: 'JsonBridge',
      pageUrl: request.pageUrl
    });
    expect(validationService.validateDraft).toHaveBeenCalledWith(draft);
    expect(repository.submitIdea).toHaveBeenCalledWith(request, expect.objectContaining({ title: 'Idea' }));
    expect(result).toEqual({
      persisted: true,
      sourceLabel: 'JsonBridge',
      acknowledgement: 'idea-1',
      notes: ['ok']
    });
  });

  it('rejects invalid drafts before calling the repository', async () => {
    const validationService = {
      validateDraft: jest.fn().mockReturnValue({
        draft,
        errors: { title: 'El título es obligatorio.' },
        isValid: false
      })
    };

    const repository = {
      submitIdea: jest.fn()
    };

    const service = new IdeaSubmissionService(repository as never, validationService as never);

    await expect(service.submit(request, draft)).rejects.toThrow('Draft is invalid');
    expect(repository.submitIdea).not.toHaveBeenCalled();
  });
});
