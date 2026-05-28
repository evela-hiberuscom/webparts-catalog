import * as React from 'react';
import {
  Text,
  Spinner,
  MessageBar,
  Link,
  Stack,
  ProgressIndicator,
  Label
} from '@fluentui/react';
import { openSafeExternalLink } from '@paquete/spfx-common';
import type { IGoalItem } from '../models/goalModels';

export interface IAreaGoalsProps {
  configuration: IAreaGoalsConfiguration;
  service: AreaGoalsService;
  autoRefreshSeconds?: number;
  title?: string;
}

import type { IAreaGoalsConfiguration } from '../models/goalModels';
import type { AreaGoalsService } from '../services/areaGoalsService';
import { useAreaGoals } from '../hooks/useAreaGoals';
import * as strings from 'AreaGoalsWebPartStrings';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';

function LoadingState(): React.ReactElement {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Spinner label="Cargando objetivos..." />
    </div>
  );
}

function EmptyState(): React.ReactElement {
  return (
    <div style={{ padding: '16px' }}>
      <MessageBar>No hay objetivos del área configurados.</MessageBar>
    </div>
  );
}

function ErrorState(props: { message: string }): React.ReactElement {
  return (
    <div style={{ padding: '16px' }}>
      <MessageBar messageBarType={2}>Error: {props.message}</MessageBar>
    </div>
  );
}

function getStatusColor(status: IGoalItem['status']): string {
  switch (status) {
    case 'completed': return '#107c10';
    case 'onTrack': return '#107c10';
    case 'atRisk': return '#d13438';
    default: return 'var(--neutralSecondary)';
  }
}

function getStatusLabel(status: IGoalItem['status']): string {
  switch (status) {
    case 'completed': return '✅ Completado';
    case 'onTrack': return '🟢 En curso';
    case 'atRisk': return '⚠️ En riesgo';
    default: return '❓ Desconocido';
  }
}

function GoalCard(props: { goal: IGoalItem }): React.ReactElement {
  const handleOpenDetail = (): void => {
    openSafeExternalLink(props.goal.detailUrl);
  };

  const statusColor = getStatusColor(props.goal.status);

  return (
    <div
      style={{
        border: '1px solid var(--neutralLight)',
        borderRadius: '4px',
        padding: '16px',
        background: 'var(--white)'
      }}
    >
      <Stack tokens={{ childrenGap: 8 }}>
        <Text styles={{ root: { fontWeight: '600', fontSize: '16px' } }}>
          {props.goal.title}
        </Text>

        {props.goal.description && (
          <Text styles={{ root: { fontSize: '13px', color: 'var(--neutralSecondary)' } }}>
            {props.goal.description}
          </Text>
        )}

        <div style={{ marginTop: '8px' }}>
          <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
            <Text styles={{ root: { fontSize: '12px' } }}>
              Progreso: {props.goal.progress}%
            </Text>
            <Text styles={{ root: { fontSize: '12px', color: statusColor } }}>
              {getStatusLabel(props.goal.status)}
            </Text>
          </Stack>
          <ProgressIndicator 
            percentComplete={props.goal.progress / 100} 
            barHeight={6}
            styles={{ 
              root: { marginTop: '4px' },
              itemProgress: { background: statusColor }
            }}
          />
        </div>

        <Stack horizontal tokens={{ childrenGap: 16 }}>
          {props.goal.owner && (
            <Label styles={{ root: { fontSize: '11px', color: 'var(--neutralSecondary)' } }}>
              👤 {props.goal.owner}
            </Label>
          )}
          {props.goal.dueDate && (
            <Label styles={{ root: { fontSize: '11px', color: 'var(--neutralSecondary)' } }}>
              📅 {new Date(props.goal.dueDate).toLocaleDateString()}
            </Label>
          )}
        </Stack>

        {props.goal.detailUrl && (
          <Link onClick={handleOpenDetail} styles={{ root: { cursor: 'pointer' } }}>
            Ver detalle
          </Link>
        )}
      </Stack>
    </div>
  );
}

function GoalsList(props: { goals: IGoalItem[] }): React.ReactElement {
  const sortedGoals = [...props.goals].sort((a, b) => {
    const statusOrder = { atRisk: 0, onTrack: 1, unknown: 2, completed: 3 };
    return statusOrder[a.status] - statusOrder[b.status];
  });

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px', padding: '16px' }}>
      {sortedGoals.map((goal) => (
        <GoalCard key={goal.id} goal={goal} />
      ))}
    </div>
  );
}

export default function AreaGoals(props: IAreaGoalsProps): React.ReactElement {
  const { configuration, service, autoRefreshSeconds, title = 'Objetivos del área' } = props;

  const state = useAreaGoals({
    service,
    configuration,
    autoRefreshSeconds
  });

  const renderContent = (): React.ReactElement => {
    switch (state.status) {
      case 'loading':
        return <LoadingState />;
      case 'empty':
        return <EmptyState />;
      case 'error':
        return <ErrorState message={state.message} />;
      case 'ready':
      case 'partialData':
        return <GoalsList goals={state.data} />;
      default:
        return <LoadingState />;
    }
  };

  return (
    <WebPartErrorBoundary title={strings.ErrorBoundaryTitle} message={strings.ErrorBoundaryMessage}>
      <div>
        <h2 style={{ margin: '16px', fontSize: '20px', fontWeight: '600' }}>{title}</h2>
        {renderContent()}
      </div>
    </WebPartErrorBoundary>
  );
}
