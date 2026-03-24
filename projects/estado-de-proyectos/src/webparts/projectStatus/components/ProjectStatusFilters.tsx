import * as React from 'react';
import { Dropdown, type IDropdownOption, PrimaryButton } from '@fluentui/react';
import { useProjectStatusContext } from '../contexts/ProjectStatusContext';
import type { ProjectStatusFilter, ProjectStatusValue } from '../models/projectStatusTypes';
import styles from './ProjectStatus.module.scss';

const FILTER_LABELS: Record<ProjectStatusFilter, string> = {
  all: 'Todos',
  red: 'Rojo',
  amber: 'Ámbar',
  green: 'Verde',
  unknown: 'Desconocido'
};

function isProjectStatusValue(value: ProjectStatusFilter): value is ProjectStatusValue {
  return value !== 'all';
}

function toOption(filter: ProjectStatusFilter): IDropdownOption {
  return {
    key: filter,
    text: FILTER_LABELS[filter]
  };
}

export function ProjectStatusFilters(): React.ReactElement {
  const { viewModel, refresh, setStatusFilter } = useProjectStatusContext();

  const options = viewModel.availableFilters.map(toOption);
  const selectedKey = viewModel.selectedFilter;

  return (
    <div className={styles.filtersBar}>
      <div className={styles.filtersField}>
        <Dropdown
          label="Filtrar por estado"
          selectedKey={selectedKey}
          options={options}
          onChange={(_, option) => {
            if (!option) {
              return;
            }

            const key = option.key as ProjectStatusFilter;
            setStatusFilter(isProjectStatusValue(key) || key === 'all' ? key : 'all');
          }}
        />
      </div>
      <div className={styles.filtersActions}>
        <PrimaryButton text="Actualizar" onClick={refresh} />
      </div>
    </div>
  );
}
