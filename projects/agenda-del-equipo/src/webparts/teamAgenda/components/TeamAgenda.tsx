import * as React from 'react';
import { Dropdown, Icon, Link, MessageBar, MessageBarType, Text, type IDropdownOption } from '@fluentui/react';
import * as strings from 'TeamAgendaWebPartStrings';

import { useTeamAgenda } from '../hooks/useTeamAgenda';
import type { AgendaGroup, IAgendaItem } from '../models/teamAgendaModels';
import type { ITeamAgendaProps } from './ITeamAgendaProps';
import { TeamAgendaState } from './TeamAgendaState';
import styles from './TeamAgenda.module.scss';

function buildGroupLabel(group: AgendaGroup): string {
  switch (group) {
    case 'today':
      return strings.TodayGroupLabel;
    case 'tomorrow':
      return strings.TomorrowGroupLabel;
    case 'past':
      return strings.PastGroupLabel;
    case 'upcoming':
    default:
      return strings.UpcomingGroupLabel;
  }
}

function formatDateRange(item: IAgendaItem, localeName: string): string {
  if (!item.startsAt) {
    return strings.DateUnavailableLabel;
  }

  const startsAt = new Date(item.startsAt);
  const startText = new Intl.DateTimeFormat(localeName, {
    weekday: 'short',
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit'
  }).format(startsAt);

  if (!item.endsAt) {
    return startText;
  }

  const endsAt = new Date(item.endsAt);
  const endText = new Intl.DateTimeFormat(localeName, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(endsAt);

  return `${startText} - ${endText}`;
}

function renderAgendaItem(item: IAgendaItem, localeName: string): React.ReactElement {
  const actionUrl = item.joinUrl ?? item.openUrl;

  return (
    <article key={item.id} className={styles.agendaCard}>
      <div className={styles.cardMeta}>
        <span className={styles.metaBadge}>{buildGroupLabel(item.group)}</span>
        {item.eventType ? <span className={styles.metaBadgeSecondary}>{item.eventType}</span> : undefined}
        {item.isPartial ? <span className={styles.metaBadgeSecondary}>{strings.PartialBadgeLabel}</span> : undefined}
      </div>

      <Text as="h3" variant="mediumPlus" className={styles.cardTitle}>
        {item.title}
      </Text>

      <p className={styles.cardDetail}>
        <Icon iconName="Calendar" aria-hidden="true" />
        <span>{formatDateRange(item, localeName)}</span>
      </p>

      {item.location ? (
        <p className={styles.cardDetail}>
          <Icon iconName="POI" aria-hidden="true" />
          <span>{item.location}</span>
        </p>
      ) : undefined}

      {actionUrl ? (
        <div className={styles.cardActions}>
          <Link href={actionUrl} target="_blank" rel="noreferrer">
            {item.joinUrl ? strings.JoinActionLabel : strings.OpenActionLabel}
          </Link>
        </div>
      ) : undefined}
    </article>
  );
}

export default function TeamAgenda(props: ITeamAgendaProps): React.ReactElement {
  const viewModel = useTeamAgenda({
    configuration: props.configuration,
    service: props.service
  });

  const filterOptions: IDropdownOption[] = [
    { key: '', text: strings.AllTypesOptionLabel },
    ...viewModel.availableTypes.map((type) => ({ key: type, text: type }))
  ];

  const groupedItems = viewModel.visibleItems.reduce<Record<AgendaGroup, IAgendaItem[]>>(
    (accumulator, item) => {
      accumulator[item.group] = [...accumulator[item.group], item];
      return accumulator;
    },
    {
      today: [],
      tomorrow: [],
      upcoming: [],
      past: [],
      unknown: []
    }
  );

  return (
    <section className={`${styles.teamAgenda} ${props.hasTeamsContext ? styles.teams : ''} ${props.isDarkTheme ? styles.dark : ''}`} aria-label={viewModel.title}>
      <header className={styles.header}>
        <div className={styles.headerCopy}>
          <p className={styles.kicker}>{strings.KickerLabel}</p>
          <Text as="h2" variant="xLarge" className={styles.title}>
            {viewModel.title}
          </Text>
          <p className={styles.description}>{viewModel.description}</p>
        </div>

        <div className={styles.headerMeta}>
          <span className={styles.metaPill}>
            <Icon iconName="Calendar" aria-hidden="true" />
            <span>{viewModel.visibleItems.length} {strings.EventsCountLabel}</span>
          </span>
        </div>
      </header>

      {props.environmentMessage ? (
        <MessageBar messageBarType={MessageBarType.info} isMultiline className={styles.environmentBar}>
          {props.environmentMessage}
        </MessageBar>
      ) : undefined}

      {viewModel.availableTypes.length > 0 ? (
        <div className={styles.filters}>
          <Dropdown
            label={strings.FilterLabel}
            selectedKey={viewModel.selectedType}
            options={filterOptions}
            onChange={(_, option) => viewModel.setSelectedType(String(option?.key ?? ''))}
          />
        </div>
      ) : undefined}

      {viewModel.hasPartialData && viewModel.visibleItems.length > 0 ? (
        <MessageBar messageBarType={MessageBarType.warning} isMultiline className={styles.stateBar}>
          {strings.PartialStateMessage}
        </MessageBar>
      ) : undefined}

      <TeamAgendaState state={viewModel.state} />

      {viewModel.visibleItems.length > 0 ? (
        <div className={styles.feed}>
          {(['today', 'tomorrow', 'upcoming', 'past'] as AgendaGroup[]).map((group) =>
            groupedItems[group].length > 0 ? (
              <section key={group}>
                <Text as="h3" variant="large" className={styles.cardTitle}>
                  {buildGroupLabel(group)}
                </Text>
                <div className={styles.feed}>
                  {groupedItems[group].map((item) => renderAgendaItem(item, props.localeName))}
                </div>
              </section>
            ) : undefined
          )}
        </div>
      ) : undefined}
    </section>
  );
}
