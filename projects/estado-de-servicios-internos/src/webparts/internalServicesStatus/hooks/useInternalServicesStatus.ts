import * as React from "react";
import type {
  IInternalServicesStatusRequest,
  IInternalServicesStatusResult,
  IInternalServicesStatusService
} from "../models/internalServicesStatusModels";

export interface IUseInternalServicesStatusResult {
  status: IInternalServicesStatusResult["status"] | "loading";
  result?: IInternalServicesStatusResult;
  error?: string;
  refresh: () => void;
}

type IUseInternalServicesStatusState = Omit<IUseInternalServicesStatusResult, "refresh">;

export function useInternalServicesStatus(
  service: IInternalServicesStatusService,
  request: IInternalServicesStatusRequest
): IUseInternalServicesStatusResult {
  const [state, setState] = React.useState<IUseInternalServicesStatusState>({
    status: "loading"
  });
  const [refreshToken, setRefreshToken] = React.useState(0);

  React.useEffect(() => {
    let active = true;

    setState({ status: "loading" });

    service
      .loadSnapshot(request)
      .then((result) => {
        if (!active) {
          return;
        }

        setState({
          status: result.status,
          result
        });
      })
      .catch((error: unknown) => {
        if (!active) {
          return;
        }

        setState({
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error"
        });
      });

    return () => {
      active = false;
    };
  }, [
    service,
    request.dataSourceType,
    request.listTitleOrUrl,
    request.autoRefreshSeconds,
    request.showOnlyCritical,
    request.staleThresholdMinutes,
    refreshToken
  ]);

  React.useEffect(() => {
    const autoRefreshSeconds = Number(request.autoRefreshSeconds ?? 0);

    if (!autoRefreshSeconds || autoRefreshSeconds <= 0) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setRefreshToken((current) => current + 1);
    }, autoRefreshSeconds * 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [request.autoRefreshSeconds]);

  return {
    ...state,
    refresh: () => setRefreshToken((current) => current + 1)
  };
}
