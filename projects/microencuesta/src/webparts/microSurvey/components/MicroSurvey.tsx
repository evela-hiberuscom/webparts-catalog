import * as React from 'react';
import { DefaultButton, PrimaryButton, Spinner, SpinnerSize } from '@fluentui/react';
import * as strings from 'MicroSurveyWebPartStrings';
import type { IMicroSurveyProps } from './IMicroSurveyProps';
import styles from './MicroSurvey.module.scss';
import { PollOptions } from './PollOptions';
import { StatusMessage } from './StatusMessage';
import { useMicroSurvey } from '../hooks/useMicroSurvey';

function resolveInteractionMessage(
  errorCode: string | undefined,
  fallbackMessage: string | undefined
): string | undefined {
  switch (errorCode) {
    case 'selectionRequired':
      return strings.SelectionRequiredMessage;
    case 'alreadyAnswered':
      return strings.AlreadyAnsweredMessage;
    case 'questionUnavailable':
      return strings.QuestionUnavailableMessage;
    case 'submitFailed':
      return strings.SubmitErrorMessage;
    default:
      return fallbackMessage;
  }
}

export default function MicroSurvey(
  props: IMicroSurveyProps
): React.ReactElement<IMicroSurveyProps> {
  const state = useMicroSurvey(props.configuration, props.service);
  const interactionMessage = resolveInteractionMessage(
    state.interactionErrorCode,
    state.interactionErrorMessage
  );
  const selectedOptionLabel = state.question?.options.filter(
    (option) => option.label === state.existingSubmission?.selectedOption
  )[0]?.label;

  return (
    <section className={styles.microSurvey}>
      <div className={styles.card}>
        <header className={styles.header}>
          <span className={styles.eyebrow}>{strings.WebPartEyebrow}</span>
          <h2 className={styles.title}>{strings.WebPartTitle}</h2>
          <p className={styles.subtitle}>
            {props.configuration.description || strings.WebPartSubtitle}
          </p>
          {state.sourceLabel ? (
            <span className={styles.sourceLine}>
              {strings.SourceLabel}: <strong>{state.sourceLabel}</strong>
            </span>
          ) : undefined}
        </header>

        {state.status === 'loading' ? (
          <Spinner label={strings.LoadingLabel} size={SpinnerSize.medium} />
        ) : undefined}

        {state.status === 'error' ? (
          <StatusMessage
            title={strings.ErrorStateTitle}
            message={state.errorMessage || strings.ErrorStateMessage}
            tone="error"
          />
        ) : undefined}

        {state.status === 'empty' ? (
          <StatusMessage
            title={strings.EmptyStateTitle}
            message={strings.EmptyStateMessage}
            tone="info"
          />
        ) : undefined}

        {state.question && state.submitStatus !== 'success' ? (
          <div className={styles.questionBlock}>
            <h3 className={styles.questionText}>{state.question.question}</h3>
            {state.question.description ? (
              <p className={styles.questionDescription}>{state.question.description}</p>
            ) : undefined}

            <PollOptions
              question={state.question}
              selectedOption={state.selectedOption}
              disabled={state.submitStatus === 'submitting'}
              label={strings.OptionsGroupLabel}
              onChange={state.selectOption}
            />

            {interactionMessage ? (
              <StatusMessage
                title={strings.InteractionErrorTitle}
                message={interactionMessage}
                tone="error"
              />
            ) : undefined}

            {state.hasPartialData ? (
              <StatusMessage
                title={strings.PartialStateTitle}
                message={strings.PartialStateMessage}
                tone="info"
              />
            ) : undefined}

            {state.notes.length > 0 ? (
              <ul className={styles.notes}>
                {state.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>
            ) : undefined}

            <div className={styles.actions}>
              <PrimaryButton
                text={
                  state.submitStatus === 'submitting'
                    ? strings.SubmittingAction
                    : strings.SubmitAction
                }
                disabled={state.submitStatus === 'submitting'}
                onClick={() => {
                  state.submit().catch(() => undefined);
                }}
              />
              <DefaultButton
                text={strings.RefreshAction}
                disabled={state.submitStatus === 'submitting'}
                onClick={() => {
                  state.refresh().catch(() => undefined);
                }}
              />
            </div>
          </div>
        ) : undefined}

        {state.submitStatus === 'success' ? (
          <StatusMessage
            title={strings.SuccessStateTitle}
            message={
              state.confirmationMessage
                ? `${state.confirmationMessage} ${selectedOptionLabel ? `${strings.SelectedOptionLabel}: ${selectedOptionLabel}.` : ''}`.trim()
                : strings.SuccessStateMessage
            }
            tone="success"
          />
        ) : undefined}
      </div>
    </section>
  );
}
