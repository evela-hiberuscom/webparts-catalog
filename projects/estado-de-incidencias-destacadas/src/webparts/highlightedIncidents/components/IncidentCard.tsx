import * as React from 'react';
import { Link, Text } from '@fluentui/react';
import styles from './HighlightedIncidents.module.scss';
import type { IHighlightedIncident } from '../models/highlightedIncidentModels';
import { formatIncidentEta, getSeverityLabel, getStatusLabel, resolveIncidentDetailLink } from '../utils/highlightedIncidentsUtils';

export interface IIncidentCardProps {
  incident: IHighlightedIncident;
  webUrl: string;
}

export default function IncidentCard(props: IIncidentCardProps): React.ReactElement<IIncidentCardProps> {
  const { incident, webUrl } = props;
  const detailLink = resolveIncidentDetailLink(incident.detailUrl, webUrl);
  const etaLabel = formatIncidentEta(incident.eta) ?? incident.eta;
  const severityToneClass = {
    critical: styles['severity-critical'],
    high: styles['severity-high'],
    medium: styles['severity-medium'],
    low: styles['severity-low'],
    unknown: styles['severity-unknown']
  }[incident.severity];
  const severityBadgeClass = {
    critical: styles.severitycritical,
    high: styles.severityhigh,
    medium: styles.severitymedium,
    low: styles.severitylow,
    unknown: styles.severityunknown
  }[incident.severity];

  return (
    <article
      className={`${styles.card} ${severityToneClass} ${incident.isPartial ? styles.partialCard : ''}`}
      aria-label={`${incident.title}. Severidad ${getSeverityLabel(incident.severity)}. Estado ${getStatusLabel(incident.status)}.`}
    >
      <header className={styles.cardHeader}>
        <div className={styles.cardHeadingCopy}>
          <span className={styles.sourceBadge}>{incident.sourceName}</span>
          <Text variant="mediumPlus" className={styles.cardTitle} as="h3">
            {incident.title}
          </Text>
        </div>
        <div className={styles.badgeColumn}>
          <span className={`${styles.badge} ${severityBadgeClass}`}>{getSeverityLabel(incident.severity)}</span>
          <span className={`${styles.badge} ${styles.statusBadge}`}>{getStatusLabel(incident.status)}</span>
        </div>
      </header>

      <div className={styles.cardBody}>
        {incident.impact ? (
          <Text variant="small" className={styles.cardParagraph}>
            <strong>Impacto:</strong> {incident.impact}
          </Text>
        ) : (
          <Text variant="small" className={`${styles.cardParagraph} ${styles.mutedText}`}>
            No se ha informado impacto todavía.
          </Text>
        )}

        {incident.workaround ? (
          <Text variant="small" className={styles.cardParagraph}>
            <strong>Workaround:</strong> {incident.workaround}
          </Text>
        ) : (
          <Text variant="small" className={`${styles.cardParagraph} ${styles.mutedText}`}>
            Sin workaround documentado.
          </Text>
        )}

        <div className={styles.cardMetaRow}>
          <Text variant="small" className={styles.cardMetaItem}>
            <strong>ETA:</strong> {etaLabel ?? 'No disponible'}
          </Text>
          {incident.isPartial ? (
            <Text variant="small" className={styles.partialFlag}>
              Datos parciales
            </Text>
          ) : null}
        </div>
      </div>

      <footer className={styles.cardFooter}>
        {detailLink ? (
          <Link className={styles.detailLink} href={detailLink.href} target={detailLink.target} rel={detailLink.rel}>
            Abrir detalle
          </Link>
        ) : (
          <Text variant="small" className={styles.mutedText}>
            Sin enlace de detalle.
          </Text>
        )}
      </footer>
    </article>
  );
}
