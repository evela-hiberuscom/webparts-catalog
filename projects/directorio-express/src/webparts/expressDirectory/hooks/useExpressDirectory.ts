import * as React from 'react';
import type { IExpressDirectoryProps, IExpressDirectoryState } from '../models/expressDirectoryModels';
import { ExpressDirectoryService } from '../services/ExpressDirectoryService';

export interface IExpressDirectoryActions {
  refresh: () => void;
  setQuery: (value: string) => void;
  setSelectedArea: (value: string) => void;
}

export interface IExpressDirectoryHookResult extends IExpressDirectoryState {
  actions: IExpressDirectoryActions;
}

export function useExpressDirectory(props: IExpressDirectoryProps): IExpressDirectoryHookResult {
  const [service] = React.useState(() => new ExpressDirectoryService(props.context));
  const [query, setQuery] = React.useState('');
  const [selectedArea, setSelectedArea] = React.useState(props.defaultAreaFilter || '');
  const [status, setStatus] = React.useState<IExpressDirectoryState['status']>('loading');
  const [errorMessage, setErrorMessage] = React.useState<string | undefined>();
  const [items, setItems] = React.useState<IExpressDirectoryState['items']>([]);
  const [areas, setAreas] = React.useState<string[]>([]);
  const [hasPartialData, setHasPartialData] = React.useState(false);
  const [sourceLabels, setSourceLabels] = React.useState<string[]>([]);
  const [warnings, setWarnings] = React.useState<string[]>([]);
  const [reloadToken, setReloadToken] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;
    setStatus('loading');
    setErrorMessage(undefined);

    service
      .load(
        {
          webUrl: props.context.pageContext.web.absoluteUrl,
          query,
          selectedArea,
          dataSourceTypesCsv: props.dataSourceTypesCsv,
          listTitleOrUrl: props.listTitleOrUrl,
          jsonUrl: props.jsonUrl,
          staticPeopleJson: props.staticPeopleJson,
          maxItems: props.maxItems,
          defaultAreaFilter: props.defaultAreaFilter
        },
        { query, selectedArea }
      )
      .then((nextState) => {
        if (cancelled) {
          return;
        }

        setStatus(nextState.status);
        setItems(nextState.items);
        setAreas(nextState.areas);
        setHasPartialData(nextState.hasPartialData);
        setSourceLabels(nextState.sourceLabels);
        setWarnings(nextState.warnings);
        setErrorMessage(nextState.errorMessage);
      })
      .catch((error: unknown) => {
        if (cancelled) {
          return;
        }

        setStatus('error');
        setErrorMessage(error instanceof Error ? error.message : 'directory-error');
        setItems([]);
        setAreas([]);
        setHasPartialData(false);
        setSourceLabels([]);
        setWarnings([]);
      });

    return () => {
      cancelled = true;
    };
  }, [
    props.context.pageContext.web.absoluteUrl,
    props.dataSourceTypesCsv,
    props.defaultAreaFilter,
    props.jsonUrl,
    props.listTitleOrUrl,
    props.maxItems,
    props.staticPeopleJson,
    query,
    reloadToken,
    selectedArea,
    service
  ]);

  return {
    status,
    errorMessage,
    items,
    areas,
    hasPartialData,
    sourceLabels,
    warnings,
    query,
    selectedArea,
    actions: {
      refresh: (): void => {
        setReloadToken((current) => current + 1);
      },
      setQuery,
      setSelectedArea
    }
  };
}
