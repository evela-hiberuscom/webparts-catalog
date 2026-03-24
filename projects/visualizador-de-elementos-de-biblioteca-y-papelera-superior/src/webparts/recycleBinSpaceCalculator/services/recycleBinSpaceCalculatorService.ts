import type {
  IRecycleBinSpaceCalculatorRequest,
  IRecycleBinSpaceCalculatorRuntimeContext,
  IRecycleBinSpaceCalculatorViewModel
} from '../models/recycleBinSpaceCalculatorModels';
import { RecycleBinSpaceCalculatorRepository } from '../repositories/recycleBinSpaceCalculatorRepository';
import { buildViewModel } from '../utils/recycleBinSpaceCalculatorUtils';

export class RecycleBinSpaceCalculatorService {
  public constructor(private readonly runtimeContext: IRecycleBinSpaceCalculatorRuntimeContext) {}

  public async load(request: IRecycleBinSpaceCalculatorRequest): Promise<IRecycleBinSpaceCalculatorViewModel> {
    const repository = new RecycleBinSpaceCalculatorRepository({
      siteUrl: this.runtimeContext.siteUrl,
      spHttpClient: this.runtimeContext.spHttpClient
    });

    const [stage1, stage2] = await Promise.all([repository.loadStage(1), repository.loadStage(2)]);

    return buildViewModel({
      siteUrl: this.runtimeContext.siteUrl,
      description: request.description,
      stage1,
      stage2,
      warningThresholdItems: request.warningThresholdItems,
      warningThresholdSizeMb: request.warningThresholdSizeMb
    });
  }
}
