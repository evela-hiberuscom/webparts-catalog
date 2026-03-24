import * as React from 'react';
import { DefaultButton, Icon, Text } from '@fluentui/react';
import { createSafeExternalLink } from '@paquete/spfx-common/utils';
import styles from './QuickActionsCenter.module.scss';
import type { IQuickAction } from '../models/quickActionsModels';

export interface IQuickActionCardProps {
  action: IQuickAction;
}

export default function QuickActionCard(props: IQuickActionCardProps): React.ReactElement {
  const safeLink = createSafeExternalLink(props.action.openUrl);

  return (
    <article className={styles.card}>
      <div className={styles.cardHeader}>
        <div className={styles.cardIcon}>
          <Icon iconName={props.action.icon} />
        </div>
        <div className={styles.cardTitleBlock}>
          <Text variant="mediumPlus" className={styles.cardTitle}>
            {props.action.title}
          </Text>
          <Text variant="small" className={styles.cardCategory}>
            {props.action.category}
          </Text>
        </div>
      </div>
      <Text variant="small" className={styles.cardDescription}>
        {props.action.description}
      </Text>
      <div className={styles.cardFooter}>
        {safeLink ? (
          <DefaultButton text="Abrir" href={safeLink.href} target={safeLink.target} rel={safeLink.rel} />
        ) : (
          <Text variant="small" className={styles.cardDisabled}>
            Sin enlace configurado
          </Text>
        )}
      </div>
    </article>
  );
}
