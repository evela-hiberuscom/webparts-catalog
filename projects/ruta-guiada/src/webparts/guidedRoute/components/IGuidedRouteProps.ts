import type { IGuidedRouteConfiguration } from '../models/guidedRouteModels';
import type { GuidedRouteService } from '../services/guidedRouteService';
export interface IGuidedRouteProps { configuration: IGuidedRouteConfiguration; service: GuidedRouteService; title?: string; }