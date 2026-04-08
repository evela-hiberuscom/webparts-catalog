import * as React from 'react';
import { MessageBar, MessageBarType, Spinner } from '@fluentui/react';

import * as strings from 'RecognitionsWebPartStrings';
import type { RecognitionsLoadState } from '../models/recognitionsModels';

interface IRecognitionsStateProps {
  state: RecognitionsLoadState;
}

export function RecognitionsState({ state }: IRecognitionsStateProps): React.ReactElement {
  switch (state) {
    case 'loading':
      return <Spinner label={strings.LoadingStateLabel} />;
    case 'empty':
      return <MessageBar messageBarType={MessageBarType.info}>{strings.EmptyStateMessage}</MessageBar>;
    case 'partialData':
      return <MessageBar messageBarType={MessageBarType.warning}>{strings.PartialStateMessage}</MessageBar>;
    case 'error':
      return <MessageBar messageBarType={MessageBarType.error}>{strings.ErrorStateMessage}</MessageBar>;
    case 'ready':
    default:
      return <></>;
  }
}
