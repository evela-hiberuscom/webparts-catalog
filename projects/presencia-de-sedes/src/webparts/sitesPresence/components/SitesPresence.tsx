import * as React from 'react';
import { Text, Spinner, MessageBar, Stack, Label, Icon } from '@fluentui/react';
import type { ISitePresence } from '../models/sitesPresenceModels';
export interface ISitesPresenceProps { configuration: ISitesPresenceConfiguration; service: SitesPresenceService; title?: string; }
import type { ISitesPresenceConfiguration } from '../models/sitesPresenceModels';
import type { SitesPresenceService } from '../services/sitesPresenceService';
import { useSitesPresence } from '../hooks/useSitesPresence';
function LoadingState(): React.ReactElement { return <div style={{ padding: 20, textAlign: 'center' }}><Spinner label="Cargando..." /></div>; }
function EmptyState(): React.ReactElement { return <MessageBar>No hay información de sedes.</MessageBar>; }
function ErrorState({ message }: { message: string }): React.ReactElement { return <MessageBar messageBarType={2}>Error: {message}</MessageBar>; }
function getStatusIcon(status: string): string { return status === 'open' ? 'CheckMark' : status === 'closed' ? 'Cancel' : 'Warning'; }
function getStatusColor(status: string): string { return status === 'open' ? '#107c10' : status === 'closed' ? '#d13438' : '#ff8c00'; }
function SiteCard({ site }: { site: ISitePresence }): React.ReactElement {
  return (
    <div style={{ border: '1px solid var(--neutralLight)', borderRadius: 8, padding: 16, background: 'var(--white)' }}>
      <Stack tokens={{ childrenGap: 8 }}>
        <Stack horizontal horizontalAlign="space-between" verticalAlign="center">
          <Text styles={{ root: { fontWeight: 600, fontSize: 16 } }}>{site.name}</Text>
          <Label styles={{ root: { color: getStatusColor(site.status), fontSize: 12 } }}><Icon iconName={getStatusIcon(site.status)} /> {site.status === 'open' ? 'Abierto' : site.status === 'closed' ? 'Cerrado' : 'Limitado'}</Label>
        </Stack>
        {site.address && <Text styles={{ root: { fontSize: 12, color: 'var(--neutralSecondary)' } }}>📍 {site.address}</Text>}
        {site.hours && <Text styles={{ root: { fontSize: 12 } }}>🕐 {site.hours}</Text>}
        {site.capacity && site.currentOccupancy && <Text styles={{ root: { fontSize: 11 } }}>Ocupación: {site.currentOccupancy}/{site.capacity}</Text>}
        {site.contact && <Text styles={{ root: { fontSize: 11, color: 'var(--accentColor)' } }}>📧 {site.contact}</Text>}
      </Stack>
    </div>
  );
}
export default function SitesPresence(props: ISitesPresenceProps): React.ReactElement {
  const { configuration, service, title = 'Presencia de sedes' } = props;
  const state = useSitesPresence({ service, configuration });
  const renderContent = (): React.ReactElement => { switch (state.status) { case 'loading': return <LoadingState />; case 'empty': return <EmptyState />; case 'error': return <ErrorState message={state.message} />; case 'ready': case 'partialData': return <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16, padding: 16 }}>{state.data.map(s => <SiteCard key={s.id} site={s} />)}</div>; default: return <LoadingState />; } };
  return <div><h2 style={{ margin: 16, fontSize: 20, fontWeight: 600 }}>{title}</h2>{renderContent()}</div>;
}