import * as React from 'react';
import { PrimaryButton, Spinner, SpinnerSize } from '@fluentui/react';
import styles from './UrgentAlertBar.module.scss';
import type { IUrgentAlertBarProps } from './IUrgentAlertBarProps';
import AlertBanner from './AlertBanner';
import { AlertsRepository } from '../repositories/alertsRepository';
import { AlertBarService } from '../services/alertBarService';
import { useAlertBar } from '../hooks/useAlertBar';

export default function UrgentAlertBar(props: IUrgentAlertBarProps): React.ReactElement<IUrgentAlertBarProps> {
  const repositoryRef = React.useRef<AlertsRepository | null>(null);
  const repository = repositoryRef.current ?? (repositoryRef.current = new AlertsRepository(props.spHttpClient, props.webAbsoluteUrl));

  const serviceRef = React.useRef<AlertBarService | null>(null);
  const service = serviceRef.current ?? (serviceRef.current = new AlertBarService(repository));

  const [dismissedIds, setDismissedIds] = React.useState<string[]>([]);
  const state = useAlertBar({
    service,
    request: {
      dataSourceType: props.dataSourceType,
      listTitleOrUrl: props.listTitleOrUrl,
      jsonUrl: props.jsonUrl,
      staticConfigJson: props.staticConfigJson,
      maxAlerts: props.maxAlerts,
      dismissible: props.dismissible,
      webAbsoluteUrl: props.webAbsoluteUrl
    }
  });

  const visibleAlerts = state.items.filter((alert) => dismissedIds.indexOf(alert.id) === -1);
  const hasVisibleAlerts = visibleAlerts.length > 0;

  const handleDismiss = (alertId: string): void => {
    setDismissedIds((current) => current.concat(alertId));
  };

  return (
    <section className={styles.root} aria-label="Avisos urgentes">
      <div className={styles.header}>
        <div>
          <p className={styles.kicker}>Avisos urgentes</p>
          <h2 className={styles.title}>Comunicación crítica visible al instante</h2>
          <p className={styles.subtitle}>
            Muestra solo avisos vigentes, ordenados por severidad y prioridad, sin ocultar estados parciales o errores de carga.
          </p>
        </div>

        <div className={styles.headerMeta}>
          <span className={styles.sourceBadge}>{state.sourceLabel ?? props.dataSourceType}</span>
          {state.hasPartialData ? <span className={styles.partialBadge}>Datos parciales</span> : null}
        </div>
      </div>

      {state.status === 'loading' ? (
        <div className={styles.loadingState} aria-live="polite">
          <Spinner size={SpinnerSize.large} label="Cargando avisos urgentes..." />
          <div className={styles.skeletonStack} aria-hidden="true">
            <span className={styles.skeletonLine} />
            <span className={styles.skeletonLineShort} />
          </div>
        </div>
      ) : null}

      {state.status === 'error' ? (
        <div className={styles.statePanel} role="alert">
          <h3 className={styles.stateTitle}>No se han podido cargar los avisos urgentes</h3>
          <p className={styles.stateMessage}>{state.errorMessage ?? 'Revisa el origen configurado y vuelve a intentarlo.'}</p>
          <PrimaryButton text="Reintentar" onClick={state.refresh} />
        </div>
      ) : null}

      {state.status === 'empty' ? (
        <div className={styles.statePanel} role="status">
          <h3 className={styles.stateTitle}>No hay avisos urgentes activos</h3>
          <p className={styles.stateMessage}>No existen alertas vigentes en este momento.</p>
        </div>
      ) : null}

      {state.status === 'ready' && hasVisibleAlerts ? (
        <div className={styles.list} role="list">
          {visibleAlerts.map((alert) => (
            <div role="listitem" key={alert.id} className={styles.listItem}>
              <AlertBanner
                alert={alert}
                dismissible={props.dismissible}
                onDismiss={() => handleDismiss(alert.id)}
              />
            </div>
          ))}
        </div>
      ) : null}

      {state.status === 'ready' && !hasVisibleAlerts ? (
        <div className={styles.statePanel} role="status">
          <h3 className={styles.stateTitle}>No hay avisos urgentes activos</h3>
          <p className={styles.stateMessage}>No existen alertas vigentes en este momento.</p>
        </div>
      ) : null}
    </section>
  );
}
