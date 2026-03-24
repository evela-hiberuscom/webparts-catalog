import * as React from 'react';
import type {
  IProfileBasedComponentViewModel,
  IProfileVariantRepository
} from '../models/profileBasedComponentModels';
import { createProfileVariantRepository } from '../repositories/profileVariantRepository';
import { createProfileBasedComponentService } from '../services/profileBasedComponentService';
import type { IProfileBasedComponentProps } from '../components/IProfileBasedComponentProps';

function createLoadingViewModel(props: IProfileBasedComponentProps): IProfileBasedComponentViewModel {
  return {
    state: 'loading',
    title: props.title,
    description: props.description,
    sourceLabel: 'Loading',
    currentTokens: [],
    matchedTokens: [],
    fallbackApplied: false,
    variants: [],
    message: 'Resolviendo la variante según el perfil...'
  };
}

function buildRepository(): IProfileVariantRepository {
  return createProfileVariantRepository({
    fetchJson: async (url: string, init?: RequestInit) => {
      const response = await fetch(url, {
        ...init,
        credentials: 'same-origin'
      });

      if (!response.ok) {
        throw new Error(`Request failed with status ${response.status}.`);
      }

      return response.json();
    }
  });
}

export function useProfileBasedComponent(props: IProfileBasedComponentProps): {
  viewModel: IProfileBasedComponentViewModel;
  reload: () => void;
} {
  const [version, setVersion] = React.useState(0);
  const [viewModel, setViewModel] = React.useState<IProfileBasedComponentViewModel>(() => createLoadingViewModel(props));

  React.useEffect(() => {
    let cancelled = false;
    setViewModel(createLoadingViewModel(props));

    const repository = buildRepository();
    const service = createProfileBasedComponentService(repository);

    service.resolve(
      {
        siteUrl: props.siteUrl,
        title: props.title,
        description: props.description,
        dataSourceType: props.dataSourceType,
        listTitleOrUrl: props.listTitleOrUrl,
        jsonUrl: props.jsonUrl,
        staticConfigJson: props.staticConfigJson,
        audienceMode: props.audienceMode,
        fallbackMode: props.fallbackMode,
        maxItems: props.maxItems
      },
      {
        siteUrl: props.siteUrl,
        displayName: props.displayName,
        email: props.email,
        loginName: props.loginName,
        profileTokens: props.profileTokens
      }
    ).then(
      (nextViewModel) => {
        if (!cancelled) {
          setViewModel(nextViewModel);
        }
      },
      () => undefined
    );

    return () => {
      cancelled = true;
    };
  }, [
    props.audienceMode,
    props.dataSourceType,
    props.description,
    props.displayName,
    props.email,
    props.fallbackMode,
    props.jsonUrl,
    props.listTitleOrUrl,
    props.maxItems,
    props.profileTokens,
    props.siteUrl,
    props.staticConfigJson,
    props.title,
    version
  ]);

  return {
    viewModel,
    reload: (): void => {
      setVersion((current) => current + 1);
    }
  };
}
