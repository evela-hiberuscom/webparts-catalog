import * as React from 'react';
import { Link, Persona, PersonaSize, Stack, Text } from '@fluentui/react';

import { createSafeExternalLink } from '@paquete/spfx-common';

import type { ITeamMember } from '../models/teamMemberModels';
import styles from './MeetTheTeam.module.scss';

interface ITeamMemberCardProps {
  member: ITeamMember;
}

export function TeamMemberCard(props: ITeamMemberCardProps): React.ReactElement {
  const profileLink = props.member.profileUrl ? createSafeExternalLink(props.member.profileUrl) : undefined;

  return (
    <article className={styles.card} aria-label={props.member.displayName}>
      <Stack tokens={{ childrenGap: 12 }}>
        <Persona
          imageUrl={props.member.photoUrl}
          text={props.member.displayName}
          imageInitials={props.member.initials}
          size={PersonaSize.size72}
          hidePersonaDetails={false}
          styles={{
            primaryText: { fontWeight: 700, color: '#111111' },
            secondaryText: { color: '#3a3a3a' }
          }}
        />
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="mediumPlus" className={styles.cardName}>
            {props.member.displayName}
          </Text>
          <Text variant="smallPlus" className={styles.cardRole}>
            {props.member.jobTitle}
          </Text>
          {props.member.bio ? (
            <Text variant="small" className={styles.cardBio}>
              {props.member.bio}
            </Text>
          ) : null}
        </Stack>

        <Stack horizontal tokens={{ childrenGap: 12 }} horizontalAlign="start" verticalAlign="center">
          {profileLink ? (
            <Link href={profileLink.href} rel={profileLink.rel} target={profileLink.target} className={styles.cardLink}>
              Ver perfil
            </Link>
          ) : (
            <Text variant="small" className={styles.cardMeta}>
              Tarjeta informativa
            </Text>
          )}
          {props.member.partialData ? (
            <span className={styles.partialBadge} aria-label="Datos parciales">
              Parcial
            </span>
          ) : null}
        </Stack>
      </Stack>
    </article>
  );
}
