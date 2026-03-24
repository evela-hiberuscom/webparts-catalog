import * as React from 'react';
import styles from './AlertBanner.module.scss';
import type { IAlertItem } from '../models/alertModels';
import { isAlertPartial } from '../utils/alertRules';

interface IAlertBannerProps {
  alert: IAlertItem;
  dismissible: boolean;
  onDismiss?: () => void;
}

function getSeverityLabel(severity: IAlertItem['severity']): string {
  switch (severity) {
    case 'critical':
      return 'Crítico';
    case 'warning':
      return 'Aviso';
    case 'info':
      return 'Info';
    default:
      return 'No clasificado';
  }
}

export default function AlertBanner(props: IAlertBannerProps): React.ReactElement<IAlertBannerProps> {
  const { alert, dismissible, onDismiss } = props;
  const partial = isAlertPartial(alert);
  const severityClass =
    alert.severity === 'critical' ? styles.critical : alert.severity === 'warning' ? styles.warning : styles.info;

  return (
    <article className={`${styles.banner} ${severityClass}`} role={alert.severity === 'critical' ? 'alert' : 'status'}>
      <div className={styles.accent} aria-hidden="true" />
      <div className={styles.body}>
        <div className={styles.headerRow}>
          <span className={styles.badge}>{getSeverityLabel(alert.severity)}</span>
          {partial ? <span className={styles.partial}>Datos parciales</span> : null}
          {dismissible ? (
            <button
              type="button"
              className={styles.dismissButton}
              onClick={onDismiss}
              aria-label={`Ocultar aviso ${alert.title}`}
            >
              <span aria-hidden="true">×</span>
            </button>
          ) : null}
        </div>

        <h3 className={styles.title}>{alert.title}</h3>

        {alert.message ? <p className={styles.message}>{alert.message}</p> : null}

        <div className={styles.footerRow}>
          <span className={styles.meta}>
            {alert.priority !== undefined ? `Prioridad ${alert.priority}` : 'Sin prioridad explícita'}
          </span>

          {alert.ctaUrl ? (
            <a className={styles.cta} href={alert.ctaUrl}>
              Abrir detalle
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
