import * as React from 'react';
import {
  MessageBar,
  MessageBarType,
  Spinner,
  SpinnerSize,
  Stack,
  Text
} from '@fluentui/react';
import * as strings from 'ExpressDirectoryWebPartStrings';
import styles from './ExpressDirectory.module.scss';
import type { IExpressDirectoryProps } from '../models/expressDirectoryModels';
import { useExpressDirectory } from '../hooks/useExpressDirectory';
import { PeopleFilters } from './PeopleFilters';
import { PeopleSearchBar } from './PeopleSearchBar';
import { PersonRow } from './PersonRow';

export default function ExpressDirectory(props: IExpressDirectoryProps): React.ReactElement<IExpressDirectoryProps> {
  const state = useExpressDirectory(props);

  return (
    <section className={`${styles.expressDirectory} ${props.hasTeamsContext ? styles.teams : ''} ${props.isDarkTheme ? styles.darkTheme : ''}`}>
      <header className={styles.hero}>
        <div>
          <Text variant="xxLarge" block className={styles.title}>
            {strings.WebPartTitle}
          </Text>
          <Text variant="medium" block className={styles.subtitle}>
            {props.description || strings.WebPartSubtitle}
          </Text>
          <Text variant="small" block className={styles.meta}>
            {props.userDisplayName} · {props.environmentMessage}
          </Text>
        </div>
        <div className={styles.heroStats}>
          <Text variant="smallPlus" block>{state.items.length} {strings.ResultsCountLabel}</Text>
          <Text variant="small" block>{state.sourceLabels.join(' · ')}</Text>
        </div>
      </header>

      <Stack tokens={{ childrenGap: 16 }} className={styles.controls}>
        <PeopleSearchBar
          title={strings.SearchLabel}
          placeholder={strings.SearchPlaceholder}
          summary={strings.SearchSummaryLabel}
          refreshLabel={strings.RefreshButton}
          query={state.query}
          onQueryChange={state.actions.setQuery}
          onRefresh={state.actions.refresh}
          refreshing={state.status === 'loading'}
        />
        <PeopleFilters
          areas={state.areas}
          selectedArea={state.selectedArea}
          areaLabel={strings.AreaFilterLabel}
          allAreasLabel={strings.AllAreasOption}
          onSelectedAreaChange={state.actions.setSelectedArea}
        />
      </Stack>

      {state.status === 'loading' && (
        <div className={styles.statePanel}>
          <Spinner size={SpinnerSize.medium} label={strings.LoadingLabel} />
        </div>
      )}

      {state.status !== 'loading' && state.errorMessage && (
        <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
          {state.errorMessage}
        </MessageBar>
      )}

      {state.status === 'partialData' && !state.errorMessage && (
        <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
          {strings.PartialDataMessage}
        </MessageBar>
      )}

      {state.status === 'empty' && (
        <div className={styles.emptyState}>
          <Text variant="large" block className={styles.emptyTitle}>{strings.EmptyStateTitle}</Text>
          <Text variant="medium" block>{strings.EmptyStateMessage}</Text>
        </div>
      )}

      {state.status === 'ready' || state.status === 'partialData' ? (
        <div className={styles.peopleList} role="list" aria-label={strings.WebPartTitle}>
          {state.items.map((person) => (
            <PersonRow
              key={person.id}
              person={person}
              partialLabel={strings.PartialDataBadgeLabel}
              emailLabel={strings.ContactEmailLabel}
              profileLabel={strings.ContactProfileLabel}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

