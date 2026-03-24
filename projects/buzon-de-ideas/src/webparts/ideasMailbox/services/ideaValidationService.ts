import type { IIdeaDraft, IIdeaValidationResult } from "../models/ideaMailboxModels";
import { validateIdeaDraft } from "../utils/ideaMailboxUtils";

export class IdeaValidationService {
  public validateDraft(draft: IIdeaDraft): IIdeaValidationResult {
    return validateIdeaDraft(draft);
  }
}
