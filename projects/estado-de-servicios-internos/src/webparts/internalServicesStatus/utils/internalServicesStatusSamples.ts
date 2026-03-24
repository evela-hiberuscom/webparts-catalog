import type { IInternalServiceStatusSourceRecord } from "../models/internalServicesStatusModels";

export const internalServicesStatusSample: IInternalServiceStatusSourceRecord[] = [
  {
    id: "vpn",
    name: "VPN corporativa",
    status: "warning",
    criticality: "high",
    summary: "Intermitencias en la conexión desde sedes remotas.",
    updatedAt: "2026-03-23T08:30:00Z",
    detailUrl: "/sites/it/status/vpn",
    domain: "Red"
  },
  {
    id: "intranet",
    name: "Intranet",
    status: "ok",
    criticality: "medium",
    summary: "Sin incidencias conocidas.",
    updatedAt: "2026-03-23T10:10:00Z",
    detailUrl: "/sites/it/status/intranet",
    domain: "Plataforma"
  },
  {
    id: "erp",
    name: "ERP financiero",
    status: "critical",
    criticality: "high",
    summary: "Caída parcial del módulo de facturación.",
    updatedAt: "2026-03-23T07:55:00Z",
    detailUrl: "/sites/it/status/erp",
    domain: "Negocio"
  },
  {
    id: "helpdesk",
    name: "Portal de soporte",
    status: "maintenance",
    criticality: "medium",
    summary: "Ventana de mantenimiento programado.",
    updatedAt: "2026-03-23T06:15:00Z",
    detailUrl: "/sites/it/status/helpdesk",
    domain: "Soporte"
  },
  {
    id: "wifi",
    name: "Wi-Fi sedes",
    status: "unknown",
    criticality: "low",
    summary: "El origen aún no devuelve telemetría completa.",
    updatedAt: undefined,
    detailUrl: undefined,
    domain: "Red"
  }
];
