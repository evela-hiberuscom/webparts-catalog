import * as React from 'react';
import { DefaultButton, Dropdown, IDropdownOption, Link, MessageBar, MessageBarType, Spinner, Stack, Text, TextField, initializeIcons } from '@fluentui/react';
import * as strings from 'CorporateGlossaryWebPartStrings';

import { useCorporateGlossary } from '../hooks/useCorporateGlossary';
import type { ICorporateGlossaryItem } from '../models/corporateGlossaryModels';
import { formatGlossaryDate } from '../utils/corporateGlossaryUtils';
import type { ICorporateGlossaryProps } from './ICorporateGlossaryProps';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';
import styles from './CorporateGlossary.module.scss';

initializeIcons();

function renderItem(item: ICorporateGlossaryItem, localeName: string): React.ReactElement {
  const updatedLabel = formatGlossaryDate(item.updatedAt, localeName);

  return (
    <article key={item.id} className={styles.card}>
      <div className={styles.cardHeader}>
        <Text as="h3" variant="large" className={styles.term}>
          {item.title}
        </Text>
        <div className={styles.badges}>
          {item.featured ? <span className={styles.featuredBadge}>{strings.FeaturedBadgeLabel}</span> : null}
          {item.category ? <span className={styles.categoryBadge}>{item.category}</span> : null}
          {item.partialData ? <span className={styles.partialBadge}>{strings.PartialBadgeLabel}</span> : null}
        </div>
      </div>

      <p className={styles.definition}>{item.definition}</p>

      {item.aliases.length ? (
        <div className={styles.aliases}>
          {item.aliases.map((alias) => (
            <span key={`${item.id}-${alias}`} className={styles.aliasPill}>{alias}</span>
          ))}
        </div>
      ) : null}

      <div className={styles.cardFooter}>
        {updatedLabel ? <span className={styles.updatedAt}>{strings.UpdatedAtLabel} {updatedLabel}</span> : null}
        {item.relatedUrl ? (
          <Link href={item.relatedUrl} target="_blank" rel="noreferrer" className={styles.relatedLink}>
            {strings.OpenReferenceButton}
          </Link>
        ) : (
          <span className={styles.muted}>{strings.MissingReferenceLabel}</span>
        )}
      </div>
    </article>
  );
}

export default function CorporateGlossary(props: ICorporateGlossaryProps): React.ReactElement {
  const {
    state,
    query,
    selectedCategory,
    selectedLetter,
    setQuery,
    setSelectedCategory,
    setSelectedLetter,
    reload,
    visibleItems
  } = useCorporateGlossary(props.service, props.configuration);

  const categoryOptions: IDropdownOption[] = state.categories.map((category) => ({
    key: category,
    text: category
  }));

  const letterOptions = [strings.AllLettersLabel, ...state.letters];

  return (
    <WebPartErrorBoundary title={strings.ErrorBoundaryTitle} message={strings.ErrorBoundaryMessage}>
      <section className={styles.corporateGlossary} aria-label={props.configuration.title}>
        <Stack tokens={{ childrenGap: 16 }}>
          <header className={styles.header}>
            <div>
              <p className={styles.kicker}>{props.userDisplayName}</p>
              <Text as="h2" variant="xLarge" className={styles.title}>
                {props.configuration.title}
              </Text>
              <p className={styles.description}>{props.configuration.description}</p>
            </div>
            <div className={styles.headerMeta}>
              <span className={styles.metaPill}>{visibleItems.length} {strings.ResultsCounterLabel}</span>
              <span className={styles.metaPillSecondary}>{props.configuration.listTitle}</span>
            </div>
          </header>

          {props.environmentMessage ? (
            <MessageBar messageBarType={MessageBarType.info} isMultiline={false}>
              {props.environmentMessage}
            </MessageBar>
          ) : null}

          <div className={styles.filters}>
            <TextField
              value={query}
              onChange={(_, value) => setQuery(value ?? '')}
              placeholder={strings.SearchPlaceholder}
              aria-label={strings.SearchAriaLabel}
            />

            <Dropdown
              selectedKey={selectedCategory || strings.AllCategoriesLabel}
              options={[{ key: strings.AllCategoriesLabel, text: strings.AllCategoriesLabel }, ...categoryOptions]}
              onChange={(_, option) => setSelectedCategory(String(option?.key ?? ''))}
              label={strings.CategoryFilterLabel}
            />
          </div>

          {props.configuration.enableAlphabetNav ? (
            <div className={styles.alphabetNav} aria-label={strings.AlphabetNavLabel}>
              {letterOptions.map((letter) => (
                <button
                  key={letter}
                  type="button"
                  className={`${styles.letterButton} ${selectedLetter === (letter === strings.AllLettersLabel ? 'ALL' : letter) ? styles.letterButtonActive : ''}`}
                  onClick={() => setSelectedLetter(letter === strings.AllLettersLabel ? 'ALL' : letter)}
                >
                  {letter}
                </button>
              ))}
            </div>
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

          {state.status !== 'loading' && state.status !== 'error' && visibleItems.length === 0 ? (
            <div className={styles.statePanel}>
              <Text variant="medium">{strings.EmptyMessage}</Text>
            </div>
          ) : null}

          {visibleItems.length > 0 ? (
            <div className={styles.grid}>
              {visibleItems.map((item) => renderItem(item, props.localeName))}
            </div>
          ) : null}
        </Stack>
      </section>
    </WebPartErrorBoundary>
  );
}
