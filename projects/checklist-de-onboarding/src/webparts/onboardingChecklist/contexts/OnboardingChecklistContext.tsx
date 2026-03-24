import * as React from 'react';
import { OnboardingChecklistService, type IOnboardingChecklistService } from '../services/onboardingChecklistService';

const OnboardingChecklistServiceContext = React.createContext<IOnboardingChecklistService | undefined>(undefined);

export interface IOnboardingChecklistProviderProps {
  children: React.ReactNode;
  service?: IOnboardingChecklistService;
}

export function OnboardingChecklistProvider(props: IOnboardingChecklistProviderProps): React.ReactElement {
  const service = props.service ?? new OnboardingChecklistService();
  return React.createElement(OnboardingChecklistServiceContext.Provider, { value: service }, props.children);
}

export function useOnboardingChecklistService(): IOnboardingChecklistService {
  const service = React.useContext(OnboardingChecklistServiceContext);
  if (!service) {
    throw new Error('OnboardingChecklistProvider is required');
  }

  return service;
}
