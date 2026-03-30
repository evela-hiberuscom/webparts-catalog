import * as React from 'react';
import { Icon, MessageBar, MessageBarType, PrimaryButton, Stack, Text } from '@fluentui/react';
import { createSafeExternalLink } from '@paquete/spfx-common/utils';
import * as strings from 'EventCountdownWebPartStrings';
import styles from './EventCountdown.module.scss';
import type { IEventCountdownProps } from './IEventCountdownProps';
import CountdownMetric from './CountdownMetric';
import CountdownSkeleton from './CountdownSkeleton';
import CountdownStatePanel from './CountdownStatePanel';
import { useCountdownModel } from '../hooks/useCountdown';
import { formatEventDate } from '../utils/countdownUtils';

function joinClasses(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(' ');
}

function formatMetricValue(value: number): string {
  return value < 10 ? `0${value}` : String(value);
}

export default function EventCountdown(props: IEventCountdownProps): React.ReactElement {
  const viewModel = useCountdownModel(props.config);
  const safeLink = viewModel.ctaLink ?? (props.config.detailUrl ? createSafeExternalLink(props.config.detailUrl) : undefined);
  const isCountdown = viewModel.phase === 'countdown';

  return (
    <section
      className={joinClasses(styles.root, props.isDarkTheme ? styles.dark : '', props.hasTeamsContext ? styles.teams : '')}
      aria-label={strings.SectionAriaLabel}
    >
      <Stack tokens={{ childrenGap: 20 }} className={styles.frame}>
        <div className={styles.header}>
          <div className={styles.headerText}>
            <Text as="h2" variant="xxLarge" block className={styles.title}>
              {props.config.eventTitle || strings.DefaultEventTitle}
            </Text>
            <Text variant="medium" block className={styles.subtitle}>
              {props.environmentMessage}
            </Text>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.metaPill}>{viewModel.phaseLabel}</span>
            <span className={styles.metaPill}>{viewModel.sourceLabel}</span>
            <span className={styles.metaText}>{props.userDisplayName}</span>
          </div>
        </div>

        {viewModel.state === 'loading' ? <CountdownSkeleton /> : undefined}

        {viewModel.state === 'error' ? (
          <CountdownStatePanel
            title={strings.ErrorStateTitle}
            message={strings.ErrorStateMessage}
            details={viewModel.errorMessage ?? viewModel.notes.join(' ')}
            warning
          />
        ) : undefined}

        {viewModel.state === 'empty' ? (
          <CountdownStatePanel
            title={strings.EmptyStateTitle}
            message={viewModel.emptyReason ?? strings.EmptyEventMessage}
            details={viewModel.notes.length > 0 ? viewModel.notes.join(' ') : undefined}
          />
        ) : undefined}

        {viewModel.state !== 'loading' && viewModel.state !== 'error' && viewModel.state !== 'empty' && viewModel.item ? (
          <>
            {viewModel.hasPartialData ? (
              <MessageBar messageBarType={MessageBarType.warning} isMultiline>
                {strings.PartialWarningMessage}
              </MessageBar>
            ) : undefined}

            <div className={joinClasses(styles.hero, isCountdown ? '' : styles.heroCompact)}>
              <div className={styles.heroCopy}>
                <Text as="p" className={styles.phaseLabel}>
                  {viewModel.phaseLabel}
                </Text>
                <Text as="h3" className={styles.heroTitle}>
                  {viewModel.item.title}
                </Text>
                <Text as="p" className={styles.heroSupport}>
                  {viewModel.supportingText}
                </Text>
                <Text as="p" className={styles.heroDate}>
                  {formatEventDate(viewModel.item.targetDate)}
                </Text>
              </div>

              {isCountdown && viewModel.remaining ? (
                <div className={styles.metrics} aria-live="polite">
                  <CountdownMetric value={formatMetricValue(viewModel.remaining.days)} label={strings.DaysLabel} />
                  <CountdownMetric value={formatMetricValue(viewModel.remaining.hours)} label={strings.HoursLabel} />
                  <CountdownMetric value={formatMetricValue(viewModel.remaining.minutes)} label={strings.MinutesLabel} />
                </div>
              ) : (
                <div className={styles.liveBadge} aria-live="polite">
                  <Icon iconName={viewModel.phase === 'live' ? 'Clock' : 'EventAccepted'} className={styles.liveIcon} />
                  <Text as="span" className={styles.liveText}>
                    {viewModel.phase === 'live' ? strings.LiveBadgeLabel : strings.CompletedBadgeLabel}
                  </Text>
                </div>
              )}
            </div>

            <div className={styles.footer}>
              <div className={styles.footerMeta}>
                <span className={styles.footerLabel}>{strings.SourceFooterLabel}</span>
                <span className={styles.footerValue}>{viewModel.sourceLabel}</span>
              </div>
              {safeLink ? (
                <PrimaryButton text={strings.OpenDetailButtonLabel} href={safeLink.href} target={safeLink.target} rel={safeLink.rel} />
              ) : props.config.detailUrl ? (
                <MessageBar messageBarType={MessageBarType.warning} isMultiline>
                  {strings.UnsafeLinkMessage}
                </MessageBar>
              ) : undefined}
            </div>
          </>
        ) : undefined}
      </Stack>
    </section>
  );
}
