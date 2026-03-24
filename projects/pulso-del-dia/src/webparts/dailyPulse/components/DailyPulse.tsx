import * as React from 'react';
import { MessageBar, MessageBarType, PrimaryButton, DefaultButton, Spinner, SpinnerSize, Text } from '@fluentui/react';
import type { IDailyPulseProps } from './IDailyPulseProps';
import styles from './DailyPulse.module.scss';
import { DailyPulseProvider } from '../contexts/DailyPulseContext';
import { useDailyPulse } from '../hooks/useDailyPulse';

function joinClasses(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(' ');
}

function DailyPulseCard(props: IDailyPulseProps): React.ReactElement {
  const viewModel = useDailyPulse(props);
  const isBusy = viewModel.submissionState === 'submitting' || viewModel.status === 'loading';
  const hasOptions = Boolean(viewModel.prompt?.options.length);
  const selectedCount = viewModel.selectedOptionId ? 1 : 0;

  return (
    <section className={styles.root} aria-label={props.title}>
      <div className={styles.frame}>
        <div className={styles.header}>
          <div>
            <Text as="p" className={styles.eyebrow} block>
              Pulso diario
            </Text>
            <Text as="h2" variant="xxLarge" block className={styles.title}>
              {props.title}
            </Text>
            <Text variant="medium" block className={styles.subtitle}>
              {props.subtitle}
            </Text>
          </div>

          <div className={styles.meta}>
            <span className={styles.metaPill}>{props.sourceType}</span>
            <span className={styles.metaPill}>
              {new Intl.DateTimeFormat('es-ES', {
                day: '2-digit',
                month: 'short',
                year: 'numeric'
              }).format(new Date())}
            </span>
            <span className={styles.metaText}>{props.userDisplayName}</span>
          </div>
        </div>

        {viewModel.notes.length > 0 ? (
          <MessageBar messageBarType={MessageBarType.info} isMultiline className={styles.messageBar}>
            {viewModel.notes.join(' ')}
          </MessageBar>
        ) : null}

        {viewModel.status === 'loading' ? (
          <div className={styles.loadingPanel} aria-busy="true">
            <Spinner size={SpinnerSize.large} label="Cargando pulso del día" />
          </div>
        ) : null}

        {viewModel.status === 'error' ? (
          <div className={styles.statePanel} role="alert">
            <Text as="h3" variant="large" block className={styles.stateTitle}>
              No se ha podido cargar el pulso
            </Text>
            <Text block className={styles.stateBody}>
              {viewModel.errorMessage || 'Revisa la configuración de la fuente o intenta de nuevo.'}
            </Text>
            <div className={styles.stateActions}>
              <DefaultButton text="Reintentar" onClick={viewModel.reload} />
            </div>
          </div>
        ) : null}

        {viewModel.status === 'empty' ? (
          <div className={styles.statePanel} role="status">
            <Text as="h3" variant="large" block className={styles.stateTitle}>
              No hay un pulso activo
            </Text>
            <Text block className={styles.stateBody}>
              La fuente no devolvió una pregunta activa todavía.
            </Text>
            <div className={styles.stateActions}>
              <DefaultButton text="Reintentar" onClick={viewModel.reload} />
            </div>
          </div>
        ) : null}

        {(viewModel.status === 'ready' || viewModel.status === 'partialData') && viewModel.prompt ? (
          <>
            {viewModel.status === 'partialData' ? (
              <MessageBar messageBarType={MessageBarType.warning} isMultiline className={styles.messageBar}>
                Hay información parcial en la fuente, pero el pulso sigue siendo usable.
              </MessageBar>
            ) : null}

            <div className={styles.promptCard}>
              <Text as="h3" variant="xLarge" block className={styles.promptText}>
                {viewModel.prompt.prompt}
              </Text>
              {viewModel.prompt.helpText ? (
                <Text block className={styles.promptHelp}>
                  {viewModel.prompt.helpText}
                </Text>
              ) : null}

              <div className={styles.options} role="radiogroup" aria-label={viewModel.prompt.prompt}>
                {viewModel.prompt.options.map((option) => {
                  const selected = viewModel.selectedOptionId === option.id;
                  return (
                    <button
                      key={option.id}
                      type="button"
                      className={joinClasses(styles.optionButton, selected && styles.optionButtonSelected)}
                      aria-pressed={selected}
                      disabled={isBusy || viewModel.alreadySubmitted}
                      onClick={() => viewModel.selectOption(option.id)}
                    >
                      <span className={styles.optionIcon}>{option.emoji || '•'}</span>
                      <span className={styles.optionLabel}>{option.label}</span>
                      {option.description ? <span className={styles.optionDescription}>{option.description}</span> : null}
                    </button>
                  );
                })}
              </div>

              <div className={styles.footerRow}>
                <span className={styles.footerMeta}>{viewModel.sourceLabel}</span>
                <span className={styles.footerMeta}>
                  {selectedCount > 0 ? '1 opción seleccionada' : `${viewModel.prompt.options.length} opciones disponibles`}
                </span>
              </div>

              <div className={styles.actionRow}>
                <PrimaryButton
                  text={props.submitLabel}
                  onClick={() => {
                    viewModel.submitSelection().catch(() => undefined);
                  }}
                  disabled={!hasOptions || !viewModel.selectedOptionId || isBusy || viewModel.alreadySubmitted}
                />
                <DefaultButton text="Reintentar" onClick={viewModel.reload} />
              </div>
            </div>

            {viewModel.submissionState === 'success' ? (
              <MessageBar messageBarType={MessageBarType.success} isMultiline className={styles.messageBar}>
                {viewModel.submissionMessage || 'Pulso registrado.'}
              </MessageBar>
            ) : null}

            {viewModel.submissionState === 'error' ? (
              <MessageBar messageBarType={MessageBarType.error} isMultiline className={styles.messageBar}>
                {viewModel.errorMessage || 'No se ha podido registrar el pulso.'}
              </MessageBar>
            ) : null}
          </>
        ) : null}
      </div>
    </section>
  );
}

export default function DailyPulse(props: IDailyPulseProps): React.ReactElement {
  return (
    <DailyPulseProvider>
      <DailyPulseCard {...props} />
    </DailyPulseProvider>
  );
}
