import * as React from 'react';
import { Link, Stack, Text } from '@fluentui/react';
import * as strings from 'PortalMapWebPartStrings';
import type { IPortalNode, IPortalNodeGroup, IPortalTreeNode } from '../models/portalMapModels';
import styles from './PortalMap.module.scss';
import { PortalNodeItem } from './PortalNodeItem';

interface IPortalTreeProps {
  roots: IPortalTreeNode[];
}

interface IPortalGroupedListProps {
  groups: IPortalNodeGroup[];
}

interface IPortalCardsProps {
  items: IPortalNode[];
}

function getGroupLabel(nodeType: string): string {
  switch (nodeType) {
    case 'hub':
      return strings.GroupsHubLabel;
    case 'site':
      return strings.GroupsSiteLabel;
    case 'area':
      return strings.GroupsAreaLabel;
    case 'utility':
      return strings.GroupsUtilityLabel;
    default:
      return strings.GroupsUnknownLabel;
  }
}

export function PortalTree(props: IPortalTreeProps): React.ReactElement<IPortalTreeProps> {
  return (
    <ul className={styles.tree} role="tree" aria-label={strings.TreeAriaLabel}>
      {props.roots.map((root) => (
        <PortalNodeItem key={root.id} node={root} />
      ))}
    </ul>
  );
}

export function PortalGroupedList(props: IPortalGroupedListProps): React.ReactElement<IPortalGroupedListProps> {
  return (
    <div className={styles.groupedView} aria-label={strings.GroupedAriaLabel}>
      {props.groups.map((group) => (
        <section key={group.nodeType} className={styles.groupSection}>
          <Text variant="large" className={styles.groupTitle}>
            {getGroupLabel(group.nodeType)}
          </Text>
          <Stack tokens={{ childrenGap: 12 }}>
            {group.items.map((item) => (
              <div key={item.id} className={styles.groupRow}>
                <Stack horizontal={true} horizontalAlign="space-between" verticalAlign="center" wrap={true} tokens={{ childrenGap: 12 }}>
                  <Stack tokens={{ childrenGap: 4 }}>
                    <Text variant="mediumPlus">{item.title}</Text>
                    {item.description ? <Text variant="small">{item.description}</Text> : undefined}
                  </Stack>
                  {item.openUrl ? (
                    <Link href={item.openUrl} target="_blank" rel="noopener noreferrer">
                      {strings.NodeOpenButton}
                    </Link>
                  ) : (
                    <Text variant="small" className={styles.nodeHint}>
                      {strings.NodeNoLinkMessage}
                    </Text>
                  )}
                </Stack>
              </div>
            ))}
          </Stack>
        </section>
      ))}
    </div>
  );
}

export function PortalCards(props: IPortalCardsProps): React.ReactElement<IPortalCardsProps> {
  return (
    <div className={styles.cardGrid} aria-label={strings.CardsAriaLabel}>
      {props.items.map((item) => (
        <article key={item.id} className={styles.portalCard}>
          <Stack tokens={{ childrenGap: 8 }}>
            <Text variant="small" className={styles.cardEyebrow}>
              {getGroupLabel(item.nodeType)}
            </Text>
            <Text variant="large" className={styles.cardTitle}>
              {item.title}
            </Text>
            {item.description ? <Text variant="small">{item.description}</Text> : undefined}
            {item.openUrl ? (
              <Link href={item.openUrl} target="_blank" rel="noopener noreferrer">
                {strings.NodeOpenButton}
              </Link>
            ) : (
              <Text variant="small" className={styles.nodeHint}>
                {strings.NodeNoLinkMessage}
              </Text>
            )}
          </Stack>
        </article>
      ))}
    </div>
  );
}
