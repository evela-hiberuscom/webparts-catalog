import * as React from 'react';
import { MessageBar, MessageBarType, Spinner, SpinnerSize, Text } from '@fluentui/react';
import styles from './CorporateResourcesSearch.module.scss';
import type { CorporateResourcesViewState } from '../models/corporateResourcesSearchModels';

export interface ISearchStatePanelProps {
  status: CorporateResourcesViewState;
  query: string;
  resultCount: number;
  errorMessage?: string;
  hasPartialData: boolean;
}

export function SearchStatePanel(props: ISearchStatePanelProps): React.ReactElement {
  if (props.status === 'loading') {
    return (
      <div className={styles.statePanel}>
        <Spinner size={SpinnerSize.medium} label="Buscando recursos" />
      </div>
    );
  }

  if (props.status === 'error') {
    return (
      <div className={styles.statePanel}>
        <MessageBar messageBarType={MessageBarType.error} isMultiline>
          {props.errorMessage ?? 'No se ha podido completar la búsqueda.'}
        </MessageBar>
      </div>
    );
  }

  if (props.status === 'idle') {
    return (
      <div className={styles.statePanel}>
        <Text variant="medium">Escribe para buscar políticas, plantillas, procedimientos o manuales.</Text>
      </div>
    );
  }

  if (props.status === 'empty') {
    return (
      <div className={styles.statePanel}>
        <MessageBar messageBarType={MessageBarType.warning} isMultiline>
          No se han encontrado recursos para &ldquo;{props.query}&rdquo;.
        </MessageBar>
      </div>
    );
  }

  if (props.status === 'partialData') {
    return (
      <div className={styles.statePanel}>
        <MessageBar messageBarType={MessageBarType.warning} isMultiline>
          {props.resultCount > 0
            ? 'La búsqueda devuelve resultados parciales. Algunos recursos no tienen toda la información esperada.'
            : 'La fuente devuelve datos parciales.'}
        </MessageBar>
      </div>
    );
  }

  return <></>;
}
