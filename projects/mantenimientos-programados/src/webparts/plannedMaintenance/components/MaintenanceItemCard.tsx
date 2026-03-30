import * as React from 'react';
import { Link, Stack, Text } from '@fluentui/react';
import { createSafeExternalLink } from '@paquete/spfx-common';

import * as strings from 'PlannedMaintenanceWebPartStrings';

import type { IPlannedMaintenanceItem, PlannedMaintenanceImpact, PlannedMaintenanceStatus } from '../models/plannedMaintenanceModels';
import styles from './PlannedMaintenance.module.scss';

interface IMaintenanceItemCardProps {
  item: IPlannedMaintenanceItem;
  localeName?: string;
}

function getStatusLabel(status: PlannedMaintenanceStatus): string {
  switch (status) {
    case 'inProgress':
      return strings.StatusInProgress;
    case 'completed':
      return strings.StatusCompleted;
    case 'unknown':
      return strings.StatusUnknown;
    case 'upcoming':
    default:
      return strings.StatusUpcoming;
  }
}

function getImpactLabel(impact: PlannedMaintenanceImpact): string {
  switch (impact) {
    case 'high':
      return strings.ImpactHigh;
    case 'medium':
      return strings.ImpactMedium;
    case 'low':
      return strings.ImpactLow;
    case 'unknown':
    default:
      return strings.ImpactUnknown;
  }
}

function formatDateRange(item: IPlannedMaintenanceItem, localeName?: string): string {
  const formatter = new Intl.DateTimeFormat(localeName || 'es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
  const startDate = item.startAt ? new Date(item.startAt) : undefined;
  const endDate = item.endAt ? new Date(item.endAt) : undefined;

  if (!startDate || Number.isNaN(startDate.getTime())) {
    return strings.UnknownDateLabel;
  }

  if (!endDate || Number.isNaN(endDate.getTime())) {
    return formatter.format(startDate);
  }

  return `${formatter.format(startDate)} - ${formatter.format(endDate)}`;
}

export function MaintenanceItemCard(props: IMaintenanceItemCardProps): React.ReactElement {
  const detailLink = props.item.detailUrl ? createSafeExternalLink(props.item.detailUrl) : undefined;

  return (
    <article className={styles.maintenanceCard} aria-label={props.item.title}>
      <div className={styles.timelineDot} aria-hidden="true" />
      <Stack tokens={{ childrenGap: 10 }}>
        <div className={styles.cardHeader}>
          <Stack tokens={{ childrenGap: 6 }}>
            <Text variant="large" className={styles.cardTitle}>
              {props.item.title}
            </Text>
            <Text variant="small" className={styles.cardDate}>
              {formatDateRange(props.item, props.localeName)}
            </Text>
          </Stack>
          <div className={styles.badges}>
            <span className={`${styles.statusBadge} ${styles[`status${props.item.status}`]}`}>{getStatusLabel(props.item.status)}</span>
            <span className={`${styles.impactBadge} ${styles[`impact${props.item.impact}`]}`}>{getImpactLabel(props.item.impact)}</span>
            {props.item.partialData ? <span className={styles.partialBadge}>{strings.PartialBadgeLabel}</span> : null}
          </div>
        </div>

        <div className={styles.servicesRow}>
          <span className={styles.metaLabel}>{strings.ServicesLabel}</span>
          <div className={styles.serviceChips}>
            {props.item.services.length > 0 ? (
              props.item.services.map((service) => (
                <span key={service} className={styles.serviceChip}>
                  {service}
                </span>
              ))
            ) : (
              <span className={styles.noServices}>{strings.NoServicesLabel}</span>
            )}
          </div>
        </div>

        {detailLink ? (
          <Link href={detailLink.href} rel={detailLink.rel} target={detailLink.target} className={styles.detailLink}>
            {strings.DetailButtonLabel}
          </Link>
        ) : null}
      </Stack>
    </article>
  );
}
