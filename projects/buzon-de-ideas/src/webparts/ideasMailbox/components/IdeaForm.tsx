import * as React from "react";
import { DefaultButton, PrimaryButton, TextField } from "@fluentui/react";
import type { IIdeaDraft, IIdeaFormErrors, IdeaMailboxStatus } from "../models/ideaMailboxModels";
import styles from "./IdeasMailbox.module.scss";

export interface IIdeaFormProps {
  draft: IIdeaDraft;
  errors: IIdeaFormErrors;
  showCategory: boolean;
  categoryLabel: string;
  submitLabel: string;
  isBusy: boolean;
  status: IdeaMailboxStatus;
  onChange: (field: keyof IIdeaDraft, value: string) => void;
  onSubmit: () => void;
  onReset: () => void;
}

export function IdeaForm(props: IIdeaFormProps): React.ReactElement {
  return (
    <form
      className={styles.form}
      onSubmit={(event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        props.onSubmit();
      }}
      noValidate
    >
      <div className={styles.formGrid}>
        <TextField
          label="Título"
          required
          value={props.draft.title}
          onChange={(_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) =>
            props.onChange("title", value ?? "")
          }
          errorMessage={props.errors.title}
          disabled={props.isBusy}
          maxLength={120}
          placeholder="Resume la idea en pocas palabras"
        />

        <TextField
          label="Descripción"
          multiline
          rows={4}
          value={props.draft.description}
          onChange={(_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) =>
            props.onChange("description", value ?? "")
          }
          errorMessage={props.errors.description}
          disabled={props.isBusy}
          maxLength={500}
          placeholder="Cuenta el contexto o el beneficio esperado"
          className={styles.formSpan}
        />

        {props.showCategory ? (
          <TextField
            label={props.categoryLabel}
            value={props.draft.category}
            onChange={(_event: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>, value?: string) =>
              props.onChange("category", value ?? "")
            }
            errorMessage={props.errors.category}
            disabled={props.isBusy}
            maxLength={80}
            placeholder="Ej. UX, procesos, automatización"
          />
        ) : null}
      </div>

      <div className={styles.actionRow}>
        <PrimaryButton type="submit" text={props.submitLabel} disabled={props.isBusy || props.status === "success"} />
        <DefaultButton type="button" text="Limpiar" onClick={props.onReset} disabled={props.isBusy} />
      </div>
    </form>
  );
}
