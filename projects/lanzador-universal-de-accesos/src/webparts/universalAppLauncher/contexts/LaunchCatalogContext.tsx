import * as React from 'react';
import { LaunchCatalogService } from '../services/launchCatalogService';
import { StaticLaunchRepository } from '../repositories/launchRepository';

export interface ILaunchCatalogContextValue {
  repository: StaticLaunchRepository;
  service: LaunchCatalogService;
}

const repository = new StaticLaunchRepository();
const service = new LaunchCatalogService(repository);

const defaultValue: ILaunchCatalogContextValue = {
  repository,
  service
};

const LaunchCatalogContext = React.createContext<ILaunchCatalogContextValue>(defaultValue);

export function LaunchCatalogProvider(props: React.PropsWithChildren<{ value?: ILaunchCatalogContextValue }>): React.ReactElement {
  return <LaunchCatalogContext.Provider value={props.value ?? defaultValue}>{props.children}</LaunchCatalogContext.Provider>;
}

export function useLaunchCatalogContext(): ILaunchCatalogContextValue {
  return React.useContext(LaunchCatalogContext);
}

export const defaultLaunchCatalogContext = defaultValue;

