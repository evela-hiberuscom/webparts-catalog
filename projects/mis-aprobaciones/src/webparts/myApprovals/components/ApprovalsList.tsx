import * as React from 'react';
import { Stack, Text } from '@fluentui/react';
import * as strings from 'MyApprovalsWebPartStrings';
import { IApprovalItem } from '../models/myApprovalsModels';
import { ApprovalItem } from './ApprovalItem';
import styles from './MyApprovals.module.scss';

export interface IApprovalsListProps {
  items: IApprovalItem[];
}

export function ApprovalsList(props: IApprovalsListProps): React.ReactElement<IApprovalsListProps> {
  if (props.items.length === 0) {
    return <Text>{strings.EmptyMessage}</Text>;
  }

  return (
    <Stack tokens={{ childrenGap: 12 }} className={styles.myApprovalsList}>
      {props.items.map((item) => (
        <ApprovalItem key={item.id} item={item} />
      ))}
    </Stack>
  );
}
