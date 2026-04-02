import * as React from 'react';
import {
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Text
} from '@fluentui/react';
import { escape } from '@microsoft/sp-lodash-subset';
import * as strings from 'HowDoIDoThisWebPartStrings';
import styles from './HowDoIDoThis.module.scss';
import type { IHowDoIDoThisProps } from './IHowDoIDoThisProps';
import { useHowDoIDoThis } from '../hooks/useHowDoIDoThis';
import { GuideCard } from './GuideCard';
import { GuideCategoryFilter } from './GuideCategoryFilter';

export default function HowDoIDoThis(props: IHowDoIDoThisProps): React.ReactElement<IHowDoIDoThisProps> {
  const viewModel = useHowDoIDoThis(props.service, props.request);

  return (
    <section className={`${styles.howDoIDoThis} ${props.hasTeamsContext ? styles.teams : ''} ${props.isDarkTheme ? styles.dark : ''}`}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <Text variant="mediumPlus" className={styles.eyebrow}>
            {escape(props.userDisplayName)}
          </Text>
          <Text variant="xxLarge" className={styles.title}>
            {escape(props.title)}
          </Text>
          <Text variant="medium" className={styles.description}>
            {escape(props.description)}
          </Text>
        </div>
        <div className={styles.summaryPanel}>
          <Text variant="small" className={styles.summaryValue}>
            {String(viewModel.visibleItems.length)}
          </Text>
          <Text variant="small" className={styles.summaryLabel}>
            {strings.VisibleGuidesLabel}
          </Text>
          {viewModel.hasPartialData ? (
            <Text variant="small" className={styles.partialFlag}>
              {strings.PartialBadgeLabel}
            </Text>
          ) : null}
        </div>
      </header>

      {props.environmentMessage ? (
        <MessageBar messageBarType={MessageBarType.info} isMultiline className={styles.environmentBar}>
          {props.environmentMessage}
        </MessageBar>
      ) : null}

      {viewModel.status === 'loading' ? (
        <div className={styles.loadingState}>
          <Spinner size={SpinnerSize.large} label={strings.LoadingMessage} />
        </div>
      ) : null}

      {viewModel.status === 'error' ? (
        <MessageBar messageBarType={MessageBarType.error} isMultiline className={styles.stateBar}>
          {strings.ErrorMessage}
        </MessageBar>
      ) : null}

      {viewModel.status !== 'loading' && viewModel.status !== 'error' ? (
        <>
          <GuideCategoryFilter
            categories={viewModel.categories}
            selectedCategory={viewModel.selectedCategory}
            onCategoryChange={viewModel.setSelectedCategory}
          />

          {viewModel.hasPartialData ? (
            <MessageBar messageBarType={MessageBarType.warning} isMultiline className={styles.stateBar}>
              {strings.PartialDataMessage}
            </MessageBar>
          ) : null}

          {viewModel.visibleItems.length ? (
            <div className={styles.guidesGrid}>
              {viewModel.visibleItems.map((guide) => (
                <GuideCard key={guide.id} guide={guide} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Text variant="large" className={styles.emptyTitle}>
                {strings.EmptyMessage}
              </Text>
              <Text variant="small" className={styles.emptyHint}>
                {strings.EmptyHint}
              </Text>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
