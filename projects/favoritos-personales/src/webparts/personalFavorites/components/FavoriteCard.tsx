import * as React from 'react';
import { Icon } from '@fluentui/react';

import type { IFavoriteItem } from '../models/favoritesTypes';
import { createSafeLinkProps } from '../utils/favoritesUtils';
import styles from './PersonalFavorites.module.scss';

export interface IFavoriteCardProps {
  item: IFavoriteItem;
}

export function FavoriteCard({ item }: IFavoriteCardProps): React.ReactElement {
  const iconName = item.icon || 'FavoriteStar';

  if (!item.openUrl) {
    return (
      <article className={styles.card} aria-label={`${item.title} sin enlace`}>
        <div className={styles.cardTopRow}>
          <span className={styles.iconBadge} aria-hidden="true">
            <Icon iconName={iconName} />
          </span>
          {item.featured ? <span className={styles.badge}>Destacado</span> : null}
        </div>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        {item.description ? <p className={styles.cardDescription}>{item.description}</p> : null}
        <div className={styles.cardFooter}>
          <span className={styles.partialTag}>Sin enlace configurado</span>
        </div>
      </article>
    );
  }

  const linkProps = createSafeLinkProps(item.openUrl);
  if (!linkProps) {
    return (
      <article className={styles.card} aria-label={`${item.title} sin enlace`}>
        <div className={styles.cardTopRow}>
          <span className={styles.iconBadge} aria-hidden="true">
            <Icon iconName={iconName} />
          </span>
          {item.featured ? <span className={styles.badge}>Destacado</span> : null}
        </div>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        {item.description ? <p className={styles.cardDescription}>{item.description}</p> : null}
        <div className={styles.cardFooter}>
          <span className={styles.partialTag}>Enlace no disponible</span>
        </div>
      </article>
    );
  }

  return (
    <article className={styles.card}>
      <a className={styles.cardLink} href={linkProps.href} rel={linkProps.rel} target={linkProps.target}>
        <div className={styles.cardTopRow}>
          <span className={styles.iconBadge} aria-hidden="true">
            <Icon iconName={iconName} />
          </span>
          {item.featured ? <span className={styles.badge}>Destacado</span> : null}
        </div>
        <h3 className={styles.cardTitle}>{item.title}</h3>
        {item.description ? <p className={styles.cardDescription}>{item.description}</p> : null}
        <div className={styles.cardFooter}>
          <span className={styles.actionLink}>Abrir recurso</span>
          {item.category ? <span className={styles.partialTag}>{item.category}</span> : null}
        </div>
      </a>
    </article>
  );
}
