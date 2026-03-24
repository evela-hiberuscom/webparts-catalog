import * as React from 'react';
import { MessageBar, MessageBarType, Stack, Text } from '@fluentui/react';
import { escape } from '@microsoft/sp-lodash-subset';
import type { IQuickActionsRequest } from '../models/quickActionsModels';
import { QuickActionsService } from '../services/quickActionsService';
import { useQuickActions } from '../hooks/useQuickActions';
import QuickActionsFilterBar from './QuickActionsFilterBar';
import QuickActionCard from './QuickActionCard';
import QuickActionsSkeleton from './QuickActionsSkeleton';
import styles from './QuickActionsCenter.module.scss';

export interface IQuickActionsCenterProps {
  title: string;
  subtitle: string;
  request: IQuickActionsRequest;
  service: QuickActionsService;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}

export default function QuickActionsCenter(props: IQuickActionsCenterProps): React.ReactElement {
  const viewModel = useQuickActions(props.service, props.request);

  return (
    <section className={`${styles.quickActionsCenter} ${props.hasTeamsContext ? styles.teams : ''} ${props.isDarkTheme ? styles.dark : ''}`}>
      <header className={styles.header}>
        <div>
          <Text variant="xxLarge" className={styles.title}>
            {escape(props.title)}
          </Text>
          <Text variant="medium" className={styles.subtitle}>
            {escape(props.subtitle)}
          </Text>
        </div>
        <Stack horizontalAlign="end" className={styles.meta}>
          <Text variant="small" className={styles.metaLine}>
            {escape(props.userDisplayName)}
          </Text>
          <Text variant="small" className={styles.metaLine}>
            {escape(viewModel.sourceLabel)}
          </Text>
        </Stack>
      </header>

      {props.environmentMessage ? (
        <MessageBar messageBarType={MessageBarType.info} isMultiline className={styles.environmentBar}>
          {props.environmentMessage}
        </MessageBar>
      ) : null}

      {viewModel.status === 'loading' ? <QuickActionsSkeleton /> : null}

      {viewModel.status === 'error' ? (
        <MessageBar messageBarType={MessageBarType.error} isMultiline className={styles.stateBar}>
          {viewModel.errorMessage ?? 'No se han podido cargar las acciones rápidas.'}
        </MessageBar>
      ) : null}

      {viewModel.status !== 'loading' && viewModel.status !== 'error' ? (
        <>
          <QuickActionsFilterBar
            categories={viewModel.categories}
            selectedCategory={viewModel.selectedCategory}
            onCategoryChange={viewModel.setSelectedCategory}
          />

          {viewModel.hasPartialData ? (
            <MessageBar messageBarType={MessageBarType.warning} isMultiline className={styles.stateBar}>
              Algunas acciones no tienen todos los metadatos. Se muestran igualmente con fallback controlado.
            </MessageBar>
          ) : null}

          {viewModel.visibleItems.length ? (
            <div className={styles.grid}>
              {viewModel.visibleItems.map((action) => (
                <QuickActionCard key={action.id} action={action} />
              ))}
            </div>
          ) : (
            <div className={styles.emptyState}>
              <Text variant="large">No hay acciones configuradas.</Text>
              <Text variant="small" className={styles.emptyHint}>
                Ajusta la lista, el JSON o la configuración estática para cargar accesos útiles.
              </Text>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}
