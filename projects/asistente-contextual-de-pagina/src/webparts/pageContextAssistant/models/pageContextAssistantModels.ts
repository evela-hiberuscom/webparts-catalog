export type PageContextAssistantDataSourceType = "SharePointList" | "JsonUrl" | "StaticConfig";

export type PageContextAssistantFallbackMode = "generic" | "empty";

export type PageContextAssistantViewState = "loading" | "ready" | "partialData" | "empty" | "error";

export interface IContextHelpLink {
  label: string;
  url: string;
}

export interface IContextHelpSourceRecord {
  [key: string]: unknown;
}

export interface IContextHelpRecord {
  id: string;
  contextKey: string;
  title: string;
  message: string;
  relatedLinks: IContextHelpLink[];
  isGeneric: boolean;
  isPartial: boolean;
  order: number;
  sourceType: PageContextAssistantDataSourceType;
}

export interface IPageContextAssistantWebPartProps {
  title: string;
  description: string;
  dataSourceType: PageContextAssistantDataSourceType;
  listTitleOrUrl: string;
  fallbackMode: PageContextAssistantFallbackMode;
  collapsedByDefault: boolean;
  contextKeyOverride: string;
}

export interface IPageContextAssistantRequest {
  webUrl: string;
  pageContextKey: string;
  dataSourceType: PageContextAssistantDataSourceType;
  listTitleOrUrl: string;
  fallbackMode: PageContextAssistantFallbackMode;
  contextKeyOverride?: string;
}

export interface IPageContextAssistantResult {
  status: PageContextAssistantViewState;
  items: IContextHelpRecord[];
  help?: IContextHelpRecord;
  sourceCount: number;
  matchedCount: number;
  usedFallback: boolean;
}

export interface IPageContextAssistantRepository {
  loadRecords(request: IPageContextAssistantRequest): Promise<IContextHelpSourceRecord[]>;
}

export interface IPageContextAssistantService {
  loadHelp(request: IPageContextAssistantRequest): Promise<IPageContextAssistantResult>;
}
