import * as React from 'react';
import { Icon } from '@fluentui/react';

import type { IAudienceLinkRecord, IAudienceQuickLinksHostContext } from '../models/audienceLinkModels';
import { resolveSafeLink } from '../utils/linkSafety';
import styles from './AudienceQuickLinks.module.scss';

interface IAudienceLinkCardProps {
  item: IAudienceLinkRecord;
  hostContext: IAudienceQuickLinksHostContext;
  onLinkOpened?: (item: IAudienceLinkRecord) => void;
  showAudienceHint?: boolean;
}

function getBadgeLabel(value: IAudienceLinkRecord['sourceBadge']): string {
  if (value === 'personalizado') {
    return 'Personalizado';
  }

  if (value === 'genérico') {
    return 'Genérico';
  }

  return 'Partial';
}

function getBadgeClassName(value: IAudienceLinkRecord['sourceBadge']): string {
  if (value === 'personalizado') {
    return styles.badgePersonalizado;
  }

  if (value === 'genérico') {
    return styles.badgeGenérico;
  }

  return styles.badgePartial;
}

export function AudienceLinkCard(props: IAudienceLinkCardProps): React.ReactElement {
  const safeLink = resolveSafeLink(props.item.openUrl, props.hostContext.webUrl);
  const isInteractive = Boolean(safeLink);

  const content = (
    <>
      <div className={styles.cardTop}>
        <span className={styles.cardIcon} aria-hidden="true">
          <Icon iconName={props.item.iconName || 'Page'} />
        </span>
        <span className={`${styles.badge} ${getBadgeClassName(props.item.sourceBadge)}`}>{getBadgeLabel(props.item.sourceBadge)}</span>
      </div>
      <div className={styles.cardTitleRow}>
        <h3 className={styles.cardTitle}>{props.item.title}</h3>
        <span className={styles.accentLine} aria-hidden="true" />
      </div>
      <p className={styles.cardDescription}>{props.item.description}</p>
      <div className={styles.cardFooter}>
        <span className={styles.cardCategory}>{props.item.category}</span>
        {props.showAudienceHint && props.item.audiences.length > 0 ? (
          <span className={styles.cardAudience}>{props.item.audiences.slice(0, 3).join(' · ')}</span>
        ) : null}
      </div>
      <span className={styles.cardCta}>
        Abrir acceso
        <span aria-hidden="true"> →</span>
      </span>
    </>
  );

  if (!isInteractive || !safeLink) {
    return (
      <article className={`${styles.card} ${styles.cardDisabled}`} aria-label={props.item.title}>
        {content}
      </article>
    );
  }

  return (
    <a
      className={styles.card}
      href={safeLink.href}
      target={safeLink.target}
      rel={safeLink.rel}
      onClick={() => props.onLinkOpened && props.onLinkOpened(props.item)}
      aria-label={`Abrir ${props.item.title}`}
    >
      {content}
    </a>
  );
}
