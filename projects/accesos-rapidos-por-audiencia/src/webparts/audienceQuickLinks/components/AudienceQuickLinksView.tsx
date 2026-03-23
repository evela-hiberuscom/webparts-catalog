import * as React from 'react';

import type {
  IAudienceLinkRecord,
  IAudienceQuickLinksHostContext,
  IAudienceQuickLinksViewModel
} from '../models/audienceLinkModels';
import { AudienceFilters } from './AudienceFilters';
import { AudienceLinkCard } from './AudienceLinkCard';
import { AudienceStatePanel } from './AudienceStatePanel';
import styles from './AudienceQuickLinks.module.scss';

interface IAudienceQuickLinksViewProps {
  viewModel: IAudienceQuickLinksViewModel;
  hostContext: IAudienceQuickLinksHostContext;
  showAudienceHint: boolean;
  onRetry: () => void;
  onSelectCategory: (category: string) => void;
  onLinkOpened?: (item: IAudienceLinkRecord) => void;
}

export function AudienceQuickLinksView(props: IAudienceQuickLinksViewProps): React.ReactElement {
  const vm = props.viewModel;
  const hasCards = vm.visibleItems.length > 0;
  const showFilters = vm.state !== 'loading' && vm.state !== 'error' && vm.categories.length > 1;
  const emptyMessage =
    vm.selectedCategory !== 'Todas'
      ? 'No hay accesos para esta categoría. Prueba con otra categoría o limpia el filtro.'
      : 'No hay accesos disponibles para tu perfil.';

  return (
    <section className={styles.root} aria-label={vm.title}>
      <header className={styles.hero}>
        <div className={styles.heroEyebrow}>Navegación contextual</div>
        <div className={styles.heroHeader}>
          <div>
            <h2 className={styles.title}>{vm.title}</h2>
            {vm.description ? <p className={styles.subtitle}>{vm.description}</p> : null}
          </div>
          <div className={styles.heroMeta}>
            <span className={styles.heroMetaLabel}>Fuente</span>
            <span className={styles.heroMetaValue}>{vm.sourceLabel}</span>
            <span className={styles.heroMetaLabel}>Audiencia</span>
            <span className={styles.heroMetaValue}>{vm.resolvedAudienceLabel}</span>
          </div>
        </div>
        {props.showAudienceHint ? (
          <div className={styles.audienceHint} aria-label="Tokens de audiencia resueltos">
            {vm.resolvedAudienceTokens.length > 0 ? (
              vm.resolvedAudienceTokens.slice(0, 3).map((token) => (
                <span key={token} className={styles.hintBadge}>
                  {token}
                </span>
              ))
            ) : (
              <span className={styles.hintBadge}>general</span>
            )}
          </div>
        ) : null}
      </header>

      <div className={styles.body}>
        {vm.state === 'loading' ? (
          <AudienceStatePanel
            state="loading"
            title="Cargando"
            message="Resolvemos la audiencia y preparamos los accesos."
          />
        ) : (
          <>
            {vm.state === 'error' ? (
              <AudienceStatePanel
                state="error"
                title="No se han podido cargar los accesos segmentados."
                message="Revisa la configuración de la lista o vuelve a intentar la carga."
                actionLabel="Reintentar"
                onAction={props.onRetry}
              />
            ) : null}

            {vm.state === 'partialData' ? (
              <AudienceStatePanel
                state="partialData"
                title="Se han usado accesos de reserva."
                message="Faltan algunas señales de audiencia o parte del catálogo no está completo."
                actionLabel="Reintentar"
                onAction={props.onRetry}
              />
            ) : null}

            {vm.state === 'empty' ? (
              <AudienceStatePanel
                state="empty"
                title="No hay accesos disponibles para tu perfil."
                message={emptyMessage}
                actionLabel="Reintentar"
                onAction={props.onRetry}
              />
            ) : null}

            {showFilters ? (
              <AudienceFilters
                categories={vm.categories}
                selectedCategory={vm.selectedCategory}
                onSelectCategory={props.onSelectCategory}
              />
            ) : null}

            {hasCards ? (
              <>
                <div className={styles.grid} aria-live="polite">
                  {vm.visibleItems.map((item) => (
                    <AudienceLinkCard
                      key={item.id}
                      item={item}
                      hostContext={props.hostContext}
                      onLinkOpened={props.onLinkOpened}
                      showAudienceHint={props.showAudienceHint}
                    />
                  ))}
                </div>
              </>
            ) : null}
          </>
        )}
      </div>

      <footer className={styles.footer}>
        <span>Estado: {vm.state}</span>
        <span>Notas: {vm.notes.length > 0 ? vm.notes[0] : 'sin incidencias'}</span>
      </footer>
    </section>
  );
}
