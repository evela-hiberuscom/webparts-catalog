import * as React from 'react';
import type { IRequestCatalogService } from '../models/startARequestModels';

const StartARequestServiceContext = React.createContext<IRequestCatalogService | undefined>(undefined);

export interface IStartARequestProviderProps {
  children?: React.ReactNode;
  service: IRequestCatalogService;
}

export function StartARequestProvider(props: IStartARequestProviderProps): React.ReactElement {
  return React.createElement(StartARequestServiceContext.Provider, { value: props.service }, props.children);
}

export function useStartARequestService(): IRequestCatalogService {
  const service = React.useContext(StartARequestServiceContext);
  if (!service) {
    throw new Error('StartARequestProvider is required');
  }

  return service;
}
