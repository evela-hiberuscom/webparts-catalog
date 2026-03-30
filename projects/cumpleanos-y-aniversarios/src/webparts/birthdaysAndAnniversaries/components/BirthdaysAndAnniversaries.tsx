import * as React from 'react';
import { MessageBar, MessageBarType, Spinner, SpinnerSize, Stack, Text } from '@fluentui/react';
import * as strings from 'BirthdaysAndAnniversariesWebPartStrings';
import styles from './BirthdaysAndAnniversaries.module.scss';
import type { IBirthdaysAndAnniversariesProps } from './IBirthdaysAndAnniversariesProps';
import CelebrationCard from './CelebrationCard';
import CelebrationsEmptyState from './CelebrationsEmptyState';
import { useCelebrations } from '../hooks/useCelebrations';
import { CelebrationService } from '../services/celebrationService';

function CelebrationSection(props: {
  title: string;
  items: React.ReactElement[];
}): React.ReactElement {
  if (props.items.length === 0) {
    return <></>;
  }

  return (
    <section className={styles.section} aria-label={props.title}>
      <Text variant="large" as="h3" className={styles.sectionTitle} block>
        {props.title}
      </Text>
      <div className={styles.cardList} role="list">
        {props.items}
      </div>
    </section>
  );
}

export default function BirthdaysAndAnniversaries(props: IBirthdaysAndAnniversariesProps): React.ReactElement {
  const service = React.useMemo(() => new CelebrationService(), []);
  const { status, title, subtitle, sourceLabel, todayItems, upcomingItems, partialItems, items, errorMessage, hasPartialData, notes, refresh } = useCelebrations(
    {
      spHttpClient: props.spHttpClient,
      spHttpClientConfiguration: props.spHttpClientConfiguration,
      webAbsoluteUrl: props.webAbsoluteUrl,
      dataSourceTypes: props.dataSourceTypes,
      directoryJsonUrl: props.directoryJsonUrl,
      listTitleOrUrl: props.listTitleOrUrl,
      jsonUrl: props.jsonUrl,
      showBirthdays: props.showBirthdays,
      showAnniversaries: props.showAnniversaries,
      daysAhead: props.daysAhead,
      title: strings.WebPartTitle,
      subtitle: strings.WebPartSubtitle
    },
    service
  );
  const resolvedTitle = title || strings.WebPartTitle;
  const resolvedSubtitle = subtitle || strings.WebPartSubtitle;
  const resolvedSourceLabel = sourceLabel || strings.SourceUnavailableLabel;

  if (status === 'loading') {
    return (
      <section className={styles.root} aria-label={strings.WebPartTitle}>
        <Stack tokens={{ childrenGap: 16 }}>
          <div className={styles.header}>
            <div>
              <Text variant="xxLarge" as="h2" className={styles.title} block>
                {resolvedTitle}
              </Text>
              <Text variant="medium" className={styles.subtitle} block>
                {resolvedSubtitle}
              </Text>
            </div>
            <span className={styles.sourcePill}>{resolvedSourceLabel}</span>
          </div>
          <Spinner size={SpinnerSize.medium} label={strings.LoadingLabel} />
        </Stack>
      </section>
    );
  }

  const content = (() => {
    if (status === 'error') {
      return (
        <CelebrationsEmptyState
          title={strings.ErrorStateTitle}
          message={errorMessage ? strings.ErrorStateMessageDetailed : strings.ErrorStateMessage}
          variant="error"
          actionLabel={strings.ErrorStateRetryAction}
          onAction={refresh}
        />
      );
    }

    if (items.length === 0) {
      return (
        <CelebrationsEmptyState
          title={status === 'partialData' ? strings.PartialEmptyStateTitle : strings.EmptyStateTitle}
          message={status === 'partialData' ? strings.PartialEmptyStateMessage : strings.EmptyStateMessage}
          variant={status === 'partialData' ? 'warning' : 'info'}
          actionLabel={strings.RefreshAction}
          onAction={refresh}
        />
      );
    }

    return (
      <Stack tokens={{ childrenGap: 20 }}>
        {hasPartialData && (
          <MessageBar messageBarType={MessageBarType.warning} isMultiline={false} className={styles.messageBar}>
            {strings.PartialBannerMessage}
          </MessageBar>
        )}

        {notes.length > 0 ? (
          <MessageBar messageBarType={MessageBarType.info} isMultiline={false} className={styles.messageBar}>
            {strings.SourceLabel}: {resolvedSourceLabel}
          </MessageBar>
        ) : (
          <div className={styles.sourceLine}>{strings.SourceLabel}: {resolvedSourceLabel}</div>
        )}

        <CelebrationSection
          title={strings.TodaySectionTitle}
          items={todayItems.map((item) => (
            <CelebrationCard key={item.id} item={item} sectionLabel={strings.TodaySectionTitle} />
          ))}
        />

        <CelebrationSection
          title={strings.UpcomingSectionTitle}
          items={upcomingItems.map((item) => (
            <CelebrationCard key={item.id} item={item} sectionLabel={strings.UpcomingSectionTitle} />
          ))}
        />

        <CelebrationSection
          title={strings.PartialSectionTitle}
          items={partialItems.map((item) => (
            <CelebrationCard key={item.id} item={item} sectionLabel={strings.PartialSectionTitle} />
          ))}
        />
      </Stack>
    );
  })();

  return (
    <section className={styles.root} aria-label={strings.WebPartTitle}>
      <Stack tokens={{ childrenGap: 16 }}>
        <div className={styles.header}>
          <div>
            <Text variant="xxLarge" as="h2" className={styles.title} block>
              {resolvedTitle}
            </Text>
            <Text variant="medium" className={styles.subtitle} block>
              {resolvedSubtitle}
            </Text>
          </div>
          <span className={styles.sourcePill}>{resolvedSourceLabel}</span>
        </div>

        {content}
      </Stack>
    </section>
  );
}
