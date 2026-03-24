import type {
  IIdeaDraft,
  IIdeaSubmissionPayload,
  IIdeaSubmissionRequest,
  IIdeaSubmissionResult
} from "../models/ideaMailboxModels";
import { buildIdeaSubmissionPayload, IdeasRepository } from "../repositories/ideasRepository";
import { IdeaValidationService } from "./ideaValidationService";

export class IdeaSubmissionService {
  public constructor(
    private readonly repository: IdeasRepository = new IdeasRepository(),
    private readonly validationService: IdeaValidationService = new IdeaValidationService()
  ) {}

  public validateDraft(draft: IIdeaDraft): ReturnType<IdeaValidationService["validateDraft"]> {
    return this.validationService.validateDraft(draft);
  }

  public buildPayload(request: IIdeaSubmissionRequest, draft: IIdeaDraft): IIdeaSubmissionPayload {
    return buildIdeaSubmissionPayload(request, draft);
  }

  public async submit(request: IIdeaSubmissionRequest, draft: IIdeaDraft): Promise<IIdeaSubmissionResult> {
    const validation = this.validationService.validateDraft(draft);
    if (!validation.isValid) {
      throw new Error("Draft is invalid");
    }

    const payload = buildIdeaSubmissionPayload(request, validation.draft);
    return this.repository.submitIdea(request, payload);
  }
}
