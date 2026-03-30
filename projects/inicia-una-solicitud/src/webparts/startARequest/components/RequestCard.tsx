import * as React from 'react';
import { MessageBar, MessageBarType, Text } from '@fluentui/react';
import * as strings from 'StartARequestWebPartStrings';
import type { IRequestItem } from '../models/startARequestModels';
import styles from './StartARequest.module.scss';

export interface IRequestCardProps {
  item: IRequestItem;
  showPrerequisites: boolean;
}

export function RequestCard(props: IRequestCardProps): React.ReactElement {
  const { item } = props;

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardBadges}>
          <span className={styles.categoryBadge}>{item.category}</span>
          {item.featured ? <span className={styles.featuredBadge}>{strings.FeaturedBadgeLabel}</span> : null}
        </div>
      </div>

      <div className={styles.cardBody}>
        <Text as="h3" variant="large" block className={styles.cardTitle}>
          {item.title}
        </Text>
        {item.audience ? (
          <Text block className={styles.cardMeta}>
            {item.audience}
          </Text>
        ) : null}
        {item.description ? (
          <Text block className={styles.cardDescription}>
            {item.description}
          </Text>
        ) : (
          <MessageBar messageBarType={MessageBarType.info} isMultiline={true} className={styles.inlineMessage}>
            {strings.PartialDataMessage}
          </MessageBar>
        )}

        {props.showPrerequisites && item.prerequisites ? (
          <div className={styles.prerequisites}>
            <Text block className={styles.prerequisitesLabel}>
              {strings.PrerequisitesLabel}
            </Text>
            <Text block className={styles.prerequisitesText}>
              {item.prerequisites}
            </Text>
          </div>
        ) : null}
      </div>

      <div className={styles.cardFooter}>
        {item.actionable && item.startLink ? (
          <a
            className={styles.actionLink}
            href={item.startLink.href}
            target={item.startLink.target}
            rel={item.startLink.rel}
          >
            {strings.OpenRequestLabel}
          </a>
        ) : (
          <Text block className={styles.cardMeta}>
            {strings.NoLinkMessage}
          </Text>
        )}
      </div>
    </article>
  );
}
