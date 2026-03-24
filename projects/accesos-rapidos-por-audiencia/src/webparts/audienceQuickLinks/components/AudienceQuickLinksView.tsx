import * as React from 'react';
import * as strings from 'AudienceQuickLinksWebPartStrings';

import type {
  IAudienceLinkRecord,
  IAudienceQuickLinksHostContext,
  IAudienceQuickLinksViewModel
} from '../models/audienceLinkModels';
import { AudienceFilters } from './AudienceFilters';
import { AudienceLinkCard } from './AudienceLinkCard';
import { AudienceStatePanel } from './AudienceStatePanel';
import styles from './AudienceQuickLinks.module.scss';

interface IAudienceQuickLinksViewProps {
  viewModel: IAudienceQuickLinksViewModel;
  hostContext: IAudienceQuickLinksHostContext;
  showAudienceHint: boolean;
  onRetry: () => void;
  onSelectCategory: (category: string) => void;
  onLinkOpened?: (item: IAudienceLinkRecord) => void;
}

export function AudienceQuickLinksView(props: IAudienceQuickLinksViewProps): React.ReactElement {
  const vm = props.viewModel;
  const hasCards = vm.visibleItems.length > 0;
  const showFilters = vm.state !== 'loading' && vm.state !== 'error' && vm.categories.length > 1;
  const emptyMessage =
vm.selectedCategory !== strings.AllCategoriesLabel
      ? strings.EmptyStatePanelMessageNoCategory
      : strings.EmptyStatePanelMessageDefault;

  return (
    <section className={styles.root} aria-label={vm.title}>
      <header className={styles.hero}>
        <div className={styles.heroEyebrow}>{strings.ContextualNavigationLabel}</div>
        <div className={styles.heroHeader}>
          <div>
            <h2 className={styles.title}>{vm.title}</h2>
            {vm.description ? <p className={styles.subtitle}>{vm.description}</p> : null}
          </div>
          <div className={styles.heroMeta}>
            <span className={styles.heroMetaLabel}>{strings.SourceMetaLabel}</span>
            <span className={styles.heroMetaValue}>{vm.sourceLabel}</span>
            <span className={styles.heroMetaLabel}>{strings.AudienceMetaLabel}</span>
            <span className={styles.heroMetaValue}>{vm.resolvedAudienceLabel}</span>
          </div>
        </div>
        {props.showAudienceHint ? (
          <div className={styles.audienceHint} aria-label={strings.AudienceHintAriaLabel}>
            {vm.resolvedAudienceTokens.length > 0 ? (
              vm.resolvedAudienceTokens.slice(0, 3).map((token) => (
                <span key={token} className={styles.hintBadge}>
                  {token}
                </span>
              ))
            ) : (
              <span className={styles.hintBadge}>general</span>
            )}
          </div>
        ) : null}
      </header>

      <div className={styles.body}>
        {vm.state === 'loading' ? (
          <AudienceStatePanel
            state="loading"
            title={strings.LoadingStatePanelTitle}
            message={strings.LoadingStatePanelMessage}
          />
        ) : (
          <>
            {vm.state === 'error' ? (
              <AudienceStatePanel
                state="error"
                title={strings.ErrorStatePanelTitle}
                message={strings.ErrorStatePanelMessage}
                actionLabel={strings.RetryActionLabel}
                onAction={props.onRetry}
              />
            ) : null}

            {vm.state === 'partialData' ? (
              <AudienceStatePanel
                state="partialData"
                title={strings.PartialDataStatePanelTitle}
                message={strings.PartialDataStatePanelMessage}
                actionLabel={strings.RetryActionLabel}
                onAction={props.onRetry}
              />
            ) : null}

            {vm.state === 'empty' ? (
              <AudienceStatePanel
                state="empty"
                title={strings.EmptyStatePanelTitle}
                message={emptyMessage}
                actionLabel={strings.RetryActionLabel}
                onAction={props.onRetry}
              />
            ) : null}

            {showFilters ? (
              <AudienceFilters
                categories={vm.categories}
                selectedCategory={vm.selectedCategory}
                onSelectCategory={props.onSelectCategory}
              />
            ) : null}

            {hasCards ? (
              <>
                <div className={styles.grid} aria-live="polite">
                  {vm.visibleItems.map((item) => (
                    <AudienceLinkCard
                      key={item.id}
                      item={item}
                      hostContext={props.hostContext}
                      onLinkOpened={props.onLinkOpened}
                      showAudienceHint={props.showAudienceHint}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>

      <footer className={styles.footer}>
        <span>{strings.FooterStatusLabel}: {vm.state}</span>
        <span>{strings.FooterNotesLabel}: {vm.notes.length > 0 ? vm.notes[0] : strings.FooterNoIncidenciasLabel}</span>
      </footer>
    </section>
  );
}
