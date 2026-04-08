import * as React from 'react';
import type {
  IRecognitionsConfiguration,
  IRecognitionsService,
  IRecognitionsViewModel
} from '../models/recognitionsModels';
import { describeSource } from '../utils/recognitionsUtils';

function createLoadingViewModel(configuration: IRecognitionsConfiguration): IRecognitionsViewModel {
  return {
    state: 'loading',
    title: configuration.title,
    description: configuration.description,
    sourceLabel: describeSource(configuration.dataSourceType, configuration.listTitleOrUrl),
    items: [],
    hasPartialData: false,
    warningMessages: []
  };
}

export function useRecognitions(options: {
  configuration: IRecognitionsConfiguration;
  service: IRecognitionsService;
}): IRecognitionsViewModel {
  const { configuration, service } = options;
  const [viewModel, setViewModel] = React.useState<IRecognitionsViewModel>(() =>
    createLoadingViewModel(configuration)
  );

  React.useEffect(() => {
    let active = true;

    setViewModel(createLoadingViewModel(configuration));

    service
      .load(configuration)
      .then((result) => {
        if (active) {
          setViewModel(result);
        }
      })
      .catch(() => {
        if (active) {
          setViewModel({
            ...createLoadingViewModel(configuration),
            state: 'error'
          });
        }
      });

    return () => {
      active = false;
    };
  }, [
    configuration.title,
    configuration.description,
    configuration.dataSourceType,
    configuration.listTitleOrUrl,
    configuration.maxItems,
    configuration.showPhotos,
    configuration.webAbsoluteUrl,
    service
  ]);

  return viewModel;
}
