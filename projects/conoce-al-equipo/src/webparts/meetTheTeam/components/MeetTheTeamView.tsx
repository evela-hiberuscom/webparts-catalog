import * as React from 'react';
import { DefaultButton, MessageBar, MessageBarType, PrimaryButton, Stack, Text } from '@fluentui/react';

import { hiberusThemeTokens } from '@paquete/spfx-common';

import type { ITeamMembersViewModel } from '../models/teamMemberModels';
import { TeamMemberCard } from './TeamMemberCard';
import styles from './MeetTheTeam.module.scss';

interface IMeetTheTeamViewProps {
  viewModel: ITeamMembersViewModel;
  onRetry: () => void;
  isDarkTheme: boolean;
  userDisplayName: string;
}

function renderSkeletonCard(index: number): React.ReactElement {
  return (
    <article className={styles.card} key={`skeleton-${index}`} aria-hidden="true">
      <Stack tokens={{ childrenGap: 12 }}>
        <div className={styles.skeletonAvatar} />
        <div className={styles.skeletonLineLarge} />
        <div className={styles.skeletonLineSmall} />
        <div className={styles.skeletonBlock} />
      </Stack>
    </article>
  );
}

export function MeetTheTeamView(props: IMeetTheTeamViewProps): React.ReactElement {
  const vm = props.viewModel;
  const hasItems = vm.items.length > 0;
  const heroStyle: React.CSSProperties = {
    borderColor: props.isDarkTheme ? 'rgba(255, 255, 255, 0.12)' : 'rgba(16, 50, 207, 0.16)',
    background: props.isDarkTheme
      ? 'linear-gradient(135deg, rgba(25, 37, 90, 0.92), rgba(16, 50, 207, 0.84))'
      : 'linear-gradient(135deg, rgba(255, 255, 255, 0.98), rgba(247, 248, 253, 0.98))'
  };

  return (
    <section className={styles.root} aria-label={vm.title}>
      <header className={styles.hero} style={heroStyle}>
        <div className={styles.heroTopline}>
          <span className={styles.kicker}>Equipo</span>
          <span className={styles.sourceLabel}>{vm.sourceLabel}</span>
        </div>
        <Stack tokens={{ childrenGap: 10 }}>
          <Text as="h2" variant="xxLarge" className={styles.title}>
            {vm.title}
          </Text>
          <Text variant="medium" className={styles.description}>
            {vm.description}
          </Text>
        </Stack>
        <div className={styles.heroFooter}>
          <span>Estado: {vm.state}</span>
          <span>Miembros: {vm.items.length}</span>
          <span>Solicitado por: {props.userDisplayName}</span>
        </div>
      </header>

      {vm.state === 'loading' ? <div className={styles.grid} aria-live="polite">{Array.from({ length: 3 }, (_, index) => renderSkeletonCard(index))}</div> : null}

      {vm.state === 'error' ? (
        <MessageBar
          messageBarType={MessageBarType.error}
          isMultiline={true}
          actions={<div><PrimaryButton text="Reintentar" onClick={props.onRetry} /></div>}
        >
          No se ha podido cargar la información del equipo.
        </MessageBar>
      ) : null}

      {vm.state === 'partialData' ? (
        <MessageBar
          messageBarType={MessageBarType.warning}
          isMultiline={true}
          actions={<div><DefaultButton text="Reintentar" onClick={props.onRetry} /></div>}
        >
          Hay miembros con datos incompletos. Se muestran igualmente para no ocultar contexto útil.
        </MessageBar>
      ) : null}

      {vm.state === 'empty' ? (
        <MessageBar
          messageBarType={MessageBarType.info}
          isMultiline={true}
          actions={<div><DefaultButton text="Reintentar" onClick={props.onRetry} /></div>}
        >
          No hay miembros del equipo configurados.
        </MessageBar>
      ) : null}

      {hasItems ? (
        <div className={styles.grid} aria-live="polite">
          {vm.items.map((member) => (
            <TeamMemberCard key={member.id} member={member} />
          ))}
        </div>
      ) : null}

      <footer className={styles.footer}>
        <span>Fuente priorizada: {vm.sourceLabel}</span>
        <span>Datos parciales: {vm.hasPartialData ? 'sí' : 'no'}</span>
        <span style={{ color: hiberusThemeTokens.palette.primaryDark }}>SPFx 1.22.2</span>
      </footer>
    </section>
  );
}
