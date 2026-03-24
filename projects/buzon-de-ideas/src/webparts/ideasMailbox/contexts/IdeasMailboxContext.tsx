import * as React from "react";
import { IdeasRepository } from "../repositories/ideasRepository";
import { IdeaSubmissionService } from "../services/ideaSubmissionService";
import { IdeaValidationService } from "../services/ideaValidationService";

export interface IIdeasMailboxServices {
  submissionService: IdeaSubmissionService;
  validationService: IdeaValidationService;
}

const IdeasMailboxContext = React.createContext<IIdeasMailboxServices | undefined>(undefined);

export interface IIdeasMailboxProviderProps {
  children: React.ReactNode;
  services?: IIdeasMailboxServices;
}

export function IdeasMailboxProvider(props: IIdeasMailboxProviderProps): React.ReactElement {
  const services = React.useMemo(
    () =>
      props.services ?? {
        validationService: new IdeaValidationService(),
        submissionService: new IdeaSubmissionService(new IdeasRepository(), new IdeaValidationService())
      },
    [props.services]
  );

  return <IdeasMailboxContext.Provider value={services}>{props.children}</IdeasMailboxContext.Provider>;
}

export function useIdeasMailboxServices(): IIdeasMailboxServices {
  const value = React.useContext(IdeasMailboxContext);
  if (!value) {
    throw new Error("IdeasMailboxProvider is missing");
  }

  return value;
}
