import { IRouteStep, IGuidedRouteConfiguration, AsyncState } from '../models/guidedRouteModels';
import { GuidedRouteRepository } from '../repositories/guidedRouteRepository';

export class GuidedRouteService {
  private _repository: GuidedRouteRepository;
  constructor(repository: GuidedRouteRepository) { this._repository = repository; }
  async loadRoute(config: IGuidedRouteConfiguration): Promise<AsyncState<IRouteStep[]>> {
    try { const route = await this._repository.getRoute(config); if (!route?.length) return { status: 'empty' }; return { status: 'ready', data: route }; }
    catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Error' }; }
  }
}