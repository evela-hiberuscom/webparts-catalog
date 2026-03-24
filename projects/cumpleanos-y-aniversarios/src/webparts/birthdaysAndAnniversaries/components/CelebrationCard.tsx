import * as React from 'react';
import { Persona, PersonaSize, Stack, Text } from '@fluentui/react';
import styles from './BirthdaysAndAnniversaries.module.scss';
import type { ICelebrationItem } from '../models/celebrationModels';

export interface ICelebrationCardProps {
  item: ICelebrationItem;
  sectionLabel: string;
}

function getBadgeLabel(item: ICelebrationItem): string {
  if (item.isToday) {
    return 'Hoy';
  }

  if (item.celebrationType === 'birthday') {
    return 'Cumpleaños';
  }

  if (item.celebrationType === 'anniversary') {
    return 'Aniversario';
  }

  return 'Datos parciales';
}

export default function CelebrationCard(props: ICelebrationCardProps): React.ReactElement {
  const { item, sectionLabel } = props;

  return (
    <article className={`${styles.card} ${item.isToday ? styles.cardToday : ''}`} role="listitem" aria-label={`${item.displayName} en ${sectionLabel}`}>
      <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="center">
        <Persona
          text={item.avatarText}
          imageUrl={item.photoUrl ?? undefined}
          size={PersonaSize.size72}
          hidePersonaDetails
          className={styles.persona}
        />

        <Stack grow tokens={{ childrenGap: 6 }}>
          <Text variant="mediumPlus" as="h3" className={styles.cardTitle} block>
            {item.displayName}
          </Text>
          <Text variant="small" className={styles.cardMeta} block>
            {item.dateLabel}
          </Text>
          <Text variant="small" className={styles.cardMeta} block>
            {item.daysRemaining === 0 ? 'Celebración de hoy' : item.daysRemaining === null ? 'Fecha pendiente de validar' : `Faltan ${item.daysRemaining} días`}
          </Text>
        </Stack>

        <span className={styles.badge}>{getBadgeLabel(item)}</span>
      </Stack>

      <Text variant="small" className={styles.cardFooter} block>
        {item.isPartial ? 'Información parcial normalizada para no ocultar el hito.' : 'Información completa.'}
      </Text>
    </article>
  );
}

