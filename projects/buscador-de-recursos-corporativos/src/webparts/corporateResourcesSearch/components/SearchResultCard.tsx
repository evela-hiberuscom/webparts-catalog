import * as React from 'react';
import { DefaultButton, Text } from '@fluentui/react';
import { createSafeExternalLink } from '@paquete/spfx-common/utils';
import styles from './CorporateResourcesSearch.module.scss';
import type { ICorporateResourceItem } from '../models/corporateResourcesSearchModels';

export interface ISearchResultCardProps {
  item: ICorporateResourceItem;
}

export function SearchResultCard(props: ISearchResultCardProps): React.ReactElement {
  const linkProps = createSafeExternalLink(props.item.openUrl);

  return (
    <article className={styles.resultCard}>
      <div className={styles.resultCardHeader}>
        <Text variant="large" className={styles.resultTitle}>
          {props.item.title}
        </Text>
        <div className={styles.resultBadges}>
          {props.item.resourceType ? <span>{props.item.resourceType}</span> : null}
          {props.item.category ? <span>{props.item.category}</span> : null}
          {props.item.isFeatured ? <span>Destacado</span> : null}
          {props.item.isExactMatch ? <span>Coincidencia exacta</span> : null}
        </div>
      </div>

      {props.item.summary ? (
        <Text variant="small" className={styles.resultSummary}>
          {props.item.summary}
        </Text>
      ) : (
        <Text variant="small" className={styles.resultSummaryMuted}>
          Sin resumen disponible.
        </Text>
      )}

      <div className={styles.resultActions}>
        {linkProps ? (
          <a className={styles.resultLink} href={linkProps.href} target={linkProps.target} rel={linkProps.rel}>
            <DefaultButton text="Abrir recurso" />
          </a>
        ) : (
          <Text variant="small" className={styles.resultSummaryMuted}>
            Este recurso no tiene enlace operativo.
          </Text>
        )}
      </div>
    </article>
  );
}

