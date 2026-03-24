import * as React from 'react';
import { Icon, Text } from '@fluentui/react';
import type { IProjectStatusItem } from '../models/projectStatusTypes';
import styles from './ProjectStatus.module.scss';

function getStatusClassName(status: IProjectStatusItem['status']): string {
  switch (status) {
    case 'green':
      return styles.statusGreen;
    case 'amber':
      return styles.statusAmber;
    case 'red':
      return styles.statusRed;
    default:
      return styles.statusUnknown;
  }
}

export interface IProjectStatusCardProps {
  item: IProjectStatusItem;
  showOwner: boolean;
}

export function ProjectStatusCard({ item, showOwner }: IProjectStatusCardProps): React.ReactElement {
  return (
    <article className={styles.card}>
      <div className={styles.cardTop}>
        <span className={`${styles.statusPill} ${getStatusClassName(item.status)}`}>
          <Icon iconName="StatusCircleCheckmark" />
          <span>{item.statusLabel}</span>
        </span>
        <span className={styles.mutedAction}>{item.relevantDateLabel}</span>
      </div>

      <div>
        <Text variant="large" as="h3" className={styles.cardTitle}>
          {item.title}
        </Text>
        <div className={styles.cardAccentLine} />
      </div>

      <div className={styles.cardMeta}>
        {showOwner && item.owner ? (
          <span className={styles.metaItem}>
            <Icon iconName="People" className={styles.metaIcon} />
            <span>{item.owner}</span>
          </span>
        ) : null}
        {item.category ? (
          <span className={styles.metaItem}>
            <Icon iconName="Tag" className={styles.metaIcon} />
            <span>{item.category}</span>
          </span>
        ) : null}
      </div>

      <div className={styles.cardFooter}>
        {item.safeLink ? (
          <a className={styles.cardLink} {...item.safeLink}>
            <span>Abrir detalle</span>
            <Icon iconName="ChevronRight" />
          </a>
        ) : (
          <span className={styles.mutedAction}>Sin enlace</span>
        )}
        {item.hasPartialData ? <span className={styles.mutedAction}>Datos parciales</span> : null}
      </div>
    </article>
  );
}
