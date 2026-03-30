import * as React from 'react';
import { SearchBox } from '@fluentui/react';
import * as strings from 'MiniOrgChartWebPartStrings';

export interface IPeopleSearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function PeopleSearchBar(props: IPeopleSearchBarProps): React.ReactElement<IPeopleSearchBarProps> {
  return (
    <SearchBox
      ariaLabel={strings.SearchLabel}
      placeholder={strings.SearchPlaceholder}
      value={props.value}
      onChange={(_, nextValue): void => props.onChange(nextValue ?? '')}
      onClear={(): void => props.onChange('')}
    />
  );
}

