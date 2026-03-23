import * as React from "react";
import type {
  IPageContextAssistantRequest,
  IPageContextAssistantResult,
  IPageContextAssistantService,
  PageContextAssistantViewState
} from "../models/pageContextAssistantModels";

export interface IUsePageContextAssistantResult {
  status: PageContextAssistantViewState | "loading";
  result?: IPageContextAssistantResult;
  error?: string;
  isExpanded: boolean;
  refresh: () => void;
  toggleExpanded: () => void;
}

export function usePageContextAssistant(
  service: IPageContextAssistantService,
  request: IPageContextAssistantRequest,
  collapsedByDefault: boolean
): IUsePageContextAssistantResult {
  const [status, setStatus] = React.useState<IUsePageContextAssistantResult["status"]>("loading");
  const [result, setResult] = React.useState<IPageContextAssistantResult | undefined>();
  const [error, setError] = React.useState<string | undefined>();
  const [refreshToken, setRefreshToken] = React.useState(0);
  const [isExpanded, setIsExpanded] = React.useState<boolean>(!collapsedByDefault);

  React.useEffect(() => {
    let active = true;

    setStatus("loading");
    setError(undefined);

    service
      .loadHelp(request)
      .then((nextResult) => {
        if (!active) {
          return;
        }

        setResult(nextResult);
        setStatus(nextResult.status);
      })
      .catch((loadError: unknown) => {
        if (!active) {
          return;
        }

        setStatus("error");
        setResult(undefined);
        setError(loadError instanceof Error ? loadError.message : "Unknown error");
      });

    return () => {
      active = false;
    };
  }, [
    request.contextKeyOverride,
    request.dataSourceType,
    request.fallbackMode,
    request.listTitleOrUrl,
    request.pageContextKey,
    service,
    refreshToken
  ]);

  return {
    status,
    result,
    error,
    isExpanded,
    refresh: () => setRefreshToken((current) => current + 1),
    toggleExpanded: () => setIsExpanded((current) => !current)
  };
}
