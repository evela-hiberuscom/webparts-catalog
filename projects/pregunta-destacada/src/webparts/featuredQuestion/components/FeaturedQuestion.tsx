import * as React from 'react';
import { Text, Spinner, MessageBar, Stack, ChoiceGroup, IChoiceGroupOption } from '@fluentui/react';
import type { IFeaturedQuestion } from '../models/featuredQuestionModels';

export interface IFeaturedQuestionProps {
  configuration: IFeaturedQuestionConfiguration;
  service: FeaturedQuestionService;
  title?: string;
}

import type { IFeaturedQuestionConfiguration } from '../models/featuredQuestionModels';
import type { FeaturedQuestionService } from '../services/featuredQuestionService';
import { useFeaturedQuestion } from '../hooks/useFeaturedQuestion';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';
import * as strings from 'FeaturedQuestionWebPartStrings';

function LoadingState(): React.ReactElement { return <div style={{ padding: 20, textAlign: 'center' }}><Spinner label="Cargando..." /></div>; }
function EmptyState(): React.ReactElement { return <MessageBar>No hay pregunta destacada.</MessageBar>; }
function ErrorState({ message }: { message: string }): React.ReactElement { return <MessageBar messageBarType={2}>Error: {message}</MessageBar>; }

function QuestionCard({ question, showVotes }: { question: IFeaturedQuestion; showVotes: boolean }): React.ReactElement {
  const options: IChoiceGroupOption[] = question.options.map((opt, i) => ({ key: String(i), text: showVotes ? `${opt.text} (${opt.votes})` : opt.text }));
  return (
    <div style={{ padding: 16, border: '1px solid var(--neutralLight)', borderRadius: 8, background: 'var(--white)' }}>
      <Stack tokens={{ childrenGap: 12 }}>
        {question.category && <Text styles={{ root: { fontSize: 12, color: 'var(--accentColor)', textTransform: 'uppercase' } }}>{question.category}</Text>}
        <Text styles={{ root: { fontWeight: 600, fontSize: 18 } }}>{question.question}</Text>
        {question.context && <Text styles={{ root: { fontSize: 13, color: 'var(--neutralSecondary)' } }}>{question.context}</Text>}
        <ChoiceGroup options={options} label="Selecciona tu respuesta" />
        {question.authorName && <Text styles={{ root: { fontSize: 11, color: 'var(--neutralSecondary)' } }}>Pregunta de {question.authorName}</Text>}
      </Stack>
    </div>
  );
}

export default function FeaturedQuestion(props: IFeaturedQuestionProps): React.ReactElement {
  const { configuration, service, title = 'Pregunta destacada' } = props;
  const state = useFeaturedQuestion({ service, configuration });
  const renderContent = (): React.ReactElement => {
    switch (state.status) {
      case 'loading': return <LoadingState />;
      case 'empty': return <EmptyState />;
      case 'error': return <ErrorState message={state.message} />;
      case 'ready': case 'partialData': return <QuestionCard question={state.data[0]} showVotes={configuration.showVotes} />;
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