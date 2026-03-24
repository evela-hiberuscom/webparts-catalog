import * as React from 'react';
import { Icon, Text } from '@fluentui/react';
import { useProjectStatusContext } from '../contexts/ProjectStatusContext';
import styles from './ProjectStatus.module.scss';

export interface IProjectStatusHeaderProps {
  title: string;
  subtitle: string;
}

export function ProjectStatusHeader({
  title,
  subtitle
}: IProjectStatusHeaderProps): React.ReactElement {
  const { viewModel } = useProjectStatusContext();
  const partialText = viewModel.hasPartialData ? 'Datos parciales' : 'Datos completos';

  return (
    <header className={styles.header}>
      <div className={styles.titleBlock}>
        <Text variant="xxLarge" as="h2" className={styles.title}>
          {title}
        </Text>
        <div className={styles.accentLine} />
        <Text variant="medium" className={styles.subtitle}>
          {subtitle}
        </Text>
      </div>
      <div className={styles.summaryRow} aria-label="Resumen del estado de proyectos">
        <span className={styles.summaryChip}>
          <Icon iconName="Stack" className={styles.summaryChipIcon} />
          <span>{viewModel.totalCount} iniciativas</span>
        </span>
        <span className={styles.summaryChip}>
          <Icon iconName="Org" className={styles.summaryChipIcon} />
          <span>{viewModel.sourceLabel}</span>
        </span>
        <span className={styles.summaryChip}>
          <Icon iconName="Info" className={styles.summaryChipIcon} />
          <span>{partialText}</span>
        </span>
      </div>
    </header>
  );
}
