import * as React from 'react';
import {
  DefaultButton,
  Icon,
  Link,
  MessageBar,
  MessageBarType,
  Spinner,
  Text
} from '@fluentui/react';
import * as strings from 'UpcomingMilestonesWebPartStrings';

import { useUpcomingMilestones } from '../hooks/useUpcomingMilestones';
import type { IUpcomingMilestoneItem } from '../models/upcomingMilestonesModels';
import {
  formatMilestoneDate,
  isMilestonePartial,
  isMilestoneSoon
} from '../utils/upcomingMilestonesUtils';
import type { IUpcomingMilestonesProps } from './IUpcomingMilestonesProps';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';
import styles from './UpcomingMilestones.module.scss';

function renderMilestone(
  item: IUpcomingMilestoneItem,
  localeName: string,
  viewMode: 'timeline' | 'list'
): React.ReactElement {
  const isSoon = isMilestoneSoon(item);
  const isPartial = isMilestonePartial(item);

  return (
    <article
      key={item.id}
      className={viewMode === 'timeline' ? styles.timelineItem : styles.listItem}
      aria-label={item.title}
    >
      {viewMode === 'timeline' ? (
        <div className={styles.timelineRail} aria-hidden="true">
          <div className={styles.timelineDot} />
        </div>
      ) : null}

      <div className={styles.itemContent}>
        <div className={styles.itemMeta}>
          <span className={styles.datePill}>
            <Icon iconName="Calendar" aria-hidden="true" />
            <span>{formatMilestoneDate(item.date, localeName) || strings.DateMissingLabel}</span>
          </span>

          <span className={styles.typePill}>{item.type || strings.TypeMissingLabel}</span>
          {isSoon ? <span className={styles.soonPill}>{strings.SoonBadgeLabel}</span> : null}
          {isPartial ? <span className={styles.partialPill}>{strings.PartialBadgeLabel}</span> : null}
        </div>

        <Text as="h3" variant="mediumPlus" className={styles.itemTitle}>
          {item.title}
        </Text>

        {item.detailUrl ? (
          <Link href={item.detailUrl} target="_blank" rel="noreferrer" className={styles.itemAction}>
            {strings.OpenMilestoneButton}
          </Link>
        ) : (
          <Text variant="small" className={styles.itemMuted}>
            {strings.InformationalLabel}
          </Text>
        )}
      </div>
    </article>
  );
}

export default function UpcomingMilestones(props: IUpcomingMilestonesProps): React.ReactElement {
  const { state, reload } = useUpcomingMilestones(props.service, props.configuration);
  const viewModeLabel = props.configuration.viewMode === 'timeline'
    ? strings.ViewModeTimelineLabel
    : strings.ViewModeListLabel;

  return (
    <WebPartErrorBoundary title={strings.ErrorBoundaryTitle} message={strings.ErrorBoundaryMessage}>
      <section className={styles.upcomingMilestones} aria-label={props.configuration.title}>
        <header className={styles.header}>
          <div>
            <Text as="h2" variant="xLarge" className={styles.title}>
              {props.configuration.title}
            </Text>
            <p className={styles.description}>{props.configuration.description}</p>
          </div>

          <div className={styles.headerMeta}>
            <span className={styles.metaPill}>
              <Icon iconName="Calendar" aria-hidden="true" />
              <span>{strings.ViewModePillLabel} {viewModeLabel}</span>
            </span>
            <span className={styles.metaPillSecondary}>
              {state.items.length} {strings.ResultsCounterLabel}
            </span>
          </div>
        </header>

        {props.environmentMessage ? (
          <MessageBar messageBarType={MessageBarType.info} isMultiline={false}>
            {props.environmentMessage}
          </MessageBar>
        ) : null}

        {state.status === 'loading' ? (
          <div className={styles.statePanel}>
            <Spinner label={strings.LoadingMessage} />
          </div>
        ) : null}

        {state.status === 'error' ? (
          <div className={styles.statePanel}>
            <MessageBar messageBarType={MessageBarType.error}>{strings.ErrorMessage}</MessageBar>
            <DefaultButton text={strings.RetryButtonLabel} onClick={reload} />
          </div>
        ) : null}

        {state.status !== 'loading' && state.status !== 'error' && state.hasPartialData ? (
          <MessageBar messageBarType={MessageBarType.warning}>{strings.PartialDataMessage}</MessageBar>
        ) : null}

        {state.status !== 'loading' && state.status !== 'error' && state.items.length === 0 ? (
          <div className={styles.statePanel}>
            <Text variant="medium">{strings.EmptyMessage}</Text>
          </div>
        ) : null}

        {state.items.length > 0 ? (
          <div
            className={props.configuration.viewMode === 'timeline' ? styles.timelineList : styles.compactList}
            aria-label={props.configuration.viewMode === 'timeline' ? strings.TimelineAriaLabel : strings.ListAriaLabel}
          >
            {state.items.map((item) => renderMilestone(item, props.localeName, props.configuration.viewMode))}
          </div>
        ) : null}
      </section>
    </WebPartErrorBoundary>
  );
}
