import * as React from 'react';
import {
  Text,
  Spinner,
  MessageBar,
  Link,
  Stack,
  PrimaryButton,
  Label
} from '@fluentui/react';
import type { ICampaignItem } from '../models/campaignModels';

export interface IInternalCampaignPanelProps {
  configuration: IInternalCampaignConfiguration;
  service: CampaignService;
  autoRefreshSeconds?: number;
  title?: string;
}

import type { IInternalCampaignConfiguration } from '../models/campaignModels';
import type { CampaignService } from '../services/campaignService';
import { useCampaigns } from '../hooks/useCampaigns';

function LoadingState(): React.ReactElement {
  return (
    <div style={{ padding: '20px', textAlign: 'center' }}>
      <Spinner label="Cargando campañas..." />
    </div>
  );
}

function EmptyState(): React.ReactElement {
  return (
    <div style={{ padding: '16px' }}>
      <MessageBar>No hay campañas activas en este momento.</MessageBar>
    </div>
  );
}

function ErrorState(props: { message: string }): React.ReactElement {
  return (
    <div style={{ padding: '16px' }}>
      <MessageBar messageBarType={2}>Error: {props.message}</MessageBar>
    </div>
  );
}

function CampaignCard(props: { campaign: ICampaignItem }): React.ReactElement {
  const handleCtaClick = (): void => {
    if (props.campaign.ctaUrl) {
      window.open(props.campaign.ctaUrl, '_blank');
    }
  };

  const backgroundColor = getCategoryColor(props.campaign.category);

  return (
    <div
      style={{
        background: backgroundColor,
        borderRadius: '8px',
        padding: '20px',
        color: 'var(--white)'
      }}
    >
      <Stack tokens={{ childrenGap: 12 }}>
        {props.campaign.category && (
          <Label styles={{ root: { color: 'var(--white)', fontSize: '11px', textTransform: 'uppercase' } }}>
            {props.campaign.category}
          </Label>
        )}
        
        <Text styles={{ root: { fontWeight: '700', fontSize: '20px', color: 'var(--white)' } }}>
          {props.campaign.title}
        </Text>

        {props.campaign.claim && (
          <Text styles={{ root: { fontSize: '16px', color: 'var(--white)', fontStyle: 'italic' } }}>
            {props.campaign.claim}
          </Text>
        )}

        {props.campaign.description && (
          <Text styles={{ root: { fontSize: '13px', color: 'var(--white)' } }}>
            {props.campaign.description}
          </Text>
        )}

        {props.campaign.startDate && props.campaign.endDate && (
          <Text styles={{ root: { fontSize: '11px', color: 'rgba(255,255,255,0.8)' } }}>
            📅 {new Date(props.campaign.startDate).toLocaleDateString()} - {new Date(props.campaign.endDate).toLocaleDateString()}
          </Text>
        )}

        {props.campaign.ctaUrl && (
          <div style={{ marginTop: '8px' }}>
            <PrimaryButton 
              text={props.campaign.ctaText || 'Más información'} 
              onClick={handleCtaClick}
              styles={{ 
                root: { background: 'var(--white)', color: backgroundColor },
                rootHovered: { background: 'rgba(255,255,255,0.9)' }
              }}
            />
          </div>
        )}
      </Stack>
    </div>
  );
}

function getCategoryColor(category: string | undefined): string {
  switch (category?.toLowerCase()) {
    case 'seguridad': return '#d13438';
    case 'bienestar': return '#107c10';
    case 'formación': return '#0078d4';
    case 'cultura': return '#8764b8';
    default: return '#6264a7';
  }
}

function CampaignCarousel(props: { campaigns: ICampaignItem[] }): React.ReactElement {
  return (
    <div style={{ padding: '16px' }}>
      <Stack tokens={{ childrenGap: 16 }}>
        {props.campaigns.map((campaign) => (
          <CampaignCard key={campaign.id} campaign={campaign} />
        ))}
      </Stack>
    </div>
  );
}

export default function InternalCampaignPanel(props: IInternalCampaignPanelProps): React.ReactElement {
  const { configuration, service, autoRefreshSeconds, title = 'Campañas internas' } = props;

  const state = useCampaigns({
    service,
    configuration,
    autoRefreshSeconds
  });

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
        return <CampaignCarousel campaigns={state.data} />;
      default:
        return <LoadingState />;
    }
  };

  return (
    <div>
      <h2 style={{ margin: '16px', fontSize: '20px', fontWeight: '600' }}>{title}</h2>
      {renderContent()}
    </div>
  );
}