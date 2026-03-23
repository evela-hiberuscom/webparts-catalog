import * as React from "react";
import { DefaultButton, Link, MessageBar, MessageBarType, PrimaryButton, Stack, Text } from "@fluentui/react";
import styles from "./PageContextAssistant.module.scss";
import type {
  IPageContextAssistantResult,
  PageContextAssistantViewState
} from "../models/pageContextAssistantModels";

export interface IContextHelpPanelProps {
  title: string;
  description: string;
  pageContextKey: string;
  userDisplayName?: string;
  status: PageContextAssistantViewState | "loading";
  result?: IPageContextAssistantResult;
  error?: string;
  isExpanded: boolean;
  onToggleExpanded: () => void;
  onRefresh: () => void;
}

function renderRelatedLinks(result?: IPageContextAssistantResult): React.ReactElement | undefined {
  const help = result?.help;
  if (!help || !help.relatedLinks.length) {
    return undefined;
  }

  return (
    <div className={styles.linksBlock}>
      <Text variant="mediumPlus" as="h3" className={styles.sectionHeading}>
        Recursos relacionados
      </Text>
      <Stack as="ul" tokens={{ childrenGap: 8 }} className={styles.linkList}>
        {help.relatedLinks.map((link) => (
          <li key={`${help.id}-${link.url}`} className={styles.linkItem}>
            <Link href={link.url}>{link.label}</Link>
          </li>
        ))}
      </Stack>
    </div>
  );
}

function renderCompactMessage(status: IContextHelpPanelProps["status"], result?: IPageContextAssistantResult): string {
  if (status === "loading") {
    return "Buscando ayuda contextual para esta página.";
  }

  if (status === "empty") {
    return "No hay ayuda contextual disponible.";
  }

  if (status === "error") {
    return "No se ha podido cargar la ayuda contextual.";
  }

  if (result?.help) {
    return result.help.message;
  }

  return "La ayuda contextual está lista para mostrar contenido útil.";
}

export default function ContextHelpPanel(props: IContextHelpPanelProps): React.ReactElement {
  const statusLabel =
    props.status === "loading" ? "Cargando" : props.status === "error" ? "Error" : props.status === "empty" ? "Vacío" : props.status === "partialData" ? "Datos parciales" : "Listo";

  return (
    <section className={styles.surface} aria-label={props.title}>
      <header className={styles.header}>
        <div className={styles.headingBlock}>
          <span className={styles.kicker}>Asistencia contextual</span>
          <Text variant="xxLarge" as="h2" className={styles.title}>
            {props.title}
          </Text>
          <Text variant="medium" className={styles.description}>
            {props.userDisplayName ? `Vista personalizada para ${props.userDisplayName}. ${props.description}` : props.description}
          </Text>
        </div>

        <Stack horizontal tokens={{ childrenGap: 12 }} className={styles.actions}>
          <PrimaryButton
            text={props.isExpanded ? "Contraer ayuda" : "Mostrar ayuda"}
            onClick={props.onToggleExpanded}
            aria-expanded={props.isExpanded}
            aria-controls="page-context-assistant-panel"
          />
          <DefaultButton text="Refrescar" onClick={props.onRefresh} />
        </Stack>
      </header>

      <div className={styles.metaRow}>
        <span className={styles.statusPill}>{statusLabel}</span>
        <Text variant="small" className={styles.contextKey}>
          Contexto detectado: {props.pageContextKey}
        </Text>
      </div>

      <div id="page-context-assistant-panel" className={styles.panel} aria-live="polite">
        {props.status === "error" ? (
          <MessageBar messageBarType={MessageBarType.error} isMultiline>
            {props.error ?? "No se ha podido cargar la ayuda contextual."}
          </MessageBar>
        ) : undefined}

        {props.status === "loading" ? (
          <MessageBar messageBarType={MessageBarType.info} isMultiline>
            Buscando la mejor ayuda para la página actual.
          </MessageBar>
        ) : undefined}

        {!props.isExpanded ? (
          <div className={styles.compactState}>
            <Text variant="mediumPlus" as="p" className={styles.compactTitle}>
              {props.result?.help?.title ?? "Ayuda contextual"}
            </Text>
            <Text variant="medium" as="p" className={styles.compactMessage}>
              {renderCompactMessage(props.status, props.result)}
            </Text>
          </div>
        ) : (
          <div className={styles.expandedState}>
            <Text variant="large" as="h3" className={styles.sectionHeading}>
              {props.result?.help?.title ?? "Sin ayuda específica"}
            </Text>
            <Text variant="medium" as="p" className={styles.message}>
              {renderCompactMessage(props.status, props.result)}
            </Text>

            {props.result?.help?.relatedLinks.length ? (
              renderRelatedLinks(props.result)
            ) : (
              <MessageBar messageBarType={MessageBarType.severeWarning} isMultiline>
                No hay enlaces relacionados, pero la ayuda contextual sigue siendo válida.
              </MessageBar>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
