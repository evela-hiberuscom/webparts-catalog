import * as React from 'react';
import type { IUseProjectStatusResult } from '../hooks/useProjectStatus';

const ProjectStatusContext = React.createContext<IUseProjectStatusResult | undefined>(undefined);

export function ProjectStatusProvider({
  value,
  children
}: {
  value: IUseProjectStatusResult;
  children: React.ReactNode;
}): React.ReactElement {
  return <ProjectStatusContext.Provider value={value}>{children}</ProjectStatusContext.Provider>;
}

export function useProjectStatusContext(): IUseProjectStatusResult {
  const context = React.useContext(ProjectStatusContext);

  if (!context) {
    throw new Error('useProjectStatusContext must be used within ProjectStatusProvider');
  }

  return context;
}
