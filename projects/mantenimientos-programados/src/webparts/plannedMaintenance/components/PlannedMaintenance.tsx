import * as React from 'react';

import * as strings from 'PlannedMaintenanceWebPartStrings';

import type { IPlannedMaintenanceProps } from './IPlannedMaintenanceProps';
import { usePlannedMaintenance } from '../hooks/usePlannedMaintenance';
import { PlannedMaintenanceView } from './PlannedMaintenanceView';
import { WebPartErrorBoundary } from './WebPartErrorBoundary';

export default function PlannedMaintenance(props: IPlannedMaintenanceProps): React.ReactElement {
  const { viewModel, hideCompleted, reload, setHideCompleted } = usePlannedMaintenance({
    webPartProps: props.webPartProps,
    hostContext: props.hostContext
  });

  return (
    <WebPartErrorBoundary title={strings.ErrorBoundaryTitle} message={strings.ErrorBoundaryMessage}>
      <PlannedMaintenanceView
        viewModel={{ ...viewModel, hideCompleted }}
        localeName={props.hostContext.localeName}
        onRetry={reload}
        onHideCompletedChange={setHideCompleted}
      />
    </WebPartErrorBoundary>
  );
}
