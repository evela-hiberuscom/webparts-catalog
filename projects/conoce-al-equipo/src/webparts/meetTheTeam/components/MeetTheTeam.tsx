import * as React from 'react';

import type { IMeetTheTeamProps } from './IMeetTheTeamProps';
import { MeetTheTeamView } from './MeetTheTeamView';
import { useMeetTheTeam } from '../hooks/useMeetTheTeam';

export default function MeetTheTeam(props: IMeetTheTeamProps): React.ReactElement {
  const { viewModel, reload } = useMeetTheTeam({
    webPartProps: props.webPartProps,
    hostContext: props.hostContext
  });

  return <MeetTheTeamView viewModel={viewModel} onRetry={reload} isDarkTheme={props.isDarkTheme} userDisplayName={props.userDisplayName} />;
}
