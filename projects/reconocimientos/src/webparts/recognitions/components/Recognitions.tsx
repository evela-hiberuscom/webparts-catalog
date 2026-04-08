import * as React from 'react';
import { Icon, Text } from '@fluentui/react';

import * as strings from 'RecognitionsWebPartStrings';
import { useRecognitions } from '../hooks/useRecognitions';
import type { IRecognitionsProps } from './IRecognitionsProps';
import { RecognitionCard } from './RecognitionCard';
import { RecognitionsState } from './RecognitionsState';
import styles from './Recognitions.module.scss';

export default function Recognitions({
  configuration,
  service,
  localeName
}: IRecognitionsProps): React.ReactElement {
  const viewModel = useRecognitions({ configuration, service });

  return (
    <section className={styles.recognitions} aria-label={viewModel.title}>
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
            <Icon iconName="FavoriteStarFill" aria-hidden="true" />
            <span>{viewModel.items.length} {strings.RecognitionsCountLabel}</span>
          </span>
          <span className={styles.metaPillSecondary}>{viewModel.sourceLabel}</span>
        </div>
      </header>

      <RecognitionsState state={viewModel.state} />

      {viewModel.items.length > 0 ? (
        <div className={styles.feed} role="list">
          {viewModel.items.map((item) => (
            <RecognitionCard
              key={item.id}
              item={item}
              localeName={localeName}
              showPhotos={configuration.showPhotos}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}
