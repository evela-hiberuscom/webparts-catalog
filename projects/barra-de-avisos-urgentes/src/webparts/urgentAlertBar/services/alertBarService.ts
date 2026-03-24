import type { IAlertBarRequest, IAlertBarService, IAlertBarViewModel } from '../models/alertModels';
import { isAlertActive, isAlertPartial, limitAlerts, sortAlerts } from '../utils/alertRules';
import type { AlertsRepository } from '../repositories/alertsRepository';

export class AlertBarService implements IAlertBarService {
  public constructor(private readonly repository: AlertsRepository) {}

  public async load(request: IAlertBarRequest, now: Date = new Date()): Promise<IAlertBarViewModel> {
    const result = await this.repository.load(request);
    const activeItems = result.items.filter((item) => isAlertActive(item, now));
    const sortedItems = limitAlerts(sortAlerts(activeItems), request.maxAlerts);
    const hasPartialData =
      result.hasPartialData || result.items.some((item) => isAlertPartial(item)) || activeItems.some((item) => isAlertPartial(item));

    return {
      items: sortedItems,
      hasPartialData,
      sourceLabel: result.sourceLabel
    };
  }
}
