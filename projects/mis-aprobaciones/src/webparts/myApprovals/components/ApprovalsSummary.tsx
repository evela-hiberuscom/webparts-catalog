import * as React from 'react';
import { DefaultButton, Stack, Text } from '@fluentui/react';
import * as strings from 'MyApprovalsWebPartStrings';
import { IApprovalCounts } from '../models/myApprovalsModels';
import styles from './MyApprovals.module.scss';

export interface IApprovalsSummaryProps {
  counts: IApprovalCounts;
  hasPartialData: boolean;
  onRefresh: () => void;
}

export function ApprovalsSummary(props: IApprovalsSummaryProps): React.ReactElement<IApprovalsSummaryProps> {
  const { counts, hasPartialData, onRefresh } = props;
  return (
    <Stack horizontal horizontalAlign="space-between" verticalAlign="center" tokens={{ childrenGap: 12 }} className={styles.myApprovalsSummary}>
      <Stack tokens={{ childrenGap: 4 }}>
        <Text variant="large">{strings.SummaryTitle}</Text>
        <Text variant="small">{hasPartialData ? strings.PartialDataMessage : strings.LoadingMessage}</Text>
      </Stack>
      <Stack horizontal tokens={{ childrenGap: 12 }} wrap={true}>
        <Text>{`${strings.SummaryOverdue}: ${counts.overdue}`}</Text>
        <Text>{`${strings.SummaryToday}: ${counts.today}`}</Text>
        <Text>{`${strings.SummaryUpcoming}: ${counts.upcoming}`}</Text>
        <Text>{`${strings.SummaryNoDate}: ${counts.noDate}`}</Text>
        <DefaultButton text={strings.RetryLabel} onClick={onRefresh} />
      </Stack>
    </Stack>
  );
}
