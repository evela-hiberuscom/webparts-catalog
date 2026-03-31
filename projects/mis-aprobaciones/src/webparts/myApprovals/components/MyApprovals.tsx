import * as React from 'react';
import { MessageBar, MessageBarType, Spinner, SpinnerSize, Stack, Text } from '@fluentui/react';
import * as strings from 'MyApprovalsWebPartStrings';
import { useMyApprovals } from '../hooks/useMyApprovals';
import { IMyApprovalsProps } from './IMyApprovalsProps';
import { ApprovalsList } from './ApprovalsList';
import { ApprovalsSummary } from './ApprovalsSummary';
import styles from './MyApprovals.module.scss';

export function MyApprovals(props: IMyApprovalsProps): React.ReactElement<IMyApprovalsProps> {
  const { title, description, config, service } = props;
  const { isLoading, error, snapshot, refresh } = useMyApprovals({ config, service });

  return (
    <Stack tokens={{ childrenGap: 16 }} className={styles.myApprovals} styles={{ root: { padding: 16 } }} data-testid="my-approvals-root">
      <Stack tokens={{ childrenGap: 6 }} className={styles.myApprovalsHeader}>
        <Text variant="xLarge">{title}</Text>
        {description ? <Text variant="small">{description}</Text> : null}
      </Stack>

      {isLoading ? (
        <MessageBar messageBarType={MessageBarType.info}>
          <Spinner size={SpinnerSize.small} label={strings.LoadingMessage} />
        </MessageBar>
      ) : null}

      {error ? (
        <MessageBar
          messageBarType={MessageBarType.error}
          actions={<button type="button" onClick={() => { refresh().catch(() => undefined); }}>{strings.RetryLabel}</button>}
        >
          {strings.ErrorMessage}
        </MessageBar>
      ) : null}

      {snapshot ? (
        <>
          {snapshot.hasPartialData ? (
            <MessageBar messageBarType={MessageBarType.warning}>{strings.PartialDataMessage}</MessageBar>
          ) : null}
          <ApprovalsSummary counts={snapshot.counts} hasPartialData={snapshot.hasPartialData} onRefresh={() => { refresh().catch(() => undefined); }} />
          <ApprovalsList items={snapshot.items} />
          {!isLoading && snapshot.items.length === 0 ? <MessageBar messageBarType={MessageBarType.info}>{strings.EmptyMessage}</MessageBar> : null}
        </>
      ) : null}
    </Stack>
  );
}

export default MyApprovals;
