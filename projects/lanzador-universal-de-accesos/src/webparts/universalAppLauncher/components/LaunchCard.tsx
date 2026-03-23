import * as React from 'react';
import { Icon, Link, Text } from '@fluentui/react';
import styles from './UniversalAppLauncher.module.scss';
import type { ILaunchItem } from '../models/launchModels';
import { resolveLinkProps } from '../utils/launchLink';

export interface ILaunchCardProps {
  item: ILaunchItem;
}

export default function LaunchCard(props: ILaunchCardProps): React.ReactElement {
  const { item } = props;
  const linkProps = resolveLinkProps(item.openUrl, item.openInNewTab);
  const isDisabled = item.openUrl === '#' || !linkProps;

  return (
    <article className={styles.card} role="listitem">
      <div className={styles.cardHeader}>
        <div className={styles.iconFrame} aria-hidden="true">
          <Icon iconName={item.iconName} />
        </div>
        <span className={styles.badge}>{item.category}</span>
      </div>
      <Text variant="large" block className={styles.cardTitle}>
        {item.title}
      </Text>
      <Text variant="small" block className={styles.cardDescription}>
        {item.description}
      </Text>
      <div className={styles.audienceRow} aria-label={`Audiencias: ${item.audienceTokens.join(', ') || 'General'}`}>
        {item.audienceTokens.length > 0 ? item.audienceTokens.map((token) => (
          <span key={`${item.id}-${token}`} className={styles.audienceChip}>
            {token}
          </span>
        )) : <span className={styles.audienceChip}>General</span>}
      </div>
      <div className={styles.cardFooter}>
        {item.featured ? <span className={styles.featuredChip}>Destacado</span> : <span className={styles.mutedChip}>Acceso</span>}
        {isDisabled ? (
          <span className={styles.cardActionDisabled}>Sin enlace</span>
        ) : (
          <Link href={linkProps.href} target={linkProps.target} rel={linkProps.rel} className={styles.cardAction}>
            Abrir
          </Link>
        )}
      </div>
    </article>
  );
}
