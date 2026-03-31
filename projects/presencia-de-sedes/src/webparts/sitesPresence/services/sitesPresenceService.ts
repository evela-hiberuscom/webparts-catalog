import { ISitePresence, ISitesPresenceConfiguration, AsyncState } from '../models/sitesPresenceModels';
import { SitesPresenceRepository } from '../repositories/sitesPresenceRepository';
export class SitesPresenceService {
  private _repository: SitesPresenceRepository;
  constructor(repository: SitesPresenceRepository) { this._repository = repository; }
  async loadSites(config: ISitesPresenceConfiguration): Promise<AsyncState<ISitePresence[]>> {
    try { const sites = await this._repository.getSites(config); if (!sites?.length) return { status: 'empty' }; const hasPartialData = sites.some(s => !s.address || !s.hours); if (hasPartialData) return { status: 'partialData', data: sites, hasPartialData: true }; return { status: 'ready', data: sites }; }
    catch (error) { return { status: 'error', message: error instanceof Error ? error.message : 'Error desconocido' }; }
  }
}