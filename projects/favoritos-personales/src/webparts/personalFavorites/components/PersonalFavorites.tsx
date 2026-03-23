import * as React from 'react';
import { Icon, Text } from '@fluentui/react';

import type { IFavoriteLoadConfig, IPersonalFavoritesWebPartProps } from '../models/favoritesTypes';
import { useFavorites } from '../hooks/useFavorites';
import { FavoritesGrid } from './FavoritesGrid';
import { FavoritesState } from './FavoritesState';
import styles from './PersonalFavorites.module.scss';

interface IFavoritesRuntimeContext {
  pageContext: {
    user: {
      displayName: string;
    };
    web: {
      absoluteUrl: string;
    };
    legacyPageContext: {
      userId: number;
    };
  };
}

export interface IPersonalFavoritesProps extends IPersonalFavoritesWebPartProps {
  userDisplayName: string;
  webPartContext: IFavoritesRuntimeContext;
}

function buildConfig(props: IPersonalFavoritesProps): IFavoriteLoadConfig {
  return {
    title: props.title,
    description: props.description,
    dataSourceType: props.dataSourceType,
    listTitleOrUrl: props.listTitleOrUrl,
    maxItems: props.maxItems,
    showMetadata: props.showMetadata,
    favoritesJson: props.favoritesJson,
    userDisplayName: props.userDisplayName,
    webAbsoluteUrl: props.webPartContext.pageContext.web.absoluteUrl,
    currentUserId: props.webPartContext.pageContext.legacyPageContext.userId
  };
}

export default function PersonalFavorites(props: IPersonalFavoritesProps): React.ReactElement {
  const viewModel = useFavorites(buildConfig(props));

  return (
    <section className={styles.personalFavorites} aria-label={viewModel.title}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.kicker}>Accesos de confianza</p>
          <Text variant="xxLarge" as="h2" className={styles.title}>
            {viewModel.title}
          </Text>
          <p className={styles.description}>
            Hola, {props.userDisplayName || 'usuario'}. {viewModel.description}
          </p>
        </div>
        <div className={styles.headerMeta}>
          <span className={styles.metaPill}>
            <Icon iconName="FavoriteStarFill" aria-hidden="true" />
            {viewModel.items.length} favoritos
          </span>
          {props.showMetadata ? <span className={styles.metaPillSecondary}>{viewModel.sourceLabel}</span> : null}
        </div>
      </header>

      <FavoritesState
        state={viewModel.state}
        title={viewModel.title}
        description={viewModel.description}
        sourceLabel={viewModel.sourceLabel}
        userDisplayName={props.userDisplayName}
        warningMessages={viewModel.warnings}
        errorMessage={viewModel.errorMessage}
      />

      {viewModel.items.length > 0 ? <FavoritesGrid items={viewModel.items} /> : null}
    </section>
  );
}
