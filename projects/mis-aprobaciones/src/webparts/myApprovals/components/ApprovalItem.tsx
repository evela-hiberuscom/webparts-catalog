import * as React from 'react';
import { DefaultButton, Icon, Stack, Text } from '@fluentui/react';
import * as strings from 'MyApprovalsWebPartStrings';
import * as sharedUtils from '@paquete/spfx-common/utils';
import { IApprovalItem } from '../models/myApprovalsModels';
import styles from './MyApprovals.module.scss';

export interface IApprovalItemProps {
  item: IApprovalItem;
}

const { createSafeExternalLink } = sharedUtils;

export function ApprovalItem(props: IApprovalItemProps): React.ReactElement<IApprovalItemProps> {
  const { item } = props;
  const safeLink = createSafeExternalLink(item.openUrl || undefined);

  return (
    <Stack className={styles.myApprovalsCard} tokens={{ childrenGap: 8 }}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="start" tokens={{ childrenGap: 12 }}>
        <Text variant="mediumPlus">{item.title}</Text>
        <Text variant="small">{item.badgeLabel}</Text>
      </Stack>
      <Text variant="small">{`${strings.RequesterLabel}: ${item.requester || strings.UnknownLabel}`}</Text>
      <Text variant="small">{`${strings.SourceLabel}: ${item.source}`}</Text>
      <Text variant="small">{`${strings.DueDateLabel}: ${item.dueDate || strings.NoDateLabel}`}</Text>
      <Text variant="small">{`${strings.StatusLabel}: ${item.statusLabel}`}</Text>
      {item.isPartial ? <Text variant="small">{strings.PartialDataMessage}</Text> : null}
      {safeLink ? (
        <DefaultButton href={safeLink.href} target={safeLink.target} rel={safeLink.rel} text={strings.OpenDetailLabel} iconProps={{ iconName: 'OpenInNewTab' }} />
      ) : (
        <Stack horizontal tokens={{ childrenGap: 6 }}>
          <Icon iconName="Warning" />
          <Text variant="small">{strings.PartialDataMessage}</Text>
        </Stack>
      )}
    </Stack>
  );
}
