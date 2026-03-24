import * as React from 'react';
import { Text } from '@fluentui/react';
import { ProjectStatusProvider } from '../contexts/ProjectStatusContext';
import { useProjectStatus } from '../hooks/useProjectStatus';
import type { IProjectStatusProps } from './IProjectStatusProps';
import { ProjectStatusCard } from './ProjectStatusCard';
import { ProjectStatusFilters } from './ProjectStatusFilters';
import { ProjectStatusHeader } from './ProjectStatusHeader';
import { ProjectStatusState } from './ProjectStatusState';
import styles from './ProjectStatus.module.scss';

export default function ProjectStatus(props: IProjectStatusProps): React.ReactElement {
  const controller = useProjectStatus({
    webUrl: props.webUrl,
    dataSourceType: props.dataSourceType,
    listTitleOrUrl: props.listTitleOrUrl,
    jsonUrl: props.jsonUrl,
    maxItems: props.maxItems,
    defaultStatusFilter: props.defaultStatusFilter,
    showOwner: props.showOwner
  });

  const { viewModel } = controller;

  return (
    <ProjectStatusProvider value={controller}>
      <section className={styles.projectStatus}>
        <ProjectStatusHeader title={props.title} subtitle={props.subtitle} />
        <ProjectStatusFilters />

        {viewModel.status === 'loading' ? (
          <ProjectStatusState
            status="loading"
            title="Cargando proyectos"
            message="Consultando la fuente configurada y normalizando el estado de cada iniciativa."
            onRetry={controller.refresh}
          />
        ) : viewModel.status === 'error' ? (
          <ProjectStatusState
            status="error"
            title="No se ha podido cargar el estado"
            message={viewModel.errorMessage ?? 'Revisa la fuente configurada e intenta de nuevo.'}
            onRetry={controller.refresh}
          />
        ) : viewModel.items.length === 0 ? (
          <ProjectStatusState
            status="empty"
            title="No hay proyectos visibles"
            message="No se han encontrado iniciativas en el estado seleccionado."
            onRetry={controller.refresh}
          />
        ) : (
          <>
            {viewModel.hasPartialData ? (
              <div className={styles.partialNotice} role="status">
                <Text variant="small">
                  Algunos elementos tienen metadatos incompletos. Se muestran igualmente para mantener contexto.
                </Text>
              </div>
            ) : null}

            <div className={styles.list}>
              {viewModel.items.map((item) => (
                <ProjectStatusCard key={item.id} item={item} showOwner={props.showOwner} />
              ))}
            </div>
          </>
        )}

        <p className={styles.footerNote}>
          El orden prioriza estados de mayor riesgo y después la fecha más cercana.
        </p>
      </section>
    </ProjectStatusProvider>
  );
}
