import * as React from 'react';
import { DefaultButton, Persona, PersonaSize, PrimaryButton, Stack, Text } from '@fluentui/react';
import * as strings from 'MiniOrgChartWebPartStrings';
import type { IOrgPerson } from '../models/miniOrgChartModels';
import { createProfileLink } from '../utils/miniOrgChartUtils';
import styles from './MiniOrgChart.module.scss';

export interface IOrgNodeCardProps {
  person: IOrgPerson;
  isRoot?: boolean;
}

export function OrgNodeCard(props: IOrgNodeCardProps): React.ReactElement<IOrgNodeCardProps> {
  const profileLink = createProfileLink(props.person);

  return (
    <article className={`${styles.nodeCard} ${props.isRoot ? styles.nodeCardRoot : ''}`}>
      <Stack horizontalAlign="start" tokens={{ childrenGap: 12 }}>
        <Persona
          text={props.person.displayName}
          secondaryText={props.person.jobTitle}
          imageUrl={props.person.photoUrl}
          size={props.isRoot ? PersonaSize.size72 : PersonaSize.size48}
        />
        <Stack tokens={{ childrenGap: 6 }} styles={{ root: { width: '100%' } }}>
          <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 8 }} wrap>
            <Text variant={props.isRoot ? 'xLarge' : 'mediumPlus'} block={true}>
              {props.person.displayName}
            </Text>
            {props.isRoot ? <span className={styles.badge}>{strings.RootBadgeLabel}</span> : null}
            {props.person.isPartial ? <span className={styles.badgeMuted}>{strings.PartialBadgeLabel}</span> : null}
          </Stack>
          {props.person.jobTitle ? (
            <Text variant="medium" block={true}>{props.person.jobTitle}</Text>
          ) : null}
          {props.person.department ? (
            <Text variant="small" block={true}>{props.person.department}</Text>
          ) : null}
          <Stack horizontal tokens={{ childrenGap: 8 }} wrap>
            {profileLink ? (
              <PrimaryButton href={profileLink.href} target={profileLink.target} rel={profileLink.rel}>
                {strings.OpenProfileLabel}
              </PrimaryButton>
            ) : (
              <DefaultButton disabled={true}>{strings.OpenProfileLabel}</DefaultButton>
            )}
          </Stack>
        </Stack>
      </Stack>
    </article>
  );
}

