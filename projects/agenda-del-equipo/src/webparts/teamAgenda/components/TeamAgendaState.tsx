import * as React from 'react';
import { MessageBar, MessageBarType, Spinner } from '@fluentui/react';
import * as strings from 'TeamAgendaWebPartStrings';

import type { TeamAgendaLoadState } from '../models/teamAgendaModels';

export interface ITeamAgendaStateProps {
  state: TeamAgendaLoadState;
}

export function TeamAgendaState({ state }: ITeamAgendaStateProps): React.ReactElement {
  switch (state) {
    case 'loading':
      return <Spinner label={strings.LoadingStateLabel} />;
    case 'empty':
      return <MessageBar>{strings.EmptyStateMessage}</MessageBar>;
    case 'partialData':
      return <MessageBar messageBarType={MessageBarType.warning}>{strings.PartialStateMessage}</MessageBar>;
    case 'error':
      return <MessageBar messageBarType={MessageBarType.error}>{strings.ErrorStateMessage}</MessageBar>;
    case 'ready':
    default:
      return <></>;
  }
}
