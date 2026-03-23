import * as React from 'react';
import { Icon, Link, Stack, Text, mergeStyles } from '@fluentui/react';
import type { IRecentResource } from '../models/recentAccesses.types';
import styles from './MyRecentAccesses.module.scss';

export interface IRecentResourceCardProps {
  item: IRecentResource;
}

const cardMetaClass = mergeStyles({
  marginTop: 8
});

function createSafeExternalLink(url: string): { href: string; rel: string; target: string } {
  return {
    href: url,
    rel: 'noopener noreferrer',
    target: '_blank'
  };
}

function getTypeIcon(type: IRecentResource['type']): string {
  switch (type) {
    case 'document':
      return 'Page';
    case 'page':
      return 'Recent';
    case 'app':
      return 'WaffleOffice365';
    default:
      return 'Recent';
  }
}

export function RecentResourceCard(props: IRecentResourceCardProps): React.ReactElement<IRecentResourceCardProps> {
  const linkProps = props.item.openUrl ? createSafeExternalLink(props.item.openUrl) : undefined;
  const dateLabel = props.item.lastAccessedAt
    ? new Intl.DateTimeFormat('es-ES', {
        year: 'numeric',
        month: 'short',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      }).format(new Date(props.item.lastAccessedAt))
    : 'Sin fecha';

  return (
    <article className={styles.resourceCard} aria-label={props.item.title}>
      <Stack horizontal horizontalAlign="space-between" verticalAlign="start" tokens={{ childrenGap: 12 }}>
        <Stack horizontal verticalAlign="center" tokens={{ childrenGap: 10 }}>
          <span className={styles.resourceIcon}>
            <Icon iconName={getTypeIcon(props.item.type)} />
          </span>
          <Text variant="large" className={styles.resourceTitle}>
            {props.item.title}
          </Text>
        </Stack>
        <span className={styles.resourcePill}>{props.item.type}</span>
      </Stack>

      <Stack tokens={{ childrenGap: 6 }} className={cardMetaClass}>
        <Text variant="small" className={styles.resourceMeta}>
          Ultimo acceso: {dateLabel}
        </Text>
        <Text variant="small" className={styles.resourceMeta}>
          Fuente: {props.item.sourceLabel}
        </Text>
      </Stack>

      <div className={styles.resourceCardFooter}>
        {linkProps ? (
          <Link {...linkProps} className={styles.resourceLink}>
            Abrir recurso
          </Link>
        ) : (
          <Text variant="small" className={styles.resourceLinkDisabled}>
            Sin enlace disponible
          </Text>
        )}
      </div>
    </article>
  );
}
