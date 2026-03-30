import * as React from 'react';
import { PrimaryButton, SearchBox, Stack, Text } from '@fluentui/react';

export interface IPeopleSearchBarProps {
  query: string;
  title: string;
  placeholder: string;
  summary: string;
  refreshLabel: string;
  onQueryChange: (value: string) => void;
  onRefresh: () => void;
  refreshing: boolean;
}

export function PeopleSearchBar(props: IPeopleSearchBarProps): React.ReactElement<IPeopleSearchBarProps> {
  return (
    <Stack tokens={{ childrenGap: 8 }}>
      <Text variant="smallPlus" block>
        {props.title}
      </Text>
      <SearchBox
        value={props.query}
        placeholder={props.placeholder}
        onChange={(_, value) => props.onQueryChange(value || '')}
        underlined={false}
      />
      <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: 8 }}>
        <Text variant="small" block>
          {props.summary}
        </Text>
        <PrimaryButton text={props.refreshLabel} onClick={props.onRefresh} disabled={props.refreshing} />
      </Stack>
    </Stack>
  );
}

