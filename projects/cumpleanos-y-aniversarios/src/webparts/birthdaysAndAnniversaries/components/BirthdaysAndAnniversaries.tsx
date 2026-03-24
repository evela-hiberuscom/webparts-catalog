import * as React from 'react';
import { MessageBar, MessageBarType, Spinner, SpinnerSize, Stack, Text } from '@fluentui/react';
import styles from './BirthdaysAndAnniversaries.module.scss';
import type { IBirthdaysAndAnniversariesProps } from './IBirthdaysAndAnniversariesProps';
import CelebrationCard from './CelebrationCard';
import CelebrationsEmptyState from './CelebrationsEmptyState';
import { useCelebrations } from '../hooks/useCelebrations';
import { CelebrationService } from '../services/celebrationService';

function CelebrationSection(props: {
  title: string;
  items: React.ReactElement[];
}): React.ReactElement | null {
  if (props.items.length === 0) {
    return null;
  }

  return (
    <section className={styles.section} aria-label={props.title}>
      <Text variant="large" as="h3" className={styles.sectionTitle} block>
        {props.title}
      </Text>
      <div className={styles.cardList} role="list">
        {props.items}
      </div>
    </section>
  );
}

export default function BirthdaysAndAnniversaries(props: IBirthdaysAndAnniversariesProps): React.ReactElement {
  const service = React.useMemo(() => new CelebrationService(), []);
  const { status, title, subtitle, sourceLabel, todayItems, upcomingItems, partialItems, items, errorMessage, hasPartialData, notes, refresh } = useCelebrations(
    {
      spHttpClient: props.spHttpClient,
      webAbsoluteUrl: props.webAbsoluteUrl,
      dataSourceTypes: props.dataSourceTypes,
      directoryJsonUrl: props.directoryJsonUrl,
      listTitleOrUrl: props.listTitleOrUrl,
      jsonUrl: props.jsonUrl,
      showBirthdays: props.showBirthdays,
      showAnniversaries: props.showAnniversaries,
      daysAhead: props.daysAhead,
      title: 'Cumpleaños y aniversarios',
      subtitle: 'Reconoce los hitos de hoy y los próximos en una vista ligera.'
    },
    service
  );

  if (status === 'loading') {
    return (
      <section className={styles.root} aria-label="Cumpleaños y aniversarios">
        <Stack tokens={{ childrenGap: 16 }}>
          <div className={styles.header}>
            <div>
              <Text variant="xxLarge" as="h2" className={styles.title} block>
                {title}
              </Text>
              <Text variant="medium" className={styles.subtitle} block>
                {subtitle}
              </Text>
            </div>
            <span className={styles.sourcePill}>{sourceLabel}</span>
          </div>
          <Spinner size={SpinnerSize.medium} label="Cargando celebraciones" />
        </Stack>
      </section>
    );
  }

  const content = (() => {
    if (status === 'error') {
      return (
        <CelebrationsEmptyState
          title="No se han podido cargar las celebraciones"
          message={errorMessage ?? 'Revisa el origen configurado y vuelve a intentarlo.'}
          variant="error"
          actionLabel="Reintentar"
          onAction={refresh}
        />
      );
    }

    if (items.length === 0) {
      return (
        <CelebrationsEmptyState
          title={status === 'partialData' ? 'Solo hay información parcial disponible' : 'No hay celebraciones próximas'}
          message={status === 'partialData' ? 'Algunos registros tienen campos incompletos y se han mantenido visibles como referencia.' : 'No hay hitos dentro de la ventana configurada.'}
          variant={status === 'partialData' ? 'warning' : 'info'}
          actionLabel="Actualizar"
          onAction={refresh}
        />
      );
    }

    return (
      <Stack tokens={{ childrenGap: 20 }}>
        {hasPartialData ? (
          <MessageBar messageBarType={MessageBarType.warning} isMultiline={false} className={styles.messageBar}>
            Algunos registros se han normalizado con datos parciales. La vista sigue siendo utilizable.
          </MessageBar>
        ) : null}

        {notes.length > 0 ? (
          <MessageBar messageBarType={MessageBarType.info} isMultiline={false} className={styles.messageBar}>
            Origen: {sourceLabel}
          </MessageBar>
        ) : (
          <div className={styles.sourceLine}>Origen: {sourceLabel}</div>
        )}

        <CelebrationSection
          title="Hoy"
          items={todayItems.map((item) => (
            <CelebrationCard key={item.id} item={item} sectionLabel="Hoy" />
          ))}
        />

        <CelebrationSection
          title="Próximos"
          items={upcomingItems.map((item) => (
            <CelebrationCard key={item.id} item={item} sectionLabel="Próximos" />
          ))}
        />

        <CelebrationSection
          title="Datos parciales"
          items={partialItems.map((item) => (
            <CelebrationCard key={item.id} item={item} sectionLabel="Datos parciales" />
          ))}
        />
      </Stack>
    );
  })();

  return (
    <section className={styles.root} aria-label="Cumpleaños y aniversarios">
      <Stack tokens={{ childrenGap: 16 }}>
        <div className={styles.header}>
          <div>
            <Text variant="xxLarge" as="h2" className={styles.title} block>
              {title}
            </Text>
            <Text variant="medium" className={styles.subtitle} block>
              {subtitle}
            </Text>
          </div>
          <span className={styles.sourcePill}>{sourceLabel}</span>
        </div>

        {content}
      </Stack>
    </section>
  );
}

