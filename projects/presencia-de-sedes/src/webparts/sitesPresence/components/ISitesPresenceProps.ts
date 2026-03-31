import type { ISitesPresenceConfiguration } from '../models/sitesPresenceModels';
import type { SitesPresenceService } from '../services/sitesPresenceService';
export interface ISitesPresenceProps { configuration: ISitesPresenceConfiguration; service: SitesPresenceService; title?: string; }