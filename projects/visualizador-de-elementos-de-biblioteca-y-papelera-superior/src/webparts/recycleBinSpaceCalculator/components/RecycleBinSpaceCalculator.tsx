import * as React from 'react';
import { MessageBar, MessageBarType, ProgressIndicator, Text } from '@fluentui/react';
import styles from './RecycleBinSpaceCalculator.module.scss';
import type { IRecycleBinSpaceCalculatorProps } from './IRecycleBinSpaceCalculatorProps';
import { HealthBadge } from './HealthBadge';
import { DiagnosticsActions } from './DiagnosticsActions';
import { StageMetricCard } from './StageMetricCard';
import { useRecycleBinSpaceCalculator } from '../hooks/useRecycleBinSpaceCalculator';
import { formatBytes } from '../utils/recycleBinSpaceCalculatorUtils';

export default function RecycleBinSpaceCalculator(props: IRecycleBinSpaceCalculatorProps): React.ReactElement {
  const state = useRecycleBinSpaceCalculator(
    {
      siteUrl: props.runtimeContext.siteUrl,
      description: props.description,
      showStageBreakdown: props.showStageBreakdown,
      refreshIntervalSeconds: props.refreshIntervalSeconds,
      warningThresholdItems: props.warningThresholdItems,
      warningThresholdSizeMb: props.warningThresholdSizeMb
    },
    props.runtimeContext
  );

  const viewModel = state.viewModel;

  return (
    <section className={styles.root}>
      <div className={styles.hero}>
        <div>
          <Text variant="xLargePlus" className={styles.title}>
            {viewModel?.title ?? 'Visualizador de elementos de biblioteca y papelera superior'}
          </Text>
          <Text variant="medium" className={styles.subtitle}>
            {props.description || 'Calcula el espacio ocupado por elementos de papelera de primer y segundo nivel del sitio.'}
          </Text>
        </div>
        {viewModel ? <HealthBadge level={viewModel.health.level} reasons={viewModel.health.reasons} /> : null}
      </div>

      {state.status === 'loading' ? <ProgressIndicator label="Cargando diagnóstico..." /> : null}

      {state.status === 'error' && state.errorMessage ? (
        <MessageBar messageBarType={MessageBarType.error}>{state.errorMessage}</MessageBar>
      ) : null}

      {state.status === 'partialData' && viewModel ? (
        <MessageBar messageBarType={MessageBarType.warning}>
          {viewModel.stage1.isAccessible && viewModel.stage2.isAccessible
            ? 'El diagnóstico es parcial porque falta el tamaño de al menos una etapa.'
            : 'El diagnóstico es parcial porque una de las etapas de la papelera no se ha podido leer desde este contexto.'}
        </MessageBar>
      ) : null}

      {viewModel?.stage2PermissionLimited ? (
        <MessageBar messageBarType={MessageBarType.info}>
          La papelera de segundo nivel solo es accesible para administradores de colección de sitios. Se muestran únicamente los datos del nivel 1.
        </MessageBar>
      ) : null}

      {state.status === 'empty' && viewModel ? (
        <MessageBar messageBarType={MessageBarType.info}>La papelera del sitio está vacía o no contiene elementos recuperables en este momento.</MessageBar>
      ) : null}

      {viewModel ? (
        <>
          <div className={styles.metricsGrid}>
            <StageMetricCard
              title="Total papelera"
              value={viewModel.totalSizeBytes === undefined ? 'No disponible' : formatBytes(viewModel.totalSizeBytes)}
              caption={viewModel.totalSizeBytes === undefined ? 'Falta una etapa o tamaño parcial' : 'Suma exacta de niveles 1 y 2'}
              iconName="Trash"
              variant={viewModel.hasPartialData ? 'warning' : 'ok'}
            />
            {props.showStageBreakdown ? (
              <>
                <StageMetricCard
                  title={viewModel.stage1.label}
                  value={formatBytes(viewModel.stage1.sizeBytes)}
                  caption={viewModel.stage1.itemCount === undefined ? 'No accesible' : `${viewModel.stage1.itemCount} elementos`}
                  iconName="RecycleBin"
                  variant={viewModel.stage1.isAccessible ? 'ok' : 'neutral'}
                />
                <StageMetricCard
                  title={viewModel.stage2.label}
                  value={formatBytes(viewModel.stage2.sizeBytes)}
                  caption={viewModel.stage2.itemCount === undefined
                    ? (viewModel.stage2PermissionLimited ? 'Solo administradores de colección' : 'No accesible')
                    : `${viewModel.stage2.itemCount} elementos`}
                  iconName="RecycleBin"
                  variant={viewModel.stage2.isAccessible ? 'ok' : 'neutral'}
                />
              </>
            ) : null}
          </div>

          <DiagnosticsActions recycleBinUrl={viewModel.recycleBinUrl} onRefresh={state.refresh} isRefreshing={state.isRefreshing} />
        </>
      ) : null}

      {!viewModel && state.status !== 'loading' ? (
        <MessageBar messageBarType={MessageBarType.info}>No hay datos para mostrar todavía.</MessageBar>
      ) : null}
    </section>
  );
}
