import * as React from 'react';
import { Dropdown, IDropdownOption, SpinButton, Stack } from '@fluentui/react';
import * as strings from 'MiniOrgChartWebPartStrings';
import type { MiniOrgChartViewMode } from '../models/miniOrgChartModels';

export interface IPeopleFiltersProps {
  viewMode: MiniOrgChartViewMode;
  maxDepth: number;
  onViewModeChange: (value: MiniOrgChartViewMode) => void;
  onMaxDepthChange: (value: number) => void;
}

const viewModeOptions: IDropdownOption[] = [
  { key: 'managerWithReports', text: strings.ViewModeManagerWithReportsLabel },
  { key: 'chain', text: strings.ViewModeChainLabel },
  { key: 'smallTree', text: strings.ViewModeSmallTreeLabel }
];

export function PeopleFilters(props: IPeopleFiltersProps): React.ReactElement<IPeopleFiltersProps> {
  return (
    <Stack horizontal tokens={{ childrenGap: 12 }} verticalAlign="end" wrap>
      <Dropdown
        label={strings.ViewModeFieldLabel}
        selectedKey={props.viewMode}
        options={viewModeOptions}
        onChange={(_, option): void => {
          if (option) {
            props.onViewModeChange(option.key as MiniOrgChartViewMode);
          }
        }}
        styles={{ dropdown: { minWidth: 240 } }}
      />
      <SpinButton
        label={strings.MaxDepthFieldLabel}
        min={1}
        max={4}
        step={1}
        value={String(props.maxDepth)}
        onChange={(_, nextValue): void => {
          const parsed = Number.parseInt(nextValue ?? '2', 10);
          props.onMaxDepthChange(Number.isFinite(parsed) ? parsed : 2);
        }}
        styles={{ spinButtonWrapper: { minWidth: 120 } }}
      />
    </Stack>
  );
}

