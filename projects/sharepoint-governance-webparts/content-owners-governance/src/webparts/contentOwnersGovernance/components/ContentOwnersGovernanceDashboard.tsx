import * as React from 'react';
import { MessageBar, MessageBarType, Stack, Text } from '@fluentui/react';
import type { IGovernanceDashboardConfig, IGovernanceDashboardLabels } from '../models/governanceModels';
import { GovernanceDashboardService } from '../services/governanceDashboardService';
import { useGovernanceDashboard } from '../hooks/useGovernanceDashboard';
import { GovernanceStatePanel } from './GovernanceStatePanel';
import styles from './GovernanceDashboard.module.scss';

export interface IContentOwnersGovernanceDashboardProps extends IGovernanceDashboardConfig {
  labels: IGovernanceDashboardLabels;
  service: GovernanceDashboardService;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString();
}

function severityClassName(severity: string): string {
  if (severity === 'critical') {
    return styles.severityCritical;
  }

  if (severity === 'high') {
    return styles.severityHigh;
  }

  if (severity === 'medium') {
    return styles.severityMedium;
  }

  return styles.severityLow;
}

export function ContentOwnersGovernanceDashboard(props: IContentOwnersGovernanceDashboardProps): React.ReactElement {
  const { data, status, errorMessage, reload } = useGovernanceDashboard(
    {
      title: props.title,
      subtitle: props.subtitle,
      maxItems: props.maxItems,
      showDetails: props.showDetails
    },
    props.service
  );

  if (status === 'loading') {
    return <GovernanceStatePanel iconName="Sync" title={props.labels.loadingLabel} message={props.subtitle} />;
  }

  if (status === 'error') {
    return (
      <GovernanceStatePanel
        iconName="ErrorBadge"
        title={props.labels.errorTitle}
        message={errorMessage || props.labels.errorMessage}
        actionLabel={props.labels.retryButtonLabel}
        onAction={reload}
      />
    );
  }

  if (status === 'empty' || !data) {
    return <GovernanceStatePanel iconName="Inbox" title={props.labels.emptyTitle} message={props.labels.emptyMessage} />;
  }

  return (
    <section className={styles.root} aria-label={props.title}>
      <Stack tokens={{ childrenGap: 16 }}>
        <div className={styles.header}>
          <div>
            <Text as="h2" variant="xxLarge" block className={styles.title}>
              {props.title}
            </Text>
            <Text variant="medium" block className={styles.subtitle}>
              {props.subtitle}
            </Text>
          </div>
          <div className={styles.meta}>
            <span className={styles.metaPill}>{data.initiativeId}</span>
            <span className={styles.metaPill}>{data.phase}</span>
          </div>
        </div>

        {data.mockMode ? (
          <MessageBar messageBarType={MessageBarType.warning} isMultiline className={styles.notice}>
            {props.labels.mockModeLabel}
          </MessageBar>
        ) : null}

        {data.backendRequired ? (
          <MessageBar messageBarType={MessageBarType.info} isMultiline className={styles.notice}>
            {props.labels.backendRequiredLabel}
          </MessageBar>
        ) : null}

        <div className={styles.metricsGrid} role="list" aria-label={props.labels.riskLabel}>
          {data.metrics.map((metric) => (
            <article key={metric.id} role="listitem" className={styles.metricCard}>
              <span className={`${styles.severityBadge} ${severityClassName(metric.severity)}`}>
                {metric.severity}
              </span>
              <Text as="h3" variant="large" block className={styles.metricTitle}>
                {metric.label}
              </Text>
              <div className={styles.metricValue}>
                <span>{metric.value}</span>
                <small>{metric.unit}</small>
              </div>
              <Text variant="small" block className={styles.metricDescription}>
                {metric.description}
              </Text>
            </article>
          ))}
        </div>

        <div className={styles.sectionHeader}>
          <Text as="h3" variant="xLarge" block className={styles.sectionTitle}>
            {props.labels.riskLabel}
          </Text>
          <span className={styles.sourceLine}>
            {props.labels.sourceLabel}: {data.sourceLabel}
          </span>
        </div>

        <div className={styles.findingsList}>
          {data.visibleFindings.map((finding) => (
            <article key={finding.id} className={styles.findingCard}>
              <div className={styles.findingTopLine}>
                <Text as="h4" variant="large" block className={styles.findingTitle}>
                  {finding.title}
                </Text>
                <span className={`${styles.severityBadge} ${severityClassName(finding.severity)}`}>
                  {finding.severity}
                </span>
              </div>
              <dl className={styles.findingMeta}>
                <div>
                  <dt>{props.labels.statusLabel}</dt>
                  <dd>{finding.status}</dd>
                </div>
                <div>
                  <dt>{props.labels.confidenceLabel}</dt>
                  <dd>{finding.confidence}</dd>
                </div>
                <div>
                  <dt>{props.labels.lastUpdatedLabel}</dt>
                  <dd>{formatDate(finding.dueDate)}</dd>
                </div>
              </dl>
              {props.showDetails ? (
                <div className={styles.detailsBlock}>
                  <Text variant="small" block>
                    <strong>{props.labels.evidenceLabel}:</strong> {finding.evidence}
                  </Text>
                  <Text variant="small" block>
                    <strong>{props.labels.recommendationsLabel}:</strong> {finding.recommendation}
                  </Text>
                </div>
              ) : null}
            </article>
          ))}
        </div>

        <div className={styles.recommendations}>
          <Text as="h3" variant="xLarge" block className={styles.sectionTitle}>
            {props.labels.recommendationsLabel}
          </Text>
          <ul>
            {data.recommendations.map((recommendation) => (
              <li key={recommendation.id}>
                <strong>{recommendation.title}</strong> - {recommendation.rationale}
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.limitations}>
          <Text as="h3" variant="large" block className={styles.sectionTitle}>
            {props.labels.limitationsLabel}
          </Text>
          <ul>
            {data.limitations.map((limitation) => (
              <li key={limitation}>{limitation}</li>
            ))}
          </ul>
        </div>
      </Stack>
    </section>
  );
}
