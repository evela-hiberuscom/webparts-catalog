import * as React from "react";
import { DefaultButton, Text } from "@fluentui/react";
import type { InternalServicesStatusFilter } from "../models/internalServicesStatusModels";
import styles from "./InternalServicesStatus.module.scss";

export interface IStatusToolbarProps {
  filter: InternalServicesStatusFilter;
  onFilterChange: (filter: InternalServicesStatusFilter) => void;
  onRefresh: () => void;
  status: "loading" | "ready" | "partialData" | "empty" | "error";
  totalCount: number;
  visibleCount: number;
  lastUpdated?: string;
  helperFilters: string[];
  availableFilters: InternalServicesStatusFilter[];
}

const FILTER_LABELS: Record<InternalServicesStatusFilter, string> = {
  all: "Todos",
  critical: "Críticos",
  warning: "Avisos",
  maintenance: "Mantenimiento",
  ok: "Operativos",
  unknown: "Desconocidos"
};

const VIEW_STATUS_LABELS: Record<IStatusToolbarProps["status"], string> = {
  loading: "Cargando",
  ready: "Lista",
  partialData: "Parcial",
  empty: "Vacía",
  error: "Error"
};

export function StatusToolbar(props: IStatusToolbarProps): React.ReactElement {
  return (
    <div className={styles.footer} aria-label="Controles de estado">
      <div style={{ display: "grid", gap: 8 }}>
        <Text variant="small" className={styles.footerText}>
          {props.totalCount} servicios, {props.visibleCount} visibles
        </Text>
        <Text variant="small" className={styles.footerText}>
          {props.lastUpdated ? `Última sincronización: ${new Intl.DateTimeFormat("es-ES", {
            year: "numeric",
            month: "short",
            day: "2-digit",
            hour: "2-digit",
            minute: "2-digit"
          }).format(new Date(props.lastUpdated))}` : "Sin sincronización previa"}
        </Text>
        <Text variant="small" className={styles.footerText}>
          Vista: {VIEW_STATUS_LABELS[props.status]}
        </Text>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
          {props.helperFilters.map((item) => (
            <span key={item} className={styles.kicker} style={{ background: "rgba(16,50,207,0.06)" }}>
              {item}
            </span>
          ))}
        </div>
      </div>

      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        <DefaultButton text="Refrescar" onClick={props.onRefresh} />
        {props.availableFilters.map((candidate) => (
          <DefaultButton
            key={candidate}
            text={FILTER_LABELS[candidate]}
            onClick={() => props.onFilterChange(candidate)}
            styles={{
              root: candidate === props.filter ? { background: "var(--es-accent)", color: "#fff" } : undefined
            }}
          />
        ))}
      </div>
    </div>
  );
}
