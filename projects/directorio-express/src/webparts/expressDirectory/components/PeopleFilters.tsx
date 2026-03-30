import * as React from 'react';
import { Dropdown, Text } from '@fluentui/react';

export interface IPeopleFiltersProps {
  areas: string[];
  selectedArea: string;
  areaLabel: string;
  allAreasLabel: string;
  onSelectedAreaChange: (area: string) => void;
}

export function PeopleFilters(props: IPeopleFiltersProps): React.ReactElement<IPeopleFiltersProps> {
  return (
    <div>
      <Text variant="smallPlus" block>
        {props.areaLabel}
      </Text>
      <Dropdown
        selectedKey={props.selectedArea || ''}
        options={[
          { key: '', text: props.allAreasLabel },
          ...props.areas.map((area) => ({ key: area, text: area }))
        ]}
        onChange={(_, option) => props.onSelectedAreaChange(String(option?.key ?? ''))}
      />
    </div>
  );
}

