import * as React from 'react';
import type { IRecentAccessesConfig, IRecentAccessesViewState } from '../models/recentAccesses.types';
import { useRecentAccesses } from '../hooks/useRecentAccesses';

type RecentAccessesContextValue = IRecentAccessesViewState & {
  reload: () => void;
  config: IRecentAccessesConfig;
};

const RecentAccessesContext = React.createContext<RecentAccessesContextValue | undefined>(undefined);

export interface IRecentAccessesProviderProps {
  config: IRecentAccessesConfig;
  children: React.ReactNode;
}

export function RecentAccessesProvider(props: IRecentAccessesProviderProps): React.ReactElement<IRecentAccessesProviderProps> {
  const viewState = useRecentAccesses(props.config);

  return (
    <RecentAccessesContext.Provider
      value={{
        ...viewState,
        config: props.config
      }}
    >
      {props.children}
    </RecentAccessesContext.Provider>
  );
}

export function useRecentAccessesContext(): RecentAccessesContextValue {
  const context = React.useContext(RecentAccessesContext);
  if (!context) {
    throw new Error('useRecentAccessesContext must be used within a RecentAccessesProvider.');
  }

  return context;
}
