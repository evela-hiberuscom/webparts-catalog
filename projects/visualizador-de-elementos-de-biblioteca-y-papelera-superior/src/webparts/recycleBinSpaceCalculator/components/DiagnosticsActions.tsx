import * as React from 'react';
import { DefaultButton, Text } from '@fluentui/react';
import { createSafeExternalLink } from '@paquete/spfx-common/utils';
import styles from './RecycleBinSpaceCalculator.module.scss';

export interface IDiagnosticsActionsProps {
  recycleBinUrl: string;
  onRefresh: () => void;
  isRefreshing: boolean;
}

export function DiagnosticsActions(props: IDiagnosticsActionsProps): React.ReactElement {
  const safeLink = createSafeExternalLink(props.recycleBinUrl);

  return (
    <div className={styles.actionsRow}>
      <DefaultButton text={props.isRefreshing ? 'Actualizando...' : 'Refrescar'} onClick={props.onRefresh} disabled={props.isRefreshing} />
      {safeLink ? (
        <a className={styles.actionLink} href={safeLink.href} rel={safeLink.rel} target={safeLink.target}>
          <Text variant="small">Abrir papelera</Text>
        </a>
      ) : null}
    </div>
  );
}
