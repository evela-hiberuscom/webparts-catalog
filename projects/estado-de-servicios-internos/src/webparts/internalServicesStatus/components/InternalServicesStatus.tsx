import * as React from "react";
import { DefaultButton, PrimaryButton, Text } from "@fluentui/react";
import { classifyAsyncState, ensureUniqueStrings } from "@paquete/spfx-common";
import styles from "./InternalServicesStatus.module.scss";
import { StatusStatePanel } from "./StatusStatePanel";
import { StatusToolbar } from "./StatusToolbar";
import { ServiceStatusCard } from "./ServiceStatusCard";
import { useInternalServicesStatus } from "../hooks/useInternalServicesStatus";
import { createInternalServicesStatusRepository } from "../repositories/internalServicesStatusRepository";
import { InternalServicesStatusService } from "../services/internalServicesStatusService";
import type { IInternalServicesStatusProps } from "./IInternalServicesStatusProps";
import type { InternalServicesStatusFilter } from "../models/internalServicesStatusModels";
import { filterServices } from "../utils/internalServicesStatusUtils";

const AVAILABLE_FILTERS: InternalServicesStatusFilter[] = [
  "all",
  "critical",
  "warning",
  "maintenance",
  "ok",
  "unknown"
];

function getVisibleFilters(items: Array<{ domain?: string }>): string[] {
  const domains = items
    .map((item) => item.domain?.trim())
    .filter((value): value is string => Boolean(value));

  return ensureUniqueStrings(domains.length ? domains : ["operaciones", "soporte"]);
}

export default function InternalServicesStatus(props: IInternalServicesStatusProps): React.ReactElement {
  const repository = React.useMemo(() => createInternalServicesStatusRepository(props.webUrl), [props.webUrl]);
  const service = React.useMemo(() => new InternalServicesStatusService(repository), [repository]);
  const [filter, setFilter] = React.useState<InternalServicesStatusFilter>("all");

  const { status, result, error, refresh } = useInternalServicesStatus(service, {
    dataSourceType: props.dataSourceType,
    listTitleOrUrl: props.listTitleOrUrl,
    autoRefreshSeconds: props.autoRefreshSeconds,
    showOnlyCritical: props.showOnlyCritical,
    staleThresholdMinutes: props.staleThresholdMinutes
  });

  const visibleItems = React.useMemo(() => {
    if (!result) {
      return [];
    }

    return filterServices(result.items, filter);
  }, [filter, result]);

  const asyncState = classifyAsyncState({
    hasData: visibleItems.length > 0,
    hasError: status === "error",
    isLoading: status === "loading",
    isPartial: Boolean(result?.hasPartialData)
  });

  const helperFilters = getVisibleFilters(result?.items ?? []);

  return (
    <section className={styles.internalServicesStatus}>
      <header className={styles.hero}>
        <div className={styles.heroCopy}>
          <span className={styles.kicker}>Estado operativo</span>
          <Text variant="xxLarge" as="h2" className={styles.title}>
            Estado de servicios internos
          </Text>
          <Text variant="large" className={styles.subtitle}>
            {props.userDisplayName ? `Vista personalizada para ${props.userDisplayName}. ${props.description}` : props.description}
          </Text>
        </div>
        <div className={styles.heroStats} aria-label="Resumen operativo">
          <div className={styles.statCard}>
            <span className={styles.statValue}>{result?.sourceCount ?? 0}</span>
            <span className={styles.statLabel}>servicios</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{result?.staleCount ?? 0}</span>
            <span className={styles.statLabel}>stale</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{visibleItems.length}</span>
            <span className={styles.statLabel}>visibles</span>
          </div>
        </div>
      </header>

      <StatusToolbar
        filter={filter}
        onFilterChange={setFilter}
        onRefresh={refresh}
        totalCount={result?.items.length ?? 0}
        visibleCount={visibleItems.length}
        status={asyncState}
        lastUpdated={result?.lastUpdated}
        helperFilters={helperFilters}
        availableFilters={AVAILABLE_FILTERS}
      />

      {status === "error" ? (
        <StatusStatePanel
          status="error"
          title="No se ha podido cargar el estado de servicios"
          message={error ?? "Revisa la lista configurada y vuelve a intentarlo."}
          onRetry={refresh}
        />
      ) : status === "loading" ? (
        <StatusStatePanel
          status="loading"
          title="Cargando servicios"
          message="Consultando el origen y normalizando los estados operativos."
          onRetry={refresh}
        />
      ) : !visibleItems.length ? (
        <StatusStatePanel
          status="empty"
          title="No hay servicios para este filtro"
          message="Cambia el filtro o revisa si la fuente devuelve registros válidos."
          onRetry={refresh}
        />
      ) : (
        <>
          {result?.hasPartialData ? (
            <div className={styles.partialBanner} role="status">
              <span className={styles.partialDot} />
              <span>Algunos servicios tienen datos parciales, pero la vista sigue siendo utilizable.</span>
            </div>
          ) : undefined}

          <div className={styles.grid} aria-label="Servicios monitorizados">
            {visibleItems.map((item) => (
              <ServiceStatusCard key={item.id} item={item} />
            ))}
          </div>

          <footer className={styles.footer}>
            <Text variant="small" className={styles.footerText}>
              {result?.lastUpdated ? `Actualizado: ${new Intl.DateTimeFormat("es-ES", {
                year: "numeric",
                month: "short",
                day: "2-digit",
                hour: "2-digit",
                minute: "2-digit"
              }).format(new Date(result.lastUpdated))}` : "Sin datos de actualización"}
            </Text>
            <DefaultButton text="Refrescar" onClick={refresh} />
            <PrimaryButton text="Ver filtros" onClick={() => setFilter("all")} />
          </footer>
        </>
      )}
    </section>
  );
}
