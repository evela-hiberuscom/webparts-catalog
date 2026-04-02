import * as React from 'react';
import { Text, Spinner, MessageBar, Link } from '@fluentui/react';
import type { IAzEntry } from '../models/corporateAzModels';

export interface ICorporateAzProps {
  configuration: ICorporateAzConfiguration;
  service: CorporateAzService;
  title?: string;
}

import type { ICorporateAzConfiguration } from '../models/corporateAzModels';
import type { CorporateAzService } from '../services/corporateAzService';
import { useCorporateAz } from '../hooks/useCorporateAz';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';
import * as strings from 'CorporateAzWebPartStrings';

function LoadingState(): React.ReactElement {
  return <div style={{ padding: 20, textAlign: 'center' }}><Spinner label="Cargando..." /></div>;
}

function EmptyState(): React.ReactElement {
  return <MessageBar>No hay entradas disponibles.</MessageBar>;
}

function ErrorState(props: { message: string }): React.ReactElement {
  return <MessageBar messageBarType={2}>Error: {props.message}</MessageBar>;
}

function AzEntryCard(props: { entry: IAzEntry }): React.ReactElement {
  const handleClick = (): void => { if (props.entry.linkUrl) window.open(props.entry.linkUrl, '_self'); };
  return (
    <div style={{ border: '1px solid var(--neutralLight)', borderRadius: 8, padding: 12, background: 'var(--white)' }}>
      <Text styles={{ root: { fontWeight: 700, fontSize: 20, display: 'block', color: 'var(--accentColor)' } }}>{props.entry.letter}</Text>
      <Text styles={{ root: { fontWeight: 600, fontSize: 14 } }}>{props.entry.title}</Text>
      {props.entry.description && <Text styles={{ root: { fontSize: 12, color: 'var(--neutralSecondary)' } }}>{props.entry.description}</Text>}
      {props.entry.linkUrl && <Link onClick={handleClick}>Acceder</Link>}
    </div>
  );
}

export default function CorporateAz(props: ICorporateAzProps): React.ReactElement {
  const { configuration, service, title = 'Índice A-Z' } = props;
  const state = useCorporateAz({ service, configuration });

  const renderContent = (): React.ReactElement => {
    switch (state.status) {
      case 'loading': return <LoadingState />;
      case 'empty': return <EmptyState />;
      case 'error': return <ErrorState message={state.message} />;
      case 'ready':
      case 'partialData': {
        const grouped: Record<string, IAzEntry[]> = {};
        state.data.forEach((entry) => { const l = entry.letter.toUpperCase(); if (!grouped[l]) grouped[l] = []; grouped[l].push(entry); });
        const letters = Object.keys(grouped).sort();
        return (
          <div style={{ padding: 16 }}>
            {letters.map((letter) => (
              <div key={letter} style={{ marginBottom: 16 }}>
                <Text styles={{ root: { fontWeight: 700, fontSize: 24, color: 'var(--accentColor)' } }}>{letter}</Text>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 8, marginTop: 8 }}>
                  {grouped[letter].map((e) => <AzEntryCard key={e.id} entry={e} />)}
                </div>
              </div>
            ))}
          </div>
        );
      }
      default: return <LoadingState />;
    }
  };

  return (
    <WebPartErrorBoundary title={strings.ErrorBoundaryTitle} message={strings.ErrorBoundaryMessage}>
      <div>
        <h2 style={{ margin: 16, fontSize: 20, fontWeight: 600 }}>{title}</h2>
        {renderContent()}
      </div>
    </WebPartErrorBoundary>
  );
}