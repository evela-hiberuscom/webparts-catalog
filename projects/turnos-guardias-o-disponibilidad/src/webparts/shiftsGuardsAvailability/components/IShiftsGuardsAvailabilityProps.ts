import type { IShiftsGuardsConfiguration } from '../models/shiftsGuardsModels';
import type { ShiftsGuardsService } from '../services/shiftsGuardsService';
export interface IShiftsGuardsAvailabilityProps { configuration: IShiftsGuardsConfiguration; service: ShiftsGuardsService; title?: string; }