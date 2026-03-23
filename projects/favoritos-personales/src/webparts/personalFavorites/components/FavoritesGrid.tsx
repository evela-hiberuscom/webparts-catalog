import * as React from 'react';

import type { IFavoriteItem } from '../models/favoritesTypes';
import { FavoriteCard } from './FavoriteCard';
import styles from './PersonalFavorites.module.scss';

export interface IFavoritesGridProps {
  items: IFavoriteItem[];
}

export function FavoritesGrid({ items }: IFavoritesGridProps): React.ReactElement {
  return (
    <div className={styles.grid} role="list" aria-label="Favoritos personales">
      {items.map((item) => (
        <div role="listitem" key={item.id}>
          <FavoriteCard item={item} />
        </div>
      ))}
    </div>
  );
}
