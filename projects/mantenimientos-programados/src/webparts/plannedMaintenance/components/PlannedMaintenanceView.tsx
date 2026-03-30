import * as React from 'react';
import { DefaultButton, MessageBar, MessageBarType, PrimaryButton, Stack, Text } from '@fluentui/react';
import { hiberusThemeTokens } from '@paquete/spfx-common';

import * as strings from 'PlannedMaintenanceWebPartStrings';

import type { IPlannedMaintenanceViewModel } from '../models/plannedMaintenanceModels';
import { MaintenanceFilterBar } from './MaintenanceFilterBar';
import { MaintenanceItemCard } from './MaintenanceItemCard';
import styles from './PlannedMaintenance.module.scss';

interface IPlannedMaintenanceViewProps {
  viewModel: IPlannedMaintenanceViewModel;
  localeName?: string;
  onRetry: () => void;
  onHideCompletedChange: (value: boolean) => void;
}

function renderSkeleton(index: number): React.ReactElement {
  return (
    <article key={`skeleton-${index}`} className={styles.maintenanceCard} aria-hidden="true">
      <div className={styles.timelineDot} />
      <div className={styles.skeletonBlock} />
    </article>
  );
}

export function PlannedMaintenanceView(props: IPlannedMaintenanceViewProps): React.ReactElement {
  const vm = props.viewModel;

  return (
    <section className={styles.root} aria-label={vm.title}>
      <header className={styles.hero}>
        <div className={styles.heroTopline}>
          <span className={styles.kicker}>{strings.TimelineEyebrow}</span>
          <span className={styles.sourceLabel}>{strings.SourceLabel}: {vm.sourceLabel}</span>
        </div>
        <Stack tokens={{ childrenGap: 10 }}>
          <Text as="h2" variant="xxLarge" className={styles.title}>
            {vm.title}
          </Text>
          <Text variant="medium" className={styles.description}>
            {vm.description}
          </Text>
        </Stack>
      </header>

      <MaintenanceFilterBar
        hideCompleted={props.viewModel.hideCompleted}
        onHideCompletedChange={props.onHideCompletedChange}
        inProgressCount={props.viewModel.counts.inProgress}
        upcomingCount={props.viewModel.counts.upcoming}
        completedCount={props.viewModel.counts.completed}
      />

      {vm.state === 'loading' ? <div className={styles.timeline}>{Array.from({ length: 3 }, (_, index) => renderSkeleton(index))}</div> : null}

      {vm.state === 'error' ? (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={true}
          actions={<div><PrimaryButton text={strings.RetryButtonLabel} onClick={props.onRetry} /></div>}
        >
          <strong>{strings.ErrorStateTitle}</strong> {' - '} {strings.ErrorStateMessage}
        </MessageBar>
      ) : null}

      {vm.state === 'partialData' ? (
        <MessageBar
          messageBarType={MessageBarType.warning}
          isMultiline={true}
          actions={<div><DefaultButton text={strings.RetryButtonLabel} onClick={props.onRetry} /></div>}
        >
          <strong>{strings.PartialStateTitle}</strong> {' - '} {strings.PartialStateMessage}
        </MessageBar>
      ) : null}

      {vm.state === 'empty' ? (
        <MessageBar
          messageBarType={MessageBarType.info}
          isMultiline={true}
          actions={<div><DefaultButton text={strings.RetryButtonLabel} onClick={props.onRetry} /></div>}
        >
          <strong>{strings.EmptyStateTitle}</strong> {' - '} {strings.EmptyStateMessage}
        </MessageBar>
      ) : null}

      {vm.items.length > 0 ? (
        <div className={styles.timeline} aria-live="polite">
          {vm.items.map((item) => (
            <MaintenanceItemCard key={item.id} item={item} localeName={props.localeName} />
          ))}
        </div>
      ) : null}

      <footer className={styles.footer}>
        <span>{strings.InProgressSummaryLabel}: {vm.counts.inProgress}</span>
        <span>{strings.UpcomingSummaryLabel}: {vm.counts.upcoming}</span>
        <span>{strings.CompletedSummaryLabel}: {vm.counts.completed}</span>
        <span style={{ color: hiberusThemeTokens.palette.primaryDark }}>{vm.hasPartialData ? strings.PartialBadgeLabel : strings.ReadySummaryLabel}</span>
      </footer>
    </section>
  );
}
