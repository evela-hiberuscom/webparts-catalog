import * as React from 'react';
import { Pivot, PivotItem, MessageBar, MessageBarType } from '@fluentui/react';
import * as strings from 'SiteStorageDiagnosticsWebPartStrings';
import type { ISiteStorageDiagnosticsProps } from './ISiteStorageDiagnosticsProps';
import { useScanEngine } from '../hooks/useScanEngine';
import { ScanProgressPanel } from './ScanProgressPanel';
import { ReportDashboard } from './ReportDashboard';

export const SiteStorageDiagnostics: React.FC<ISiteStorageDiagnosticsProps> = (props) => {
  const { progress, reports, start, pause, resume, cancel, isRunning } = useScanEngine(props);
  const [activeTab, setActiveTab] = React.useState<string>('dashboard');

  return (
    <div>
      <MessageBar messageBarType={MessageBarType.info} isMultiline={true}>
        {strings.SaveOptionalInfoMessage}
      </MessageBar>

      <Pivot selectedKey={activeTab} onLinkClick={(item) => setActiveTab(item?.props.itemKey ?? 'dashboard')}>
        <PivotItem headerText={strings.DashboardTabLabel} itemKey="dashboard">
          <ReportDashboard reports={reports} spHttpClient={props.spHttpClient} />
        </PivotItem>
        <PivotItem headerText={strings.ScanTabLabel} itemKey="scan">
          <ScanProgressPanel
            progress={progress}
            isRunning={isRunning}
            onStart={start}
            onPause={pause}
            onResume={resume}
            onCancel={cancel}
          />
        </PivotItem>
      </Pivot>
    </div>
  );
};
