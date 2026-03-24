import * as React from "react";
import { Icon, MessageBar, MessageBarType, Text } from "@fluentui/react";
import type { IIdeasMailboxProps } from "./IIdeasMailboxProps";
import styles from "./IdeasMailbox.module.scss";
import { IdeasMailboxProvider } from "../contexts/IdeasMailboxContext";
import { useIdeasMailbox } from "../hooks/useIdeasMailbox";
import { IdeaForm } from "./IdeaForm";

function IdeasMailboxCard(props: IIdeasMailboxProps): React.ReactElement {
  const viewModel = useIdeasMailbox(props);
  const isBusy = viewModel.status === "submitting";

  return (
    <section className={styles.root} aria-label={props.title}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div>
            <Text as="p" block className={styles.eyebrow}>
              Participación ligera
            </Text>
            <Text as="h2" block variant="xxLarge" className={styles.title}>
              {props.title}
            </Text>
            <Text block className={styles.subtitle}>
              {props.subtitle}
            </Text>
          </div>

          <div className={styles.pills}>
            <span className={styles.pill}>{props.sourceType}</span>
            <span className={styles.pill}>{props.allowAnonymous ? "Anónimo opcional" : "Usuario identificado"}</span>
          </div>
        </div>

        <div className={styles.leadCard}>
          <Icon iconName="Lightbulb" className={styles.leadIcon} />
          <div>
            <Text block className={styles.leadTitle}>
              Comparte una propuesta sin fricción
            </Text>
            <Text block className={styles.leadCopy}>
              Envía una idea en menos de un minuto. El título es obligatorio y la descripción ayuda a contextualizarla.
            </Text>
          </div>
        </div>

        {viewModel.status === "submitting" ? (
          <MessageBar messageBarType={MessageBarType.info} isMultiline className={styles.messageBar}>
            Enviando la idea...
          </MessageBar>
        ) : null}

        {viewModel.status === "validationError" ? (
          <MessageBar messageBarType={MessageBarType.warning} isMultiline className={styles.messageBar}>
            Revisa los campos marcados antes de enviar.
          </MessageBar>
        ) : null}

        {viewModel.status === "submitError" ? (
          <MessageBar messageBarType={MessageBarType.error} isMultiline className={styles.messageBar}>
            {viewModel.errorMessage || "No se ha podido enviar la idea."}
          </MessageBar>
        ) : null}

        {viewModel.status === "success" ? (
          <MessageBar messageBarType={MessageBarType.success} isMultiline className={styles.messageBar}>
            {viewModel.successMessage || "Tu idea se ha enviado correctamente."}
          </MessageBar>
        ) : null}

        <IdeaForm
          draft={viewModel.draft}
          errors={viewModel.errors}
          showCategory={props.showCategory}
          categoryLabel={props.categoryLabel}
          submitLabel={props.submitLabel}
          isBusy={isBusy}
          status={viewModel.status}
          onChange={viewModel.updateField}
          onSubmit={() => {
            viewModel.submit().catch(() => undefined);
          }}
          onReset={viewModel.reset}
        />

        <div className={styles.footer}>
          <Text block className={styles.footerMeta}>
            Origen: {props.sourceType}
          </Text>
          <Text block className={styles.footerMeta}>
            Usuario: {props.allowAnonymous ? "anónimo permitido" : props.userDisplayName}
          </Text>
        </div>
      </div>
    </section>
  );
}

export default function IdeasMailbox(props: IIdeasMailboxProps): React.ReactElement {
  return (
    <IdeasMailboxProvider>
      <IdeasMailboxCard {...props} />
    </IdeasMailboxProvider>
  );
}
