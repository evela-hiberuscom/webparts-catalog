import * as React from 'react';
import {
  DefaultButton,
  Dropdown,
  IDropdownOption,
  Link,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Spinner,
  SpinnerSize,
  Text
} from '@fluentui/react';
import type { IOnboardingChecklistProps } from './IOnboardingChecklistProps';
import styles from './OnboardingChecklist.module.scss';
import { OnboardingChecklistProvider } from '../contexts/OnboardingChecklistContext';
import { useOnboardingChecklist } from '../hooks/useOnboardingChecklist';
import { getStepLinkProps, normalizeText } from '../utils/onboardingChecklistUtils';

function joinClasses(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(' ');
}

function buildDropdownOptions(values: Array<{ key: string; text: string }>): IDropdownOption[] {
  return values.map((value) => ({ key: value.key, text: value.text }));
}

function ChecklistStepCard(props: {
  title: string;
  description?: string;
  phase: string;
  variant: string;
  mandatory: boolean;
  partialData: boolean;
  relatedUrl?: string;
  relatedLabel?: string;
}): React.ReactElement {
  const linkProps = getStepLinkProps(props.relatedUrl);

  return (
    <article
      className={joinClasses(
        styles.stepCard,
        props.mandatory && styles.stepCardMandatory,
        props.partialData && styles.stepCardPartial
      )}
    >
      <div className={styles.stepHeader}>
        <div className={styles.stepHeading}>
          <Text as="h3" variant="large" block className={styles.stepTitle}>
            {props.title}
          </Text>
          <div className={styles.badgeRow}>
            <span className={joinClasses(styles.badge, styles.badgePhase)}>{props.phase}</span>
            <span className={joinClasses(styles.badge, styles.badgeVariant)}>{props.variant}</span>
            {props.mandatory ? (
              <span className={joinClasses(styles.badge, styles.badgeMandatory)}>Obligatorio</span>
            ) : (
              <span className={joinClasses(styles.badge, styles.badgeOptional)}>Opcional</span>
            )}
            {props.partialData ? <span className={joinClasses(styles.badge, styles.badgePartial)}>Parcial</span> : null}
          </div>
        </div>
      </div>

      {props.description ? (
        <Text block className={styles.stepDescription}>
          {props.description}
        </Text>
      ) : null}

      {linkProps ? (
        <div className={styles.stepFooter}>
          <Link {...linkProps} className={styles.stepLink}>
            {normalizeText(props.relatedLabel, 'Abrir recurso relacionado')}
          </Link>
        </div>
      ) : null}
    </article>
  );
}

function ChecklistStatePanel(props: {
  title: string;
  body: string;
  actionLabel: string;
  onAction: () => void;
  messageType: MessageBarType;
}): React.ReactElement {
  return (
    <div className={styles.statePanel} role="status">
      <MessageBar messageBarType={props.messageType} isMultiline className={styles.messageBar}>
        {props.body}
      </MessageBar>
      <div>
        <Text as="h3" variant="large" block className={styles.stateTitle}>
          {props.title}
        </Text>
        <Text block className={styles.stateBody}>
          {props.body}
        </Text>
      </div>
      <div className={styles.stateActions}>
        <PrimaryButton text={props.actionLabel} onClick={props.onAction} />
      </div>
    </div>
  );
}

function OnboardingChecklistCard(props: IOnboardingChecklistProps): React.ReactElement {
  const viewModel = useOnboardingChecklist(props);
  const variantOptions = buildDropdownOptions(viewModel.variantOptions);
  const phaseOptions = buildDropdownOptions(viewModel.phaseOptions);
  const visibleCount = viewModel.filteredItems.length;
  const totalCount = viewModel.items.length;
  const partialCount = viewModel.filteredItems.filter((item) => item.partialData).length;

  return (
    <section className={joinClasses(styles.root, props.isDarkTheme && styles.rootDark, props.hasTeamsContext && styles.rootTeams)} aria-label={props.title}>
      <div className={styles.shell}>
        <header className={styles.header}>
          <div className={styles.headerCopy}>
            <Text as="p" className={styles.eyebrow} block>
              Checklist secuencial
            </Text>
            <Text as="h2" variant="xxLarge" block className={styles.title}>
              {props.title}
            </Text>
            <Text block className={styles.description}>
              {props.description}
            </Text>
          </div>

          <div className={styles.headerMeta}>
            <span className={styles.metaPill}>{props.userDisplayName}</span>
            <span className={styles.metaPill}>{props.dataSourceType}</span>
            <span className={styles.metaPill}>{viewModel.sourceLabel}</span>
            <span className={styles.metaPill}>{totalCount} pasos</span>
          </div>
        </header>

        <div className={styles.metrics}>
          <span className={styles.metricPill}>{visibleCount} visibles</span>
          <span className={styles.metricPill}>{viewModel.mandatoryCount} obligatorios</span>
          <span className={styles.metricPill}>{partialCount} parciales</span>
          <span className={styles.metricPill}>{viewModel.items.length} total</span>
        </div>

        {viewModel.notes.length > 0 ? (
          <MessageBar messageBarType={viewModel.hasPartialData ? MessageBarType.warning : MessageBarType.info} isMultiline className={styles.messageBar}>
            {viewModel.notes.join(' ')}
          </MessageBar>
        ) : null}

        <div className={styles.filters}>
          <Dropdown
            label="Variante"
            selectedKey={viewModel.activeVariant}
            options={variantOptions}
            onChange={(_, option: IDropdownOption | undefined) => {
              if (!option) {
                return;
              }

              viewModel.setVariantFilter(option.key as string | 'all');
            }}
          />

          <Dropdown
            label="Fase"
            selectedKey={viewModel.activePhase}
            options={phaseOptions}
            onChange={(_, option: IDropdownOption | undefined) => {
              if (!option) {
                return;
              }

              viewModel.setPhaseFilter(option.key as string | 'all');
            }}
          />

          <div className={styles.filterActions}>
            <DefaultButton text="Restablecer" onClick={viewModel.resetFilters} />
            <DefaultButton text="Recargar" onClick={viewModel.reload} />
          </div>
        </div>

        {viewModel.status === 'loading' ? (
          <div className={styles.loadingPanel} aria-busy="true">
            <Spinner size={SpinnerSize.large} label="Cargando checklist de onboarding" />
            <div className={styles.loadingSkeleton}>
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLine} />
              <div className={styles.skeletonLineShort} />
            </div>
          </div>
        ) : null}

        {viewModel.status === 'error' ? (
          <ChecklistStatePanel
            title="No se ha podido cargar el checklist"
            body={viewModel.errorMessage || 'Revisa la configuracion de la fuente y vuelve a intentarlo.'}
            actionLabel="Reintentar"
            onAction={viewModel.reload}
            messageType={MessageBarType.error}
          />
        ) : null}

        {viewModel.status === 'empty' ? (
          <ChecklistStatePanel
            title="No hay pasos configurados"
            body="La fuente no devolvio elementos para este contexto."
            actionLabel="Reintentar"
            onAction={viewModel.reload}
            messageType={MessageBarType.info}
          />
        ) : null}

        {(viewModel.status === 'ready' || viewModel.status === 'partialData') && viewModel.filteredItems.length > 0 ? (
          <>
            {viewModel.status === 'partialData' ? (
              <MessageBar messageBarType={MessageBarType.warning} isMultiline className={styles.messageBar}>
                Hay datos parciales en algunos pasos, pero la checklist sigue siendo utilizable.
              </MessageBar>
            ) : null}

            <div className={styles.list}>
              {viewModel.filteredItems.map((item) => (
                <ChecklistStepCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  phase={item.phase}
                  variant={item.variant}
                  mandatory={item.mandatory}
                  partialData={item.partialData}
                  relatedUrl={item.relatedUrl}
                  relatedLabel={item.relatedLabel}
                />
              ))}
            </div>
          </>
        ) : null}

        {(viewModel.status === 'ready' || viewModel.status === 'partialData') && viewModel.filteredItems.length === 0 ? (
          <ChecklistStatePanel
            title="No hay coincidencias con los filtros"
            body="Prueba a cambiar la variante o la fase para ver pasos relevantes."
            actionLabel="Restablecer filtros"
            onAction={viewModel.resetFilters}
            messageType={MessageBarType.info}
          />
        ) : null}

        <footer className={styles.footer}>
          <span>{props.environmentMessage}</span>
          <span>Fuente: {viewModel.sourceLabel}</span>
        </footer>
      </div>
    </section>
  );
}

export default function OnboardingChecklist(props: IOnboardingChecklistProps): React.ReactElement {
  return (
    <OnboardingChecklistProvider>
      <OnboardingChecklistCard {...props} />
    </OnboardingChecklistProvider>
  );
}
