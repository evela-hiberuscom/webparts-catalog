import * as React from 'react';
import { Text, Spinner, MessageBar, Stack, Link } from '@fluentui/react';
import type { IRouteStep } from '../models/guidedRouteModels';

export interface IGuidedRouteProps {
  configuration: IGuidedRouteConfiguration;
  service: GuidedRouteService;
  title?: string;
}

import type { IGuidedRouteConfiguration } from '../models/guidedRouteModels';
import type { GuidedRouteService } from '../services/guidedRouteService';
import { useGuidedRoute } from '../hooks/useGuidedRoute';

function LoadingState(): React.ReactElement {
  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <Spinner label="Cargando..." />
    </div>
  );
}

function EmptyState(): React.ReactElement {
  return <MessageBar>No hay pasos disponibles.</MessageBar>;
}

function ErrorState(props: { message: string }): React.ReactElement {
  return <MessageBar messageBarType={2}>Error: {props.message}</MessageBar>;
}

function StepCard(props: { step: IRouteStep }): React.ReactElement {
  const handleClick = (): void => {
    if (props.step.linkUrl) {
      window.open(props.step.linkUrl, '_self');
    }
  };

  return (
    <div style={{ display: 'flex', gap: 12, padding: 12, border: '1px solid var(--neutralLight)', borderRadius: 8, background: 'var(--white)', alignItems: 'center' }}>
      <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--accentColor)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 600 }}>
        {props.step.order}
      </div>
      <div style={{ flex: 1 }}>
        <Text styles={{ root: { fontWeight: 600, fontSize: 14 } }}>{props.step.title}</Text>
        <Text styles={{ root: { fontSize: 12, color: 'var(--neutralSecondary)' } }}>{props.step.description}</Text>
      </div>
      {props.step.linkUrl && <Link onClick={handleClick}>Ir</Link>}
    </div>
  );
}

export default function GuidedRoute(props: IGuidedRouteProps): React.ReactElement {
  const { configuration, service, title = 'Tu recorrido' } = props;
  const state = useGuidedRoute({ service, configuration });

  const renderContent = (): React.ReactElement => {
    switch (state.status) {
      case 'loading': return <LoadingState />;
      case 'empty': return <EmptyState />;
      case 'error': return <ErrorState message={state.message} />;
      case 'ready':
      case 'partialData':
        return (
          <div style={{ padding: 16 }}>
            {state.data.map((s) => <StepCard key={s.id} step={s} />)}
          </div>
        );
      default:
        return <LoadingState />;
    }
  };

  return (
    <div>
      <h2 style={{ margin: 16, fontSize: 20, fontWeight: 600 }}>{title}</h2>
      {renderContent()}
    </div>
  );
}