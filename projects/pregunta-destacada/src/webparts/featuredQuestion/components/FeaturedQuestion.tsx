import * as React from 'react';
import {
  ChoiceGroup,
  type IChoiceGroupOption,
  MessageBar,
  MessageBarType,
  Spinner,
  Stack,
  Text
} from '@fluentui/react';

import * as strings from 'FeaturedQuestionWebPartStrings';
import { useFeaturedQuestion } from '../hooks/useFeaturedQuestion';
import type { IFeaturedQuestion } from '../models/featuredQuestionModels';
import type { IFeaturedQuestionProps } from './IFeaturedQuestionProps';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';
import styles from './FeaturedQuestion.module.scss';

function LoadingState(): React.ReactElement {
  return (
    <div className={styles.state}>
      <Spinner label={strings.LoadingMessage} />
    </div>
  );
}

function EmptyState(): React.ReactElement {
  return (
    <MessageBar>{strings.EmptyMessage}</MessageBar>
  );
}

function ErrorState({ message }: { message: string }): React.ReactElement {
  return (
    <MessageBar messageBarType={MessageBarType.error} isMultiline>
      {strings.ErrorMessage} {message}
    </MessageBar>
  );
}

function QuestionCard({
  question,
  showVotes
}: {
  question: IFeaturedQuestion;
  showVotes: boolean;
}): React.ReactElement {
  const options: IChoiceGroupOption[] = question.options.map((option, index) => ({
    key: String(index),
    text: showVotes ? `${option.text} (${option.votes} ${strings.VotesLabel})` : option.text
  }));

  return (
    <article className={styles.card}>
      <Stack tokens={{ childrenGap: 12 }}>
        <div className={styles.metaRow}>
          {question.category ? <span className={styles.category}>{question.category}</span> : null}
          {question.expiresAt ? (
            <Text variant="small" className={styles.expiry}>
              {strings.ExpiresLabel} {new Date(question.expiresAt).toLocaleDateString('es-ES')}
            </Text>
          ) : null}
        </div>

        <Text as="h3" variant="xLarge" className={styles.question}>
          {question.question}
        </Text>

        {question.context ? (
          <Text variant="medium" className={styles.context}>
            {question.context}
          </Text>
        ) : null}

        {options.length ? (
          <ChoiceGroup options={options} label={strings.SelectAnswerLabel} />
        ) : (
          <MessageBar messageBarType={MessageBarType.warning}>
            {strings.PartialDataMessage}
          </MessageBar>
        )}

        {question.authorName ? (
          <Text variant="small" className={styles.author}>
            {strings.QuestionFromLabel} {question.authorName}
          </Text>
        ) : null}
      </Stack>
    </article>
  );
}

export default function FeaturedQuestion(props: IFeaturedQuestionProps): React.ReactElement {
  const { configuration, service, title = strings.WebPartTitle } = props;
  const state = useFeaturedQuestion({ service, configuration });

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
        return (
          <>
            {state.status === 'partialData' ? (
              <MessageBar messageBarType={MessageBarType.warning}>
                {strings.PartialDataMessage}
              </MessageBar>
            ) : null}
            <QuestionCard question={state.data[0]} showVotes={configuration.showVotes} />
          </>
        );
      default:
        return <LoadingState />;
    }
  };

  return (
    <WebPartErrorBoundary title={strings.ErrorBoundaryTitle} message={strings.ErrorBoundaryMessage}>
      <section className={styles.featuredQuestion} aria-label={title}>
        <header className={styles.header}>
          <Text variant="small" className={styles.eyebrow}>
            {strings.QuestionOfTheDayLabel}
          </Text>
          <Text as="h2" variant="xxLarge" className={styles.title}>
            {title}
          </Text>
        </header>
        {renderContent()}
      </section>
    </WebPartErrorBoundary>
  );
}
