import * as React from 'react';
import { DefaultButton, Icon, Link, MessageBar, MessageBarType, Spinner, Text } from '@fluentui/react';
import * as strings from 'WhatChangedFeedWebPartStrings';

import { useWhatChangedFeed } from '../hooks/useWhatChangedFeed';
import type { IWhatChangedFeedItem } from '../models/whatChangedFeedModels';
import { formatDate } from '../utils/whatChangedFeedUtils';
import type { IWhatChangedFeedProps } from './IWhatChangedFeedProps';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';
import styles from './WhatChangedFeed.module.scss';

function renderChange(item: IWhatChangedFeedItem, localeName: string): React.ReactElement {
  const changedLabel = formatDate(item.changedAt, localeName);

  return (
    <article key={item.id} className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          <span className={styles.typeBadge}>{item.type}</span>
          {item.featured ? <span className={styles.featuredBadge}>{strings.UpdatedBadgeLabel}</span> : null}
          {!item.summary || !item.openUrl || !item.changedAt ? (
            <span className={styles.partialBadge}>{strings.PartialBadgeLabel}</span>
          ) : null}
        </div>

        <Text as="h3" variant="mediumPlus" className={styles.cardTitle}>
          {item.title}
        </Text>

        {changedLabel ? (
          <p className={styles.cardSubtitle}>
            <Icon iconName="Calendar" aria-hidden="true" />
            <span>{strings.ChangedAtLabel} {changedLabel}</span>
          </p>
        ) : null}

        <p className={styles.summary}>{item.summary ?? strings.MissingSummaryLabel}</p>

        {item.openUrl ? (
          <Link href={item.openUrl} target="_blank" rel="noreferrer" className={styles.cardAction}>
            {strings.OpenItemButton}
          </Link>
        ) : (
          <Text variant="small" className={styles.cardMuted}>
            {strings.MissingLinkLabel}
          </Text>
        )}
      </div>
    </article>
  );
}

export default function WhatChangedFeed(props: IWhatChangedFeedProps): React.ReactElement {
  const { state, reload } = useWhatChangedFeed(props.service, props.configuration);

  return (
    <WebPartErrorBoundary title={strings.ErrorBoundaryTitle} message={strings.ErrorBoundaryMessage}>
      <section className={styles.whatChangedFeed} aria-label={props.configuration.title}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>{props.userDisplayName}</p>
            <Text as="h2" variant="xLarge" className={styles.title}>
              {props.configuration.title}
            </Text>
            <p className={styles.description}>{props.configuration.description}</p>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.metaPill}>
              <Icon iconName="Page" aria-hidden="true" />
              <span>{strings.ResultsCounterLabel} {state.items.length}</span>
            </span>
            <span className={styles.metaPillSecondary}>{props.configuration.defaultTypeFilter || strings.AllTypesLabel}</span>
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
          <div className={styles.cardsGrid}>
            {state.items.map((item) => renderChange(item, props.localeName))}
          </div>
        ) : null}
      </section>
    </WebPartErrorBoundary>
  );
}
