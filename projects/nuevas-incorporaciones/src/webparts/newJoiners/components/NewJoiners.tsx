import * as React from 'react';
import {
  Text,
  Spinner,
  MessageBar,
  Link,
  Persona,
  PersonaSize
} from '@fluentui/react';
import { openSafeExternalLink } from '@paquete/spfx-common';
import type { IJoiner } from '../models/joinerModels';

export interface INewJoinersProps {
  configuration: INewJoinersConfiguration;
  service: NewJoinersService;
  autoRefreshSeconds?: number;
  title?: string;
}

import type { INewJoinersConfiguration } from '../models/joinerModels';
import type { NewJoinersService } from '../services/newJoinersService';
import { useNewJoiners } from '../hooks/useNewJoiners';
import * as strings from 'NewJoinersWebPartStrings';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';

function LoadingState(): React.ReactElement {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Spinner label="Cargando incorporaciones..." />
    </div>
  );
}

function EmptyState(): React.ReactElement {
  return (
    <div style={{ padding: '16px' }}>
      <MessageBar>No hay nuevas incorporaciones en el período configurado.</MessageBar>
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

function JoinerCard(props: { joiner: IJoiner }): React.ReactElement {
  const handleOpenProfile = (): void => {
    openSafeExternalLink(props.joiner.profileUrl);
  };

  return (
    <div
      style={{
        border: '1px solid var(--neutralLight)',
        borderRadius: '4px',
        padding: '16px',
        background: 'var(--white)',
        textAlign: 'center'
      }}
    >
      <Persona
        imageUrl={props.joiner.photoUrl}
        text={props.joiner.displayName}
        secondaryText={props.joiner.jobTitle}
        tertiaryText={props.joiner.department}
        size={PersonaSize.size72}
        styles={{ root: { margin: '0 auto 12px' } }}
      />
      
      {props.joiner.startDate && (
        <Text styles={{ root: { fontSize: '12px', color: 'var(--accentColor)', display: 'block', marginBottom: '8px' } }}>
          📅 Se incorporó el {new Date(props.joiner.startDate).toLocaleDateString()}
        </Text>
      )}

      {props.joiner.welcomeMessage && (
        <Text styles={{ root: { fontSize: '13px', fontStyle: 'italic', display: 'block', marginBottom: '12px' } }}>
          &ldquo;{props.joiner.welcomeMessage}&rdquo;
        </Text>
      )}

      {props.joiner.profileUrl && (
        <Link onClick={handleOpenProfile} styles={{ root: { cursor: 'pointer' } }}>
          Ver perfil
        </Link>
      )}
    </div>
  );
}

function JoinersList(props: { joiners: IJoiner[] }): React.ReactElement {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '16px', padding: '16px' }}>
      {props.joiners.map((joiner) => (
        <JoinerCard key={joiner.id} joiner={joiner} />
      ))}
    </div>
  );
}

export default function NewJoiners(props: INewJoinersProps): React.ReactElement {
  const { configuration, service, autoRefreshSeconds, title = 'Nuevas incorporaciones' } = props;

  const state = useNewJoiners({
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
        return <JoinersList joiners={state.data} />;
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
