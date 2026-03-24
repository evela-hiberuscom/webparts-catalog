import * as React from "react";
import { DefaultButton, Icon, Text } from "@fluentui/react";
import { createSafeExternalLink } from "@paquete/spfx-common";
import type { IInternalServiceStatus } from "../models/internalServicesStatusModels";
import styles from "./InternalServicesStatus.module.scss";

const STATUS_LABELS: Record<IInternalServiceStatus["status"], string> = {
  ok: "Operativo",
  warning: "Degradado",
  critical: "Crítico",
  maintenance: "Mantenimiento",
  unknown: "Desconocido"
};

const STATUS_ICONS: Record<IInternalServiceStatus["status"], string> = {
  ok: "CheckMark",
  warning: "Warning",
  critical: "ErrorBadge",
  maintenance: "Calendar",
  unknown: "Info"
};

function formatTimestamp(value?: string): string {
  if (!value) {
    return "Sin actualización";
  }

  return new Intl.DateTimeFormat("es-ES", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit"
  }).format(new Date(value));
}

export interface IServiceStatusCardProps {
  item: IInternalServiceStatus;
}

export function ServiceStatusCard({ item }: IServiceStatusCardProps): React.ReactElement {
  const link = createSafeExternalLink(item.detailUrl);

  return (
    <article className={styles.statCard}>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "start" }}>
        <div style={{ display: "grid", gap: 8 }}>
          <Text variant="large" as="h3" style={{ margin: 0 }}>
            {item.name}
          </Text>
          <Text variant="small" style={{ color: "var(--es-text-secondary)" }}>
            {item.summary}
          </Text>
        </div>
        <span className={styles.kicker} style={{ background: item.status === "critical" ? "rgba(255,0,0,0.12)" : "rgba(91,83,255,0.12)", color: "var(--es-text)" }}>
          <Icon iconName={STATUS_ICONS[item.status]} />
          <span>{STATUS_LABELS[item.status]}</span>
        </span>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <span className={styles.kicker} style={{ background: "rgba(16,50,207,0.08)", color: "var(--es-text)" }}>
          {item.criticality}
        </span>
        {item.isStale ? (
          <span className={styles.kicker} style={{ background: "rgba(245,158,11,0.16)", color: "var(--es-text)" }}>
            stale
          </span>
        ) : undefined}
        {item.domain ? (
          <span className={styles.kicker} style={{ background: "rgba(25,37,90,0.1)", color: "var(--es-text)" }}>
            {item.domain}
          </span>
        ) : undefined}
      </div>

      <Text variant="small" style={{ color: "var(--es-text-secondary)" }}>
        {formatTimestamp(item.updatedAt)}
      </Text>

      {link ? (
        <DefaultButton href={link.href} target={link.target} rel={link.rel} text="Abrir detalle" />
      ) : (
        <Text variant="small" style={{ color: "var(--es-text-secondary)" }}>
          Sin enlace de detalle
        </Text>
      )}
    </article>
  );
}
