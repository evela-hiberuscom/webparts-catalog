import * as React from 'react';
import { MessageBar, MessageBarType, Text } from '@fluentui/react';
import * as strings from 'StartARequestWebPartStrings';
import type { IStartARequestProps } from './IStartARequestProps';
import styles from './StartARequest.module.scss';
import { RequestCard } from './RequestCard';
import { RequestCategoryFilter } from './RequestCategoryFilter';
import { useStartARequest } from '../hooks/useStartARequest';

export function StartARequest(props: IStartARequestProps): React.ReactElement {
  const viewModel = useStartARequest(props);

  return (
    <section className={styles.root} aria-label={strings.WebPartTitle}>
      <div className={styles.shell}>
        <header className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{strings.WebPartEyebrow}</p>
            <h2 className={styles.title}>{props.title}</h2>
            <p className={styles.subtitle}>{props.subtitle}</p>
          </div>

          <div className={styles.heroMeta}>
            <span className={styles.metaChip}>{viewModel.sourceLabel || props.dataSourceType}</span>
            <span className={`${styles.metaChip} ${viewModel.hasPartialData ? styles.metaChipWarning : ''}`}>
              {viewModel.hasPartialData ? strings.PartialDataTitle : strings.ReadyStateLabel}
            </span>
          </div>
        </header>

        {viewModel.status === 'loading' ? (
          <MessageBar messageBarType={MessageBarType.info} isMultiline={true} className={styles.stateMessage}>
            {strings.LoadingMessage}
          </MessageBar>
        ) : null}

        {viewModel.status === 'error' ? (
          <MessageBar messageBarType={MessageBarType.error} isMultiline={true} className={styles.stateMessage}>
            {viewModel.errorMessage || strings.ErrorMessage}
          </MessageBar>
        ) : null}

        {viewModel.status === 'partialData' ? (
          <MessageBar messageBarType={MessageBarType.warning} isMultiline={true} className={styles.stateMessage}>
            {strings.PartialDataMessage}
          </MessageBar>
        ) : null}

        {viewModel.status === 'empty' ? (
          <div className={styles.emptyState}>
            <h3 className={styles.emptyTitle}>{strings.EmptyTitle}</h3>
            <p className={styles.emptyCopy}>{strings.EmptyMessage}</p>
          </div>
        ) : null}

        {viewModel.filteredItems.length > 0 ? (
          <div className={styles.panel}>
            <div className={styles.filterBlock}>
              <Text block className={styles.filterLabel}>
                {strings.CategoryFilterLabel}
              </Text>
              <RequestCategoryFilter
                categories={viewModel.categories}
                activeCategory={viewModel.activeCategory}
                onChange={viewModel.setActiveCategory}
              />
            </div>

            <div className={styles.grid} role="list" aria-label={strings.RequestGridAriaLabel}>
              {viewModel.filteredItems.map((item) => (
                <RequestCard key={item.id} item={item} showPrerequisites={props.showPrerequisites} />
              ))}
            </div>
          </div>
        ) : null}

        <Text block className={styles.footerNote}>
          {strings.FooterNote}
        </Text>
      </div>
    </section>
  );
}
