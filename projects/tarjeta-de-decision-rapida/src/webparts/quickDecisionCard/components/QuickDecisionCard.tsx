import * as React from 'react';
import { Text, Spinner, MessageBar, Stack, ChoiceGroup, IChoiceGroupOption } from '@fluentui/react';
import type { IQuickDecision } from '../models/quickDecisionModels';

export interface IQuickDecisionCardProps {
  configuration: IQuickDecisionConfiguration;
  service: QuickDecisionService;
  title?: string;
}

import type { IQuickDecisionConfiguration } from '../models/quickDecisionModels';
import type { QuickDecisionService } from '../services/quickDecisionService';
import { useQuickDecision } from '../hooks/useQuickDecision';

function LoadingState(): React.ReactElement { return <div style={{ padding: 20, textAlign: 'center' }}><Spinner label="Cargando..." /></div>; }
function EmptyState(): React.ReactElement { return <MessageBar>No hay decisión disponible.</MessageBar>; }
function ErrorState(props: { message: string }): React.ReactElement { return <MessageBar messageBarType={2}>Error: {props.message}</MessageBar>; }

function DecisionCard(props: { decision: IQuickDecision }): React.ReactElement {
  const options: IChoiceGroupOption[] = props.decision.options.map((opt) => ({ key: opt.id, text: opt.text }));
  return (
    <div style={{ padding: 16, border: '2px solid var(--accentColor)', borderRadius: 8, background: 'var(--white)' }}>
      <Stack tokens={{ childrenGap: 12 }}>
        <Text styles={{ root: { fontWeight: 600, fontSize: 16 } }}>{props.decision.question}</Text>
        {props.decision.context && <Text styles={{ root: { fontSize: 13, color: 'var(--neutralSecondary)' } }}>{props.decision.context}</Text>}
        <ChoiceGroup options={options} label="Elige una opción" />
        {props.decision.expiresAt && <Text styles={{ root: { fontSize: 11, color: 'var(--neutralSecondary)' } }}>Vence: {new Date(props.decision.expiresAt).toLocaleDateString()}</Text>}
      </Stack>
    </div>
  );
}

export default function QuickDecisionCard(props: IQuickDecisionCardProps): React.ReactElement {
  const { configuration, service, title = 'Decisión rápida' } = props;
  const state = useQuickDecision({ service, configuration });
  const renderContent = (): React.ReactElement => {
    switch (state.status) {
      case 'loading': return <LoadingState />;
      case 'empty': return <EmptyState />;
      case 'error': return <ErrorState message={state.message} />;
      case 'ready': case 'partialData': return <DecisionCard decision={state.data[0]} />;
      default: return <LoadingState />;
    }
  };
  return <div><h2 style={{ margin: 16, fontSize: 20, fontWeight: 600 }}>{title}</h2>{renderContent()}</div>;
}