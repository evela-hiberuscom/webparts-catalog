import * as React from 'react';
import {
  DefaultButton,
  Dropdown,
  IDropdownOption,
  Link,
  MessageBar,
  MessageBarType,
  SearchBox,
  Spinner,
  Text
} from '@fluentui/react';
import * as strings from 'SmartFaqWebPartStrings';

import { useSmartFaq } from '../hooks/useSmartFaq';
import type { ISmartFaqItem } from '../models/smartFaqModels';
import { formatDate } from '../utils/smartFaqUtils';
import type { ISmartFaqProps } from './ISmartFaqProps';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';
import styles from './SmartFaq.module.scss';

function renderFaqItem(
  item: ISmartFaqItem,
  expanded: boolean,
  onToggle: (id: string) => void,
  localeName: string
): React.ReactElement {
  const updatedAt = formatDate(item.updatedAt, localeName);

  return (
    <article key={item.id} className={styles.faqItem}>
      <button
        type="button"
        className={styles.questionButton}
        aria-expanded={expanded}
        aria-controls={`faq-${item.id}`}
        onClick={() => onToggle(item.id)}
      >
        <span className={styles.questionText}>{item.question}</span>
        <span className={styles.chevron}>{expanded ? strings.CollapseButtonLabel : strings.ExpandButtonLabel}</span>
      </button>

      {expanded ? (
        <div id={`faq-${item.id}`} className={styles.answerPanel}>
          <p className={styles.answer}>{item.answer}</p>
          <div className={styles.metaRow}>
            <span className={styles.categoryPill}>{item.category}</span>
            {item.isFeatured ? <span className={styles.featuredBadge}>{strings.FeaturedBadgeLabel}</span> : null}
            {(!item.relatedUrl || !item.category) ? <span className={styles.partialBadge}>{strings.PartialBadgeLabel}</span> : null}
            {updatedAt ? <span className={styles.updatedPill}>{strings.UpdatedAtLabel} {updatedAt}</span> : null}
          </div>
          {item.aliases.length ? (
            <div className={styles.aliasesRow} aria-label={strings.AliasesLabel}>
              {item.aliases.map((alias) => (
                <span key={`${item.id}-${alias}`} className={styles.aliasPill}>
                  {alias}
                </span>
              ))}
            </div>
          ) : null}
          {item.relatedUrl ? (
            <Link href={item.relatedUrl} target="_blank" rel="noreferrer" className={styles.relatedLink}>
              {strings.RelatedLinkLabel}
            </Link>
          ) : null}
        </div>
      ) : null}
    </article>
  );
}

export default function SmartFaq(props: ISmartFaqProps): React.ReactElement {
  const {
    state,
    visibleItems,
    search,
    selectedCategory,
    expandedId,
    setSearch,
    setSelectedCategory,
    toggleExpanded,
    reload
  } = useSmartFaq(props.service, props.configuration);

  const categoryOptions: IDropdownOption[] = [
    { key: 'all', text: strings.AllCategoriesLabel },
    ...state.categories.map((category) => ({ key: category, text: category }))
  ];

  return (
    <WebPartErrorBoundary title={strings.ErrorBoundaryTitle} message={strings.ErrorBoundaryMessage}>
      <section className={styles.smartFaq} aria-label={props.configuration.title}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>{props.userDisplayName}</p>
            <Text as="h2" variant="xLarge" className={styles.title}>
              {props.configuration.title}
            </Text>
            <p className={styles.description}>{props.configuration.description}</p>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.metaPill}>{state.items.length} {strings.ResultsCounterLabel}</span>
            <span className={styles.metaPillSecondary}>{props.configuration.enableSearch ? strings.SearchEnabledLabel : strings.SearchDisabledLabel}</span>
          </div>
        </header>

        {props.environmentMessage ? (
          <MessageBar messageBarType={MessageBarType.info} isMultiline={false}>
            {props.environmentMessage}
          </MessageBar>
        ) : null}

        <div className={styles.filtersRow}>
          {props.configuration.enableSearch ? (
            <SearchBox
              value={search}
              onChange={(_, value) => setSearch(value || '')}
              placeholder={strings.SearchPlaceholder}
              className={styles.searchBox}
            />
          ) : null}
          <Dropdown
            selectedKey={selectedCategory}
            options={categoryOptions}
            label={strings.CategoryFilterLabel}
            onChange={(_, option) => setSelectedCategory(String(option?.key || 'all'))}
            className={styles.dropdown}
          />
        </div>

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

        {state.status !== 'loading' && state.status !== 'error' && visibleItems.length === 0 ? (
          <div className={styles.statePanel}>
            <Text variant="medium">{strings.EmptyMessage}</Text>
          </div>
        ) : null}

        {visibleItems.length > 0 ? (
          <div className={styles.faqList}>
            {visibleItems.map((item) => renderFaqItem(item, expandedId === item.id, toggleExpanded, props.localeName))}
          </div>
        ) : null}
      </section>
    </WebPartErrorBoundary>
  );
}
