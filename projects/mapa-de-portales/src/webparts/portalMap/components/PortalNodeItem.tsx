import * as React from 'react';
import { DefaultButton, Icon, Link, Stack, Text } from '@fluentui/react';
import * as strings from 'PortalMapWebPartStrings';
import type { IPortalTreeNode } from '../models/portalMapModels';
import styles from './PortalMap.module.scss';

interface IPortalNodeItemProps {
  node: IPortalTreeNode;
}

function getNodeTypeLabel(nodeType: string): string {
  switch (nodeType) {
    case 'hub':
      return strings.NodeTypeHub;
    case 'site':
      return strings.NodeTypeSite;
    case 'area':
      return strings.NodeTypeArea;
    case 'utility':
      return strings.NodeTypeUtility;
    default:
      return strings.NodeTypeUnknown;
  }
}

export function PortalNodeItem(props: IPortalNodeItemProps): React.ReactElement<IPortalNodeItemProps> {
  const [expanded, setExpanded] = React.useState<boolean>(props.node.depth < 1);
  const hasChildren = props.node.children.length > 0;

  return (
    <li className={styles.nodeItem} role="treeitem" aria-level={props.node.depth + 1} aria-expanded={hasChildren ? expanded : undefined}>
      <div className={styles.nodeCard}>
        <Stack horizontal={true} horizontalAlign="space-between" verticalAlign="start" wrap={true} tokens={{ childrenGap: 12 }}>
          <Stack tokens={{ childrenGap: 6 }} className={styles.nodeContent}>
            <Stack horizontal={true} wrap={true} tokens={{ childrenGap: 8 }}>
              <span className={`${styles.badge} ${styles.typeBadge}`}>{getNodeTypeLabel(props.node.nodeType)}</span>
              {props.node.featured ? <span className={styles.badge}>{strings.NodeBadgeFeatured}</span> : undefined}
              {props.node.partialData ? <span className={`${styles.badge} ${styles.partialBadge}`}>{strings.NodeBadgePartial}</span> : undefined}
              {props.node.isOrphan ? <span className={`${styles.badge} ${styles.partialBadge}`}>{strings.NodeBadgeOrphan}</span> : undefined}
            </Stack>
            <Text variant="mediumPlus" className={styles.nodeTitle}>
              {props.node.title}
            </Text>
            {props.node.description ? (
              <Text variant="small" className={styles.nodeDescription}>
                {props.node.description}
              </Text>
            ) : undefined}
            {props.node.openUrl ? (
              <Link href={props.node.openUrl} target="_blank" rel="noopener noreferrer">
                {strings.NodeOpenButton}
              </Link>
            ) : (
              <Text variant="small" className={styles.nodeHint}>
                {strings.NodeNoLinkMessage}
              </Text>
            )}
          </Stack>
          {hasChildren ? (
            <DefaultButton
              iconProps={{ iconName: expanded ? 'ChevronUp' : 'ChevronDown' }}
              text={expanded ? strings.NodeCollapseLabel : strings.NodeExpandLabel}
              onClick={() => setExpanded(!expanded)}
            />
          ) : (
            <Icon iconName="Page" className={styles.nodeIcon} />
          )}
        </Stack>
      </div>
      {hasChildren && expanded ? (
        <ul className={styles.childList} role="group">
          {props.node.children.map((child) => (
            <PortalNodeItem key={child.id} node={child} />
          ))}
        </ul>
      ) : undefined}
    </li>
  );
}
