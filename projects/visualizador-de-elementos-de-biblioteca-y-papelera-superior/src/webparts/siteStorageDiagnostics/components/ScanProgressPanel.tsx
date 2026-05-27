import * as React from 'react';
import { ProgressIndicator, PrimaryButton, DefaultButton, Stack, Text, MessageBar, MessageBarType } from '@fluentui/react';
import type { IScanProgress } from '../models/scanConfiguration';

export interface IScanProgressPanelProps {
  progress: IScanProgress;
  isRunning: boolean;
  onStart: () => void;
  onPause: () => void;
  onResume: () => void;
  onCancel: () => void;
}

export const ScanProgressPanel: React.FC<IScanProgressPanelProps> = (props) => {
  const { progress, isRunning, onStart, onPause, onResume, onCancel } = props;
  const percentComplete = progress.totalSites > 0 ? progress.completedSites / progress.totalSites : 0;

  return (
    <Stack tokens={{ childrenGap: 12 }} styles={{ root: { padding: 16 } }} role="region" aria-label="Progreso del escaneo" aria-live="polite">
      <Text variant="large">Escaneo de colecciones de sitios</Text>

      {progress.globalStatus === 'idle' && (
        <PrimaryButton text="Iniciar escaneo" onClick={onStart} />
      )}

      {isRunning && (
        <>
          <ProgressIndicator
            label={`Escaneando: ${progress.currentSiteTitle || progress.currentSiteUrl || '...'}`}
            description={`${progress.completedSites} de ${progress.totalSites} sitios completados`}
            percentComplete={percentComplete}
          />

          {progress.estimatedRemainingSeconds !== undefined && (
            <Text variant="small">Tiempo estimado restante: {formatSeconds(progress.estimatedRemainingSeconds)}</Text>
          )}

          <Stack horizontal tokens={{ childrenGap: 8 }}>
            {progress.isPaused ? (
              <DefaultButton text="Reanudar" onClick={onResume} />
            ) : (
              <DefaultButton text="Pausar" onClick={onPause} />
            )}
            <DefaultButton text="Cancelar" onClick={onCancel} />
          </Stack>
        </>
      )}

      {progress.globalStatus === 'completed' && (
        <MessageBar messageBarType={MessageBarType.success}>
          Escaneo completado: {progress.completedSites} sitios analizados.
        </MessageBar>
      )}

      {progress.globalStatus === 'cancelled' && (
        <MessageBar messageBarType={MessageBarType.warning}>
          Escaneo cancelado. Se completaron {progress.completedSites} de {progress.totalSites} sitios.
          <PrimaryButton text="Reiniciar escaneo" onClick={onStart} styles={{ root: { marginTop: 8 } }} />
        </MessageBar>
      )}

      {progress.globalStatus === 'error' && (
        <MessageBar messageBarType={MessageBarType.error}>
          Error durante el escaneo. Se completaron {progress.completedSites} de {progress.totalSites} sitios.
          <PrimaryButton text="Reintentar" onClick={onStart} styles={{ root: { marginTop: 8 } }} />
        </MessageBar>
      )}

      {progress.lastThrottleAt && (
        <MessageBar messageBarType={MessageBarType.warning}>
          Throttling detectado. Las peticiones se han ralentizado automáticamente.
        </MessageBar>
      )}

      {progress.errors.length > 0 && (
        <Stack tokens={{ childrenGap: 4 }}>
          <Text variant="smallPlus">Errores ({progress.errors.length}):</Text>
          {progress.errors.slice(-5).map((err, i) => (
            <Text key={i} variant="small" styles={{ root: { color: '#a80000' } }}>
              {err.siteUrl}: {err.message}
            </Text>
          ))}
        </Stack>
      )}
    </Stack>
  );
};

function formatSeconds(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}
