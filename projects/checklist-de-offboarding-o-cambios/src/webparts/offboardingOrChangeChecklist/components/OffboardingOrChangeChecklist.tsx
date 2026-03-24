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
import type { IOffboardingOrChangeChecklistProps } from './IOffboardingOrChangeChecklistProps';
import styles from './OffboardingOrChangeChecklist.module.scss';
import { OffboardingOrChangeChecklistProvider } from '../contexts/OffboardingOrChangeChecklistContext';
import { useOffboardingOrChangeChecklist } from '../hooks/useOffboardingOrChangeChecklist';
import {
  getScenarioLabel,
  getStepLinkProps,
  normalizeText
} from '../utils/offboardingOrChangeChecklistUtils';

function joinClasses(...values: Array<string | false | undefined>): string {
  return values.filter(Boolean).join(' ');
}

function buildDropdownOptions(values: Array<{ key: string; text: string }>): IDropdownOption[] {
  return values.map((value) => ({ key: value.key, text: value.text }));
}

function ChecklistStepCard(props: {
  title: string;
  description?: string;
  scenario: string;
  phase: string;
  critical: boolean;
  partialData: boolean;
  relatedUrl?: string;
  relatedLabel?: string;
}): React.ReactElement {
  const linkProps = getStepLinkProps(props.relatedUrl);

  return (
    <article className={joinClasses(styles.stepCard, props.critical && styles.stepCardCritical, props.partialData && styles.stepCardPartial)}>
      <div className={styles.stepHeader}>
        <div className={styles.stepHeading}>
          <Text as="h3" variant="large" block className={styles.stepTitle}>
            {props.title}
          </Text>
          <div className={styles.badgeRow}>
            <span className={joinClasses(styles.badge, styles.badgeScenario)}>{props.scenario}</span>
            <span className={joinClasses(styles.badge, styles.badgePhase)}>{props.phase}</span>
            {props.critical ? <span className={joinClasses(styles.badge, styles.badgeCritical)}>Critico</span> : null}
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
      <MessageBar messageBarType={props.messageType} isMultiline className={styles.messageBar} />
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

function OffboardingOrChangeChecklistCard(props: IOffboardingOrChangeChecklistProps): React.ReactElement {
  const viewModel = useOffboardingOrChangeChecklist(props);
  const scenarioOptions = buildDropdownOptions(viewModel.scenarioOptions);
  const phaseOptions = buildDropdownOptions(viewModel.phaseOptions);
  const visibleCount = viewModel.filteredItems.length;
  const totalCount = viewModel.items.length;
  const partialCount = viewModel.filteredItems.filter((item) => item.partialData).length;

  return (
    <section className={joinClasses(styles.root, props.isDarkTheme && styles.rootDark, props.hasTeamsContext && styles.rootTeams)} aria-label={props.title}>
      <div className={styles.shell}>
        <div className={styles.header}>
          <div className={styles.headerCopy}>
            <Text as="p" className={styles.eyebrow} block>
              Checklist operativo
            </Text>
            <Text as="h2" variant="xxLarge" block className={styles.title}>
              {props.title}
            </Text>
            <Text block className={styles.description}>
              {props.description}
            </Text>
          </div>

          <div className={styles.headerMeta}>
            <span className={styles.metaPill}>{getScenarioLabel(props.defaultScenario)}</span>
            <span className={styles.metaPill}>{props.dataSourceType}</span>
            <span className={styles.metaPill}>{viewModel.sourceLabel}</span>
            <span className={styles.metaPill}>{props.userDisplayName}</span>
          </div>
        </div>

        <div className={styles.metrics}>
          <span className={styles.metricPill}>{visibleCount} pasos visibles</span>
          <span className={styles.metricPill}>{viewModel.criticalCount} criticos</span>
          <span className={styles.metricPill}>{partialCount} parciales</span>
          <span className={styles.metricPill}>{totalCount} total</span>
        </div>

        {viewModel.notes.length > 0 ? (
          <MessageBar messageBarType={viewModel.hasPartialData ? MessageBarType.warning : MessageBarType.info} isMultiline className={styles.messageBar}>
            {viewModel.notes.join(' ')}
          </MessageBar>
        ) : null}

        <div className={styles.filters}>
          <Dropdown
            label="Escenario"
            selectedKey={viewModel.activeScenario}
            options={scenarioOptions}
            onChange={(_, option: IDropdownOption | undefined) => {
              if (!option) {
                return;
              }
              viewModel.setScenarioFilter(option.key as typeof viewModel.activeScenario);
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
            <Spinner size={SpinnerSize.large} label="Cargando checklist" />
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
            body="La fuente no devolvio elementos para este escenario."
            actionLabel="Reintentar"
            onAction={viewModel.reload}
            messageType={MessageBarType.info}
          />
        ) : null}

        {(viewModel.status === 'ready' || viewModel.status === 'partialData') && viewModel.filteredItems.length > 0 ? (
          <>
            {viewModel.status === 'partialData' ? (
              <MessageBar messageBarType={MessageBarType.warning} isMultiline className={styles.messageBar}>
                Hay datos parciales en algunos pasos, pero la checklist sigue siendo usable.
              </MessageBar>
            ) : null}

            <div className={styles.list}>
              {viewModel.filteredItems.map((item) => (
                <ChecklistStepCard
                  key={item.id}
                  title={item.title}
                  description={item.description}
                  scenario={getScenarioLabel(item.scenario)}
                  phase={item.phase}
                  critical={item.critical}
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
            body="Prueba a cambiar de escenario o fase para ver pasos relevantes."
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

export default function OffboardingOrChangeChecklist(props: IOffboardingOrChangeChecklistProps): React.ReactElement {
  return (
    <OffboardingOrChangeChecklistProvider>
      <OffboardingOrChangeChecklistCard {...props} />
    </OffboardingOrChangeChecklistProvider>
  );
}
