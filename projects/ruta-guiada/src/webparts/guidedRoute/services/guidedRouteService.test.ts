import type { GuidedRouteRepository } from '../repositories/guidedRouteRepository';
import type { IGuidedRouteConfiguration, IRouteStep } from '../models/guidedRouteModels';
import { GuidedRouteService } from './guidedRouteService';

const configuration: IGuidedRouteConfiguration = {
  dataSourceType: 'StaticConfig',
  listTitleOrUrl: '',
  routeTitle: 'Onboarding',
  maxSteps: 5
};

describe('GuidedRouteService', () => {
  it('returns ready state with route steps from the repository', async () => {
    const route: IRouteStep[] = [
      {
        id: 'step-1',
        title: 'Revisar documentación',
        description: 'Abre la guía de bienvenida.',
        linkUrl: '/sites/intranet/onboarding',
        icon: 'MapPin',
        order: 1
      }
    ];
    const repository = {
      getRoute: jest.fn().mockResolvedValue(route)
    } as unknown as GuidedRouteRepository;

    const state = await new GuidedRouteService(repository).loadRoute(configuration);

    expect(state).toEqual({ status: 'ready', data: route });
  });
});
