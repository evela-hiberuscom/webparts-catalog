import * as React from 'react';
import { DefaultButton, Persona, PersonaSize, Stack, Text } from '@fluentui/react';
import { createSafeExternalLink } from '@paquete/spfx-common';
import type { IPersonItem } from '../models/expressDirectoryModels';
import styles from './ExpressDirectory.module.scss';

export interface IPersonRowProps {
  person: IPersonItem;
  partialLabel: string;
  emailLabel: string;
  profileLabel: string;
}

function buildMailto(person: IPersonItem): string | undefined {
  return person.email ? `mailto:${encodeURIComponent(person.email)}` : undefined;
}

export function PersonRow(props: IPersonRowProps): React.ReactElement<IPersonRowProps> {
  const profileLink = props.person.profileUrl ? createSafeExternalLink(props.person.profileUrl) : undefined;
  const emailLink = buildMailto(props.person);

  return (
    <article className={styles.personRow} role="listitem" aria-label={props.person.displayName}>
      <Persona
        text={props.person.displayName}
        secondaryText={props.person.jobTitle || props.partialLabel}
        tertiaryText={props.person.area || props.partialLabel}
        imageUrl={props.person.photoUrl || undefined}
        size={PersonaSize.size72}
        imageAlt={props.person.displayName}
      />
      <Stack tokens={{ childrenGap: 8 }} className={styles.personActions}>
        <Text variant="small">
          {props.person.jobTitle || props.partialLabel}
        </Text>
        <Text variant="small">
          {props.person.area || props.partialLabel}
        </Text>
        <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
          {profileLink && (
            <DefaultButton
              text={props.profileLabel}
              href={profileLink.href}
              rel={profileLink.rel}
              target={profileLink.target as '_blank'}
              iconProps={{ iconName: 'ContactCard' }}
            />
          )}
          {emailLink && (
            <DefaultButton
              text={props.emailLabel}
              href={emailLink}
              iconProps={{ iconName: 'Mail' }}
            />
          )}
        </Stack>
      </Stack>
    </article>
  );
}
