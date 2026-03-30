import * as React from 'react';
import * as strings from 'PortalMapWebPartStrings';
import type { IPortalMapRequest, IPortalMapSnapshot } from '../models/portalMapModels';
import { PortalMapService } from '../services/portalMapService';

function createLoadingSnapshot(request: IPortalMapRequest): IPortalMapSnapshot {
  return {
    state: 'loading',
    roots: [],
    flatItems: [],
    groupedItems: [],
    sourceLabel: request.dataSourceType === 'StaticConfig' ? strings.SourceLabelStaticConfig : '',
    hasPartialData: false,
    notes: [],
    errorMessage: undefined,
    resolvedViewMode: request.viewMode
  };
}

function createErrorSnapshot(request: IPortalMapRequest): IPortalMapSnapshot {
  return {
    state: 'error',
    roots: [],
    flatItems: [],
    groupedItems: [],
    sourceLabel: '',
    hasPartialData: false,
    notes: [],
    errorMessage: strings.StateErrorMessage,
    resolvedViewMode: request.viewMode
  };
}

export function usePortalMap(
  request: IPortalMapRequest,
  service?: PortalMapService
): IPortalMapSnapshot {
  const serviceRef = React.useRef<PortalMapService>(service || new PortalMapService());
  const [snapshot, setSnapshot] = React.useState<IPortalMapSnapshot>(createLoadingSnapshot(request));

  React.useEffect(() => {
    serviceRef.current = service || new PortalMapService();
  }, [service]);

  React.useEffect(() => {
    let active = true;
    setSnapshot(createLoadingSnapshot(request));

    serviceRef.current
      .resolve(request)
      .then((resolved) => {
        if (active) {
          setSnapshot(resolved);
        }
      })
      .catch(() => {
        if (active) {
          setSnapshot(createErrorSnapshot(request));
        }
      });

    return () => {
      active = false;
    };
  }, [request.dataSourceType, request.listTitleOrUrl, request.maxDepth, request.viewMode, request.webUrl]);

  return snapshot;
}
