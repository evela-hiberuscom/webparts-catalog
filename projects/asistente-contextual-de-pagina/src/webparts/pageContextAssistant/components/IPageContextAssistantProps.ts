import type {
  IPageContextAssistantRequest,
  IPageContextAssistantService
} from "../models/pageContextAssistantModels";

export interface IPageContextAssistantProps {
  title: string;
  description: string;
  userDisplayName: string;
  collapsedByDefault: boolean;
  service: IPageContextAssistantService;
  request: IPageContextAssistantRequest;
}
