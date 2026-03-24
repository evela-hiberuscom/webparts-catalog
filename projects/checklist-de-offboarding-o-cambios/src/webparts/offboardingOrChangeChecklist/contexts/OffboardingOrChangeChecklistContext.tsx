import * as React from 'react';
import { OffboardingOrChangeChecklistService, type IOffboardingOrChangeChecklistService } from '../services/offboardingOrChangeChecklistService';

const OffboardingChecklistServiceContext = React.createContext<IOffboardingOrChangeChecklistService | undefined>(undefined);

export interface IOffboardingOrChangeChecklistProviderProps {
  children: React.ReactNode;
  service?: IOffboardingOrChangeChecklistService;
}

export function OffboardingOrChangeChecklistProvider(props: IOffboardingOrChangeChecklistProviderProps): React.ReactElement {
  const service = props.service ?? new OffboardingOrChangeChecklistService();
  return React.createElement(OffboardingChecklistServiceContext.Provider, { value: service }, props.children);
}

export function useOffboardingOrChangeChecklistService(): IOffboardingOrChangeChecklistService {
  const service = React.useContext(OffboardingChecklistServiceContext);
  if (!service) {
    throw new Error('OffboardingOrChangeChecklistProvider is required');
  }

  return service;
}
