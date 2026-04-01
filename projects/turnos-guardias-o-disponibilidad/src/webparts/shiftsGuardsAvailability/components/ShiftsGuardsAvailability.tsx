import * as React from 'react';
import { Text, Spinner, MessageBar, Label } from '@fluentui/react';
import type { IShiftEntry } from '../models/shiftsGuardsModels';

export interface IShiftsGuardsAvailabilityProps {
  configuration: IShiftsGuardsConfiguration;
  service: ShiftsGuardsService;
  title?: string;
}

import type { IShiftsGuardsConfiguration } from '../models/shiftsGuardsModels';
import type { ShiftsGuardsService } from '../services/shiftsGuardsService';
import { useShiftsGuards } from '../hooks/useShiftsGuards';

function LoadingState(): React.ReactElement { return <div style={{ padding: 20, textAlign: 'center' }}><Spinner label="Cargando..." /></div>; }
function EmptyState(): React.ReactElement { return <MessageBar>No hay turnos disponibles.</MessageBar>; }
function ErrorState(props: { message: string }): React.ReactElement { return <MessageBar messageBarType={2}>Error: {props.message}</MessageBar>; }

function getTypeLabel(type: string): string { return type === 'turno' ? 'Turno' : type === 'guardia' ? 'Guardia' : 'Disponibilidad'; }
function getTypeColor(type: string): string { return type === 'turno' ? '#0078d4' : type === 'guardia' ? '#d13438' : '#107c10'; }

function ShiftCard(props: { entry: IShiftEntry }): React.ReactElement {
  const startTime = new Date(props.entry.startTime).toLocaleTimeString();
  const endTime = new Date(props.entry.endTime).toLocaleTimeString();

  return (
    <div style={{ border: '1px solid var(--neutralLight)', borderRadius: 8, padding: 12, background: 'var(--white)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <Text styles={{ root: { fontWeight: 600, fontSize: 14 } }}>{props.entry.personName}</Text>
        <Label styles={{ root: { background: getTypeColor(props.entry.type), color: 'white', fontSize: 10, padding: '2px 8px', borderRadius: 4 } }}>{getTypeLabel(props.entry.type)}</Label>
      </div>
      <Text styles={{ root: { fontSize: 12, color: 'var(--neutralSecondary)', display: 'block' } }}>{props.entry.role}</Text>
      <Text styles={{ root: { fontSize: 11, display: 'block' } }}>{startTime} - {endTime}</Text>
      {props.entry.location && <Text styles={{ root: { fontSize: 11, display: 'block' } }}>{props.entry.location}</Text>}
      {props.entry.contact && <Text styles={{ root: { fontSize: 11, color: 'var(--accentColor)', display: 'block' } }}>{props.entry.contact}</Text>}
    </div>
  );
}

export default function ShiftsGuardsAvailability(props: IShiftsGuardsAvailabilityProps): React.ReactElement {
  const { configuration, service, title = 'Turnos y guardias' } = props;
  const state = useShiftsGuards({ service, configuration });
  const renderContent = (): React.ReactElement => {
    switch (state.status) {
      case 'loading': return <LoadingState />;
      case 'empty': return <EmptyState />;
      case 'error': return <ErrorState message={state.message} />;
      case 'ready': case 'partialData':
        return (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 12, padding: 16 }}>
            {state.data.map((e) => <ShiftCard key={e.id} entry={e} />)}
          </div>
        );
      default: return <LoadingState />;
    }
  };
  return <div><h2 style={{ margin: 16, fontSize: 20, fontWeight: 600 }}>{title}</h2>{renderContent()}</div>;
}
