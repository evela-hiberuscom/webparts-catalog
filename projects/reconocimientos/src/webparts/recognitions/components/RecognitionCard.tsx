import * as React from 'react';
import { Persona, PersonaSize, Text } from '@fluentui/react';

import * as strings from 'RecognitionsWebPartStrings';
import type { IRecognitionItem } from '../models/recognitionsModels';
import styles from './Recognitions.module.scss';

function formatDate(date: string | undefined, localeName: string): string {
  if (!date) {
    return strings.DateUnavailableLabel;
  }

  return new Intl.DateTimeFormat(localeName, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).format(new Date(date));
}

interface IRecognitionCardProps {
  item: IRecognitionItem;
  localeName: string;
  showPhotos: boolean;
}

export function RecognitionCard({
  item,
  localeName,
  showPhotos
}: IRecognitionCardProps): React.ReactElement {
  return (
    <article className={styles.card} role="listitem">
      <div className={styles.cardHeader}>
        <Persona
          text={item.targetName}
          hidePersonaDetails={true}
          size={PersonaSize.size48}
          imageUrl={showPhotos ? item.photoUrl : undefined}
        />
        <div className={styles.identity}>
          <Text as="h3" variant="mediumPlus" className={styles.cardTitle}>
            {item.targetName}
          </Text>
          <div className={styles.metaRow}>
            <span className={styles.dateChip}>{formatDate(item.date, localeName)}</span>
            {item.isPartial ? <span className={styles.partialBadge}>{strings.PartialBadgeLabel}</span> : null}
          </div>
        </div>
      </div>

      <p className={styles.message}>{item.message ?? strings.MissingMessageFallback}</p>

      {item.hasAction && item.detailUrl ? (
        <a className={styles.actionLink} href={item.detailUrl} target="_blank" rel="noreferrer">
          {strings.OpenDetailButtonLabel}
        </a>
      ) : null}
    </article>
  );
}
