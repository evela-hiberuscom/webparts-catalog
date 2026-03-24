import * as React from 'react';
import { DailyPulseService, type IDailyPulseService } from '../services/dailyPulseService';

const DailyPulseServiceContext = React.createContext<IDailyPulseService | undefined>(undefined);

export interface IDailyPulseProviderProps {
  children: React.ReactNode;
  service?: IDailyPulseService;
}

export function DailyPulseProvider(props: IDailyPulseProviderProps): React.ReactElement {
  const service = props.service ?? new DailyPulseService();

  return React.createElement(DailyPulseServiceContext.Provider, { value: service }, props.children);
}

export function useDailyPulseService(): IDailyPulseService {
  const service = React.useContext(DailyPulseServiceContext);
  if (!service) {
    throw new Error('DailyPulseProvider is required');
  }

  return service;
}

