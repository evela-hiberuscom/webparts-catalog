import * as React from 'react';
import { KpiCatalogService } from '../services/kpiCatalogService';

interface IKpiCatalogContextValue {
  service: KpiCatalogService;
}

const defaultValue: IKpiCatalogContextValue = {
  service: new KpiCatalogService()
};

const KpiCatalogContext = React.createContext<IKpiCatalogContextValue>(defaultValue);

export interface IKpiCatalogProviderProps {
  service?: KpiCatalogService;
  children: React.ReactNode;
}

export function KpiCatalogProvider(props: IKpiCatalogProviderProps): React.ReactElement {
  return <KpiCatalogContext.Provider value={{ service: props.service ?? defaultValue.service }}>{props.children}</KpiCatalogContext.Provider>;
}

export function useKpiCatalogService(): IKpiCatalogContextValue {
  return React.useContext(KpiCatalogContext);
}

