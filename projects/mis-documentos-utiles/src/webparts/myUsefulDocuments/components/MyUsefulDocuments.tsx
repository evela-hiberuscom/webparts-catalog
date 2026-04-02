import * as React from 'react';
import {
  Text,
  Spinner,
  MessageBar,
  Link,
  Stack,
  Label
} from '@fluentui/react';
import type { IUsefulDocument } from '../models/usefulDocumentModels';

export interface IMyUsefulDocumentsProps {
  configuration: IUsefulDocumentsConfiguration;
  service: UsefulDocumentsService;
  autoRefreshSeconds?: number;
  title?: string;
}

import type { IUsefulDocumentsConfiguration } from '../models/usefulDocumentModels';
import type { UsefulDocumentsService } from '../services/usefulDocumentsService';
import { useUsefulDocuments } from '../hooks/useUsefulDocuments';
import * as strings from 'MyUsefulDocumentsWebPartStrings';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';

function LoadingState(): React.ReactElement {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Spinner label="Cargando documentos..." />
    </div>
  );
}

function EmptyState(): React.ReactElement {
  return (
    <div style={{ padding: '16px' }}>
      <MessageBar>No hay documentos útiles visibles.</MessageBar>
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

function getPriorityBadge(priority: IUsefulDocument['priority']): string | undefined {
  switch (priority) {
    case 'featured': return '⭐ Destacado';
    case 'frequent': return '🔄 Frecuente';
    default: return undefined;
  }
}

function DocumentCardView(props: { document: IUsefulDocument }): React.ReactElement {
  const handleOpen = (): void => {
    if (props.document.openUrl) {
      window.open(props.document.openUrl, '_blank');
    }
  };

  const badge = getPriorityBadge(props.document.priority);

  return (
    <div
      style={{
        border: '1px solid var(--neutralLight)',
        borderRadius: '4px',
        padding: '12px',
        background: 'var(--white)',
        cursor: props.document.openUrl ? 'pointer' : 'default'
      }}
      onClick={handleOpen}
    >
      <Stack tokens={{ childrenGap: 8 }}>
        <Text styles={{ root: { fontWeight: '600', fontSize: '16px' } }}>
          {props.document.title}
        </Text>
        
        {props.document.category && (
          <Label styles={{ root: { fontSize: '12px', color: 'var(--neutralSecondary)' } }}>
            {props.document.category}
          </Label>
        )}
        
        {badge && (
          <Text styles={{ root: { fontSize: '12px', color: 'var(--accentColor)' } }}>
            {badge}
          </Text>
        )}
        
        {props.document.updatedAt && (
          <Text styles={{ root: { fontSize: '11px', color: 'var(--neutralSecondary)' } }}>
            Actualizado: {new Date(props.document.updatedAt).toLocaleDateString()}
          </Text>
        )}

        {props.document.owner && (
          <Text styles={{ root: { fontSize: '11px', color: 'var(--neutralSecondary)' } }}>
            Propietario: {props.document.owner}
          </Text>
        )}

        {props.document.openUrl && (
          <Link onClick={handleOpen} styles={{ root: { cursor: 'pointer' } }}>
            Abrir documento
          </Link>
        )}
      </Stack>
    </div>
  );
}

function DocumentsList(props: { documents: IUsefulDocument[] }): React.ReactElement {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '16px', padding: '16px' }}>
      {props.documents.map((doc) => (
        <DocumentCardView key={doc.id} document={doc} />
      ))}
    </div>
  );
}

export default function MyUsefulDocuments(props: IMyUsefulDocumentsProps): React.ReactElement {
  const { configuration, service, autoRefreshSeconds, title = 'Mis documentos útiles' } = props;

  const state = useUsefulDocuments({
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
        return <DocumentsList documents={state.data} />;
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
