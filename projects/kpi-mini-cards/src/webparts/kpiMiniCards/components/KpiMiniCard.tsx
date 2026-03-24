import * as React from 'react';
import { Icon, Link, Text } from '@fluentui/react';
import styles from './KpiMiniCards.module.scss';
import type { IKpiMiniCard } from '../models/kpiModels';
import { describeTrend, getBadgeLabel } from '../utils/kpiLink';

export interface IKpiMiniCardProps {
  item: IKpiMiniCard;
  showTrend: boolean;
}

function getStateClassName(state: IKpiMiniCard['state']): string {
  switch (state) {
    case 'critical':
      return styles.badgeCritical;
    case 'warning':
      return styles.badgeWarning;
    case 'unknown':
      return styles.badgeUnknown;
    default:
      return styles.badgeOk;
  }
}

function getTrendIconName(trend: IKpiMiniCard['trend']): string {
  switch (trend) {
    case 'up':
      return 'ChevronUp';
    case 'down':
      return 'ChevronDown';
    case 'flat':
      return 'Remove';
    default:
      return 'Unknown';
  }
}

function getCardClassName(state: IKpiMiniCard['state']): string {
  switch (state) {
    case 'critical':
      return styles.cardCritical;
    case 'warning':
      return styles.cardWarning;
    case 'unknown':
      return styles.cardUnknown;
    default:
      return styles.cardOk;
  }
}

export default function KpiMiniCard(props: IKpiMiniCardProps): React.ReactElement {
  const { item } = props;
  const stateClassName = getStateClassName(item.state);
  const cardClassName = getCardClassName(item.state);
  const trendDescription = describeTrend(item.trend);

  return (
    <article className={`${styles.card} ${cardClassName}`} aria-label={item.label}>
      <div className={styles.cardTop}>
        <span className={`${styles.badge} ${stateClassName}`}>{getBadgeLabel(item.state)}</span>
        <span className={styles.priorityLabel}>{typeof item.priority === 'number' ? `Prioridad ${item.priority}` : 'Sin prioridad'}</span>
      </div>

      <Text as="h3" variant="medium" className={styles.cardLabel} block>
        {item.label}
      </Text>

      <div className={styles.valueRow}>
        <Text className={styles.cardValue} block>
          {item.value === undefined || item.value === '' ? '—' : item.value}
        </Text>
        {item.unit ? (
          <Text className={styles.cardUnit} block>
            {item.unit}
          </Text>
        ) : null}
      </div>

      {props.showTrend ? (
        <div className={styles.trendRow}>
          <Icon iconName={getTrendIconName(item.trend)} className={styles.trendIcon} aria-hidden="true" />
          <Text className={styles.trendText} block>
            {trendDescription}
          </Text>
          {item.comparison ? (
            <Text className={styles.comparisonText} block>
              {item.comparison}
            </Text>
          ) : null}
        </div>
      ) : null}

      {item.description ? (
        <Text className={styles.cardDescription} block>
          {item.description}
        </Text>
      ) : null}

      {item.safeLink ? (
        <div className={styles.linkRow}>
          <Link href={item.safeLink.href} target={item.safeLink.target} rel={item.safeLink.rel} className={styles.cardLink}>
            Ver detalle →
          </Link>
        </div>
      ) : null}
    </article>
  );
}
