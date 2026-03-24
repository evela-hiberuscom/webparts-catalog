import type {
  IRecycleBinSpaceCalculatorRuntimeContext,
  IRecycleBinSpaceCalculatorWebPartProps
} from '../models/recycleBinSpaceCalculatorModels';

export interface IRecycleBinSpaceCalculatorProps extends IRecycleBinSpaceCalculatorWebPartProps {
  runtimeContext: IRecycleBinSpaceCalculatorRuntimeContext;
}
