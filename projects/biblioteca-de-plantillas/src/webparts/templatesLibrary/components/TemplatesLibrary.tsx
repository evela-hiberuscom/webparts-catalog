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
import * as strings from 'TemplatesLibraryWebPartStrings';

import { useTemplatesLibrary } from '../hooks/useTemplatesLibrary';
import type { ITemplateItem } from '../models/templatesLibraryModels';
import { formatDate } from '../utils/templatesLibraryUtils';
import type { ITemplatesLibraryProps } from './ITemplatesLibraryProps';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';
import styles from './TemplatesLibrary.module.scss';

function renderTemplateCard(item: ITemplateItem, localeName: string): React.ReactElement {
  const updatedAt = formatDate(item.updatedAt, localeName);

  return (
    <article key={item.id} className={styles.card}>
      <div className={styles.cardBody}>
        <div className={styles.cardMeta}>
          {item.featured ? <span className={styles.featuredBadge}>{strings.FeaturedBadgeLabel}</span> : null}
          {(!item.openUrl && !item.downloadUrl) || !item.templateType || !item.category ? (
            <span className={styles.partialBadge}>{strings.PartialBadgeLabel}</span>
          ) : null}
          <span className={styles.categoryPill}>{item.category}</span>
          <span className={styles.typePill}>{item.templateType}</span>
        </div>

        <Text as="h3" variant="mediumPlus" className={styles.cardTitle}>
          {item.title}
        </Text>
        {updatedAt ? (
          <p className={styles.cardSubtitle}>{strings.UpdatedAtLabel} {updatedAt}</p>
        ) : null}

        <div className={styles.actionsRow}>
          {item.openUrl ? (
            <Link href={item.openUrl} target="_blank" rel="noreferrer">
              {strings.OpenTemplateButton}
            </Link>
          ) : null}
          {item.downloadUrl ? (
            <Link href={item.downloadUrl} target="_blank" rel="noreferrer">
              {strings.DownloadTemplateButton}
            </Link>
          ) : null}
          {!item.openUrl && !item.downloadUrl ? (
            <Text variant="small" className={styles.cardMuted}>
              {strings.MissingActionLabel}
            </Text>
          ) : null}
        </div>
      </div>
    </article>
  );
}

export default function TemplatesLibrary(props: ITemplatesLibraryProps): React.ReactElement {
  const {
    state,
    visibleItems,
    selectedCategory,
    selectedType,
    query,
    setSelectedCategory,
    setSelectedType,
    setQuery,
    reload
  } = useTemplatesLibrary(props.service, props.configuration);

  const categoryOptions: IDropdownOption[] = [
    { key: 'all', text: strings.AllCategoriesLabel },
    ...state.categories.map((category) => ({ key: category, text: category }))
  ];
  const typeOptions: IDropdownOption[] = [
    { key: 'all', text: strings.AllTypesLabel },
    ...state.types.map((type) => ({ key: type, text: type }))
  ];

  return (
    <WebPartErrorBoundary title={strings.ErrorBoundaryTitle} message={strings.ErrorBoundaryMessage}>
      <section className={styles.templatesLibrary} aria-label={props.configuration.title}>
        <header className={styles.header}>
          <div>
            <p className={styles.kicker}>{props.userDisplayName}</p>
            <Text as="h2" variant="xLarge" className={styles.title}>
              {props.configuration.title}
            </Text>
            <p className={styles.description}>{props.configuration.description}</p>
          </div>
          <div className={styles.headerMeta}>
            <span className={styles.metaPill}>{props.configuration.sourceKind}</span>
            <span className={styles.metaPillSecondary}>{state.items.length} {strings.ResultsCounterLabel}</span>
          </div>
        </header>

        {props.environmentMessage ? (
          <MessageBar messageBarType={MessageBarType.info} isMultiline={false}>
            {props.environmentMessage}
          </MessageBar>
        ) : null}

        <div className={styles.filtersRow}>
          <SearchBox
            value={query}
            onChange={(_, value) => setQuery(value || '')}
            placeholder={strings.SearchPlaceholder}
            className={styles.searchBox}
          />
          <Dropdown
            selectedKey={selectedCategory}
            options={categoryOptions}
            label={strings.CategoryFilterLabel}
            onChange={(_, option) => setSelectedCategory(String(option?.key || 'all'))}
            className={styles.dropdown}
          />
          <Dropdown
            selectedKey={selectedType}
            options={typeOptions}
            label={strings.TypeFilterLabel}
            onChange={(_, option) => setSelectedType(String(option?.key || 'all'))}
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
          <div className={styles.cardsGrid}>
            {visibleItems.map((item) => renderTemplateCard(item, props.localeName))}
          </div>
        ) : null}
      </section>
    </WebPartErrorBoundary>
  );
}
