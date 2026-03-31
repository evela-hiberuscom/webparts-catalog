import * as React from 'react';
import {
  Text,
  Spinner,
  MessageBar,
  Link,
  Stack,
  Label
} from '@fluentui/react';
import type { ITaskItem } from '../models/taskModels';

export interface IMyTasksAndPendingProps {
  configuration: ITasksConfiguration;
  service: TasksService;
  autoRefreshSeconds?: number;
  title?: string;
}

import type { ITasksConfiguration } from '../models/taskModels';
import type { TasksService } from '../services/tasksService';
import { useTasks } from '../hooks/useTasks';

function LoadingState(): React.ReactElement {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Spinner label="Cargando tareas..." />
    </div>
  );
}

function EmptyState(): React.ReactElement {
  return (
    <div style={{ padding: '16px' }}>
      <MessageBar>No tienes tareas pendientes visibles.</MessageBar>
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

function getGroupLabel(group: ITaskItem['group']): string {
  switch (group) {
    case 'overdue': return '⚠️ Vencidas';
    case 'today': return '📅 Hoy';
    case 'soon': return '⏳ Próximas';
    case 'someday': return '📆 Próximo';
    case 'noDate': return '📋 Sin fecha';
  }
}

function getPriorityBadge(priority: ITaskItem['priority']): string | null {
  switch (priority) {
    case 'high': return '🔴 Alta';
    case 'medium': return '🟡 Media';
    case 'low': return '🟢 Baja';
    default: return null;
  }
}

function getGroupColor(group: ITaskItem['group']): string {
  switch (group) {
    case 'overdue': return '#d13438';
    case 'today': return '#107c10';
    default: return 'var(--neutralSecondary)';
  }
}

function TaskItemView(props: { task: ITaskItem }): React.ReactElement {
  const handleOpen = (): void => {
    if (props.task.openUrl) {
      window.open(props.task.openUrl, '_blank');
    }
  };

  const priorityBadge = getPriorityBadge(props.task.priority);
  const groupColor = getGroupColor(props.task.group);

  return (
    <div
      style={{
        border: '1px solid var(--neutralLight)',
        borderRadius: '4px',
        padding: '12px',
        background: props.task.group === 'overdue' ? '#fef6f6' : 'var(--white)',
        cursor: props.task.openUrl ? 'pointer' : 'default'
      }}
      onClick={handleOpen}
    >
      <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
          <Text styles={{ root: { fontWeight: '600', fontSize: '14px' } }}>
            {props.task.title}
          </Text>
          <Label styles={{ root: { fontSize: '11px', color: 'var(--neutralSecondary)' } }}>
            {props.task.source}
          </Label>
        </Stack>

        <Stack horizontal tokens={{ childrenGap: 8 }}>
          {priorityBadge && (
            <Text styles={{ root: { fontSize: '11px' } }}>
              {priorityBadge}
            </Text>
          )}
          {props.task.dueDate && (
            <Text styles={{ root: { fontSize: '11px', color: groupColor } }}>
              📅 {new Date(props.task.dueDate).toLocaleDateString()}
            </Text>
          )}
        </Stack>

        {props.task.openUrl && (
          <Link onClick={handleOpen} styles={{ root: { cursor: 'pointer' } }}>
            Abrir tarea
          </Link>
        )}
      </Stack>
    </div>
  );
}

function TasksList(props: { tasks: ITaskItem[] }): React.ReactElement {
  const groupedTasks = {
    overdue: props.tasks.filter((t) => t.group === 'overdue'),
    today: props.tasks.filter((t) => t.group === 'today'),
    soon: props.tasks.filter((t) => t.group === 'soon'),
    noDate: props.tasks.filter((t) => t.group === 'noDate')
  };

  const groups: Array<{ key: keyof typeof groupedTasks; label: string }> = [
    { key: 'overdue', label: '⚠️ Vencidas' },
    { key: 'today', label: '📅 Hoy' },
    { key: 'soon', label: '⏳ Próximas' },
    { key: 'noDate', label: '📋 Sin fecha' }
  ];

  return (
    <div style={{ padding: '16px' }}>
      {groups.map((group) => {
        const tasks = groupedTasks[group.key];
        if (tasks.length === 0) return undefined;
        return (
          <div key={group.key} style={{ marginBottom: '16px' }}>
            <Text styles={{ root: { fontWeight: '600', fontSize: '14px', marginBottom: '8px', display: 'block' } }}>
              {group.label} ({tasks.length})
            </Text>
            <Stack tokens={{ childrenGap: 8 }}>
              {tasks.map((task) => (
                <TaskItemView key={task.id} task={task} />
              ))}
            </Stack>
          </div>
        );
      })}
    </div>
  );
}

export default function MyTasksAndPending(props: IMyTasksAndPendingProps): React.ReactElement {
  const { configuration, service, autoRefreshSeconds, title = 'Mis tareas y pendientes' } = props;

  const state = useTasks({
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
        return <TasksList tasks={state.data} />;
      default:
        return <LoadingState />;
    }
  };

  return (
    <div>
      <h2 style={{ margin: '16px', fontSize: '20px', fontWeight: '600' }}>{title}</h2>
      {renderContent()}
    </div>
  );
}