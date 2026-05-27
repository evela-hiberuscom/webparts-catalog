import * as React from 'react';
import { Pivot, PivotItem, MessageBar, MessageBarType } from '@fluentui/react';
import type { ISiteStorageDiagnosticsProps } from './ISiteStorageDiagnosticsProps';
import { useScanEngine } from '../hooks/useScanEngine';
import { ScanProgressPanel } from './ScanProgressPanel';
import { ReportDashboard } from './ReportDashboard';

export const SiteStorageDiagnostics: React.FC<ISiteStorageDiagnosticsProps> = (props) => {
  const { progress, reports, start, pause, resume, cancel, isRunning } = useScanEngine(props);
  const [activeTab, setActiveTab] = React.useState<string>('dashboard');

  if (!props.configuration.reportListUrl && props.configuration.scope === 'all') {
    return (
      <MessageBar messageBarType={MessageBarType.warning}>
        Configura la URL de la lista de informes en el panel de propiedades del web part.
      </MessageBar>
    );
  }

  return (
    <div>
      <Pivot selectedKey={activeTab} onLinkClick={(item) => setActiveTab(item?.props.itemKey ?? 'dashboard')}>
        <PivotItem headerText="Dashboard" itemKey="dashboard">
          <ReportDashboard reports={reports} />
        </PivotItem>
        <PivotItem headerText="Escaneo" itemKey="scan">
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
