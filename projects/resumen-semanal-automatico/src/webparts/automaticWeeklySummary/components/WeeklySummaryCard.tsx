import * as React from 'react';
import { DefaultButton, Icon, Text } from '@fluentui/react';
import styles from './AutomaticWeeklySummary.module.scss';
import type { IWeeklyHighlight } from '../models/weeklySummaryTypes';

function resolveLinkProps(url?: string): React.AnchorHTMLAttributes<HTMLAnchorElement> {
  if (!url) {
    return {};
  }

  const isExternal = /^https?:\/\//i.test(url);
  return {
    href: url,
    target: isExternal ? '_blank' : undefined,
    rel: isExternal ? 'noreferrer noopener' : undefined
  };
}

export interface IWeeklySummaryCardProps {
  item: IWeeklyHighlight;
}

export function WeeklySummaryCard({ item }: IWeeklySummaryCardProps): React.ReactElement {
  const linkProps = resolveLinkProps(item.openUrl);
  const dateLabel = item.date
    ? new Intl.DateTimeFormat('es-ES', {
        weekday: 'short',
        day: '2-digit',
        month: 'short'
      }).format(new Date(item.date))
    : 'Sin fecha';

  return (
    <article className={`${styles.card} ${item.isPartial ? styles.partialCard : ''}`}>
      <div className={styles.cardTopRow}>
        <span className={styles.badge}>{item.highlightType}</span>
        <span className={styles.cardDate}>{dateLabel}</span>
      </div>
      <Text variant="large" as="h3" className={styles.cardTitle}>
        {item.title}
      </Text>
      <Text variant="small" className={styles.cardSummary}>
        {item.summary}
      </Text>
      <div className={styles.cardFooter}>
        <span className={styles.sourceLabel}>
          <Icon iconName="OpenFile" />
          <span>{item.sourceName}</span>
        </span>
        {item.openUrl ? (
          <DefaultButton
            {...linkProps}
            text="Abrir"
            className={styles.cardButton}
            ariaLabel={`Abrir ${item.title}`}
          />
        ) : (
          <span className={styles.mutedAction}>Sin enlace</span>
        )}
      </div>
    </article>
  );
}
