import * as React from 'react';
import { IApprovalsAggregationService } from '../models/myApprovalsModels';

export interface IMyApprovalsContextValue {
  service?: IApprovalsAggregationService;
}

export const MyApprovalsContext = React.createContext<IMyApprovalsContextValue>({});

export interface IMyApprovalsProviderProps extends React.PropsWithChildren<IMyApprovalsContextValue> {}

export function MyApprovalsProvider(props: IMyApprovalsProviderProps): React.ReactElement<IMyApprovalsProviderProps> {
  const { children, service } = props;
  return (
    <MyApprovalsContext.Provider value={{ service }}>
      {children}
    </MyApprovalsContext.Provider>
  );
}

export function useMyApprovalsContext(): IMyApprovalsContextValue {
  return React.useContext(MyApprovalsContext);
}
