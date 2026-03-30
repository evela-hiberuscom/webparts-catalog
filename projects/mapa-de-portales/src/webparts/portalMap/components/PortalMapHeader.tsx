import * as React from 'react';
import { ChoiceGroup, Label, Stack, Text, type IChoiceGroupOption } from '@fluentui/react';
import * as strings from 'PortalMapWebPartStrings';
import type { PortalMapViewMode } from '../models/portalMapModels';
import styles from './PortalMap.module.scss';

interface IPortalMapHeaderProps {
  selectedViewMode: PortalMapViewMode;
  onViewModeChange: (mode: PortalMapViewMode) => void;
  sourceLabel: string;
  rootsCount: number;
  nodesCount: number;
}

const VIEW_OPTIONS: IChoiceGroupOption[] = [
  { key: 'tree', text: strings.ViewModeTreeOption },
  { key: 'grouped', text: strings.ViewModeGroupedOption },
  { key: 'cards', text: strings.ViewModeCardsOption }
];

export function PortalMapHeader(props: IPortalMapHeaderProps): React.ReactElement<IPortalMapHeaderProps> {
  return (
    <Stack className={styles.header} tokens={{ childrenGap: 12 }}>
      <Stack horizontal={true} horizontalAlign="space-between" verticalAlign="center" wrap={true} tokens={{ childrenGap: 16 }}>
        <Stack tokens={{ childrenGap: 4 }}>
          <Text variant="xLarge" className={styles.title}>
            {strings.WebPartTitle}
          </Text>
          <Text variant="medium" className={styles.subtitle}>
            {strings.WebPartSubtitle}
          </Text>
        </Stack>
        <Stack horizontal={true} wrap={true} tokens={{ childrenGap: 12 }}>
          <div className={styles.statCard}>
            <Text variant="small" className={styles.statLabel}>
              {strings.StatsRootsLabel}
            </Text>
            <Text variant="large" className={styles.statValue}>
              {props.rootsCount}
            </Text>
          </div>
          <div className={styles.statCard}>
            <Text variant="small" className={styles.statLabel}>
              {strings.StatsNodesLabel}
            </Text>
            <Text variant="large" className={styles.statValue}>
              {props.nodesCount}
            </Text>
          </div>
        </Stack>
      </Stack>
      <Stack horizontal={true} horizontalAlign="space-between" wrap={true} tokens={{ childrenGap: 16 }}>
        <Stack tokens={{ childrenGap: 4 }}>
          <Label>{strings.SourceLabelPrefix}</Label>
          <Text variant="small">{props.sourceLabel}</Text>
        </Stack>
        <div className={styles.viewSelector}>
          <ChoiceGroup
            aria-label={strings.ViewSwitcherLabel}
            label={strings.ViewSwitcherLabel}
            selectedKey={props.selectedViewMode}
            options={VIEW_OPTIONS}
            onChange={(_, option) => props.onViewModeChange((option?.key ?? 'tree') as PortalMapViewMode)}
          />
        </div>
      </Stack>
    </Stack>
  );
}
