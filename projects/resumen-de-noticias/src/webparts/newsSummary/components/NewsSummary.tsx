import * as React from 'react';
import { DefaultButton, Icon, Link, MessageBar, MessageBarType, Spinner, Text } from '@fluentui/react';
import * as strings from 'NewsSummaryWebPartStrings';

import { useNewsSummary } from '../hooks/useNewsSummary';
import type { INewsSummaryItem } from '../models/newsSummaryModels';
import { formatNewsDate } from '../utils/newsSummaryUtils';
import type { INewsSummaryProps } from './INewsSummaryProps';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';
import styles from './NewsSummary.module.scss';

function renderNewsCard(item: INewsSummaryItem, localeName: string): React.ReactElement {
  const publishedLabel = formatNewsDate(item.publishedAt, localeName);

  return (
    <article key={item.id} className={styles.card}>
      {item.imageUrl ? (
        <div className={styles.imageFrame}>
          <img src={item.imageUrl} alt="" className={styles.image} />
        </div>
      ) : null}
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          {item.isFeatured ? <span className={styles.featuredBadge}>{strings.FeaturedBadgeLabel}</span> : null}
          {!item.summary || !item.openUrl || !item.imageUrl ? (
            <span className={styles.partialBadge}>{strings.PartialBadgeLabel}</span>
          ) : null}
          {publishedLabel ? (
            <span className={styles.dateBadge}>
              <Icon iconName="News" aria-hidden="true" />
              <span>{strings.PublishedOnLabel} {publishedLabel}</span>
            </span>
          ) : null}
        </div>
        <Text as="h3" variant="mediumPlus" className={styles.cardTitle}>
          {item.title}
        </Text>
        <p className={styles.summary}>{item.summary ?? strings.MissingSummaryLabel}</p>
        {item.openUrl ? (
          <Link href={item.openUrl} target="_blank" rel="noreferrer" className={styles.cardAction}>
            {strings.OpenNewsButton}
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

export default function NewsSummary(props: INewsSummaryProps): React.ReactElement {
  const { state, reload } = useNewsSummary(props.service, props.configuration);

  return (
    <WebPartErrorBoundary title={strings.ErrorBoundaryTitle} message={strings.ErrorBoundaryMessage}>
      <section className={styles.newsSummary} aria-label={props.configuration.title}>
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
              <Icon iconName="News" aria-hidden="true" />
              <span>{state.items.length} {strings.ResultsCounterLabel}</span>
            </span>
            <span className={styles.metaPillSecondary}>{props.configuration.sitePagesListTitle}</span>
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
            {state.items.map((item) => renderNewsCard(item, props.localeName))}
          </div>
        ) : null}
      </section>
    </WebPartErrorBoundary>
  );
}
