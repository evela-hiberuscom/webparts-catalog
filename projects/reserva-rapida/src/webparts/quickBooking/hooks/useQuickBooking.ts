import * as React from 'react';
import type { IQuickBookingContext, IQuickBookingViewModel, IQuickBookingWebPartProps } from '../models/quickBookingModels';
import { createBookingResourcesRepository } from '../repositories/bookingResourcesRepository';
import {
  buildErrorViewModel,
  buildQuickBookingViewModel,
  createInitialQuickBookingState,
  updateSelectedCategory,
  updateSelectedSite
} from '../services/quickBookingService';

export interface IUseQuickBookingResult {
  model: IQuickBookingViewModel;
  setSelectedCategory: (category: string) => void;
  setSelectedSite: (site: string) => void;
  reload: () => void;
}

export function useQuickBooking(context: IQuickBookingContext, props: IQuickBookingWebPartProps): IUseQuickBookingResult {
  const [model, setModel] = React.useState<IQuickBookingViewModel>(() => ({
    ...createInitialQuickBookingState(props.defaultCategory),
    visibleResources: []
  }));
  const [reloadToken, setReloadToken] = React.useState(0);

  React.useEffect(() => {
    let cancelled = false;

    setModel({
      ...createInitialQuickBookingState(props.defaultCategory),
      visibleResources: []
    });

    try {
      const repository = createBookingResourcesRepository(context, props);

      repository
        .getResources()
        .then((resources) => {
          if (cancelled) {
            return;
          }

          setModel(buildQuickBookingViewModel(resources, props.defaultCategory, props.showAvailability));
        })
        .catch((error: unknown) => {
          if (cancelled) {
            return;
          }

          const message = error instanceof Error ? error.message : 'No se han podido cargar los recursos de reserva.';
          setModel(buildErrorViewModel(props.defaultCategory, message));
        });
    } catch (error: unknown) {
      if (!cancelled) {
        const message = error instanceof Error ? error.message : 'No se han podido cargar los recursos de reserva.';
        setModel(buildErrorViewModel(props.defaultCategory, message));
      }
    }

    return () => {
      cancelled = true;
    };
  }, [
    context.webUrl,
    props.dataSourceType,
    props.defaultCategory,
    props.listTitleOrUrl,
    props.resourcesJson,
    props.showAvailability,
    reloadToken
  ]);

  function setSelectedCategory(category: string): void {
    setModel((current) => updateSelectedCategory(current, category, props.showAvailability));
  }

  function setSelectedSite(site: string): void {
    setModel((current) => updateSelectedSite(current, site, props.showAvailability));
  }

  function reload(): void {
    setReloadToken((current) => current + 1);
    setModel((current) => ({ ...current, status: 'loading' }));
  }

  return {
    model,
    setSelectedCategory,
    setSelectedSite,
    reload
  };
}
