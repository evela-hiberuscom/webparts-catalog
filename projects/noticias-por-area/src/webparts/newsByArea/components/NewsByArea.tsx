import * as React from 'react';
import { DefaultButton, Icon, Link, MessageBar, MessageBarType, Spinner, Text } from '@fluentui/react';
import * as strings from 'NewsByAreaWebPartStrings';

import { useNewsByArea } from '../hooks/useNewsByArea';
import type { INewsByAreaItem } from '../models/newsByAreaModels';
import { formatNewsDate } from '../utils/newsByAreaUtils';
import type { INewsByAreaProps } from './INewsByAreaProps';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';
import styles from './NewsByArea.module.scss';

function renderNewsCard(
  item: INewsByAreaItem,
  localeName: string,
  showImage: boolean
): React.ReactElement {
  const publishedLabel = formatNewsDate(item.publishedAt, localeName);

  return (
    <article key={item.id} className={styles.card}>
      {showImage && item.imageUrl ? (
        <div className={styles.imageFrame}>
          <img src={item.imageUrl} alt="" className={styles.image} />
        </div>
      ) : null}
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          {item.isFeatured ? <span className={styles.featuredBadge}>{strings.FeaturedBadgeLabel}</span> : null}
          {!item.summary || !item.imageUrl || !item.openUrl || !item.tags.length ? (
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

        {item.tags.length ? (
          <div className={styles.tagsRow} aria-label={strings.TagsLabel}>
            {item.tags.map((tag) => (
              <span key={`${item.id}-${tag}`} className={styles.tag}>
                {tag}
              </span>
            ))}
          </div>
        ) : null}

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

export default function NewsByArea(props: INewsByAreaProps): React.ReactElement {
  const { state, reload } = useNewsByArea(props.service, props.configuration);

  return (
    <WebPartErrorBoundary title={strings.ErrorBoundaryTitle} message={strings.ErrorBoundaryMessage}>
      <section className={styles.newsByArea} aria-label={props.configuration.title}>
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
              <Icon iconName="Filter" aria-hidden="true" />
              <span>{strings.FilterLabel} {props.configuration.areaFilter}</span>
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
          <div className={styles.cardsGrid}>
            {state.items.map((item) => renderNewsCard(item, props.localeName, props.configuration.showImage))}
          </div>
        ) : null}
      </section>
    </WebPartErrorBoundary>
  );
}
