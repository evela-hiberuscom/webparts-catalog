import type { IExpressDirectorySourceRequest, IExpressDirectorySourceResult } from '../models/expressDirectoryModels';

export interface IExpressDirectorySourceRepository {
  load(request: IExpressDirectorySourceRequest): Promise<IExpressDirectorySourceResult>;
}

