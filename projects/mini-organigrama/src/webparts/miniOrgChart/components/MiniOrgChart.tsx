import * as React from 'react';
import { MessageBar, MessageBarType, Stack, Text } from '@fluentui/react';
import * as strings from 'MiniOrgChartWebPartStrings';
import type { IMiniOrgChartProps } from './IMiniOrgChartProps';
import styles from './MiniOrgChart.module.scss';
import { useMiniOrgChart } from '../hooks/useMiniOrgChart';
import { buildOrgTree, buildViewModel, normalizeText, resolveViewMode, sanitizeMaxDepth } from '../utils/miniOrgChartUtils';
import { PeopleFilters } from './PeopleFilters';
import { PeopleSearchBar } from './PeopleSearchBar';
import { OrgNodeCard } from './OrgNodeCard';
import type { IOrgTreeNode } from '../models/miniOrgChartModels';

function renderTree(node: IOrgTreeNode | undefined, mode: 'managerWithReports' | 'chain' | 'smallTree'): React.ReactNode {
  if (!node) {
    return null;
  }

  if (mode === 'chain') {
    return (
      <ol className={styles.chainList}>
        <li>
          <OrgNodeCard person={node.person} isRoot={true} />
        </li>
        {node.children.map((child) => (
          <li key={child.person.id}>
            <OrgNodeCard person={child.person} />
          </li>
        ))}
      </ol>
    );
  }

  return (
    <div className={mode === 'smallTree' ? styles.compactTree : styles.treeGrid}>
      <OrgNodeCard person={node.person} isRoot={true} />
      <div className={styles.childrenGrid}>
        {node.children.map((child) => (
          <OrgNodeCard key={child.person.id} person={child.person} />
        ))}
      </div>
    </div>
  );
}

export default function MiniOrgChart(props: IMiniOrgChartProps): React.ReactElement<IMiniOrgChartProps> {
  const [query, setQuery] = React.useState<string>('');
  const [viewMode, setViewMode] = React.useState(resolveViewMode(props.config.viewMode));
  const [maxDepth, setMaxDepth] = React.useState<number>(sanitizeMaxDepth(props.config.maxDepth));
  const { isLoading, loadResult, reload } = useMiniOrgChart(props.context, {
    ...props.config,
    viewMode,
    maxDepth
  });

  const viewModel = React.useMemo(
    () => buildViewModel(loadResult, buildOrgTree(loadResult.people, props.config.rootPersonId, maxDepth), query),
    [loadResult, props.config.rootPersonId, maxDepth, query]
  );

  const normalizedTitle = normalizeText(props.title) || strings.Title;

  return (
    <section className={styles.root} aria-busy={isLoading}>
      <header className={styles.header}>
        <Stack tokens={{ childrenGap: 8 }}>
          <Text variant="xLarge" block={true}>{normalizedTitle}</Text>
          {props.description ? (
            <Text variant="medium" block={true} className={styles.subtitle}>
              {props.description}
            </Text>
          ) : null}
          <Text variant="small" block={true} className={styles.meta}>{props.environmentMessage}</Text>
        </Stack>
      </header>

      <Stack tokens={{ childrenGap: 12 }}>
        <PeopleSearchBar value={query} onChange={setQuery} />
        <PeopleFilters
          viewMode={viewMode}
          maxDepth={maxDepth}
          onViewModeChange={setViewMode}
          onMaxDepthChange={setMaxDepth}
        />
      </Stack>

      {viewModel.state === 'error' ? (
        <MessageBar messageBarType={MessageBarType.error} isMultiline={true}>
          <strong>{strings.ErrorTitle}</strong> {strings.ErrorMessage}
        </MessageBar>
      ) : null}

      {viewModel.state === 'partialData' ? (
        <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
          <strong>{strings.PartialDataTitle}</strong> {strings.PartialDataMessage}
        </MessageBar>
      ) : null}

      {!viewModel.flatPeople.length && !isLoading ? (
        <MessageBar messageBarType={MessageBarType.info} isMultiline={true}>
          <strong>{query ? strings.NoMatchesTitle : strings.EmptyTitle}</strong>{' '}
          {query ? strings.NoMatchesMessage : strings.EmptyMessage}
        </MessageBar>
      ) : null}

      {viewModel.partialReasons.length ? (
        <details className={styles.details}>
          <summary>{strings.PartialDataTitle}</summary>
          <ul>
            {viewModel.partialReasons.map((reason) => (
              <li key={reason}>{reason}</li>
            ))}
          </ul>
        </details>
      ) : null}

      <div className={styles.summary}>
        <Text variant="small">{strings.ResultsCountLabel}: {viewModel.filteredCount}/{viewModel.totalCount}</Text>
        <Text variant="small">{strings.ViewModeFieldLabel}: {viewMode}</Text>
        <Text variant="small">{strings.MaxDepthFieldLabel}: {maxDepth}</Text>
        <button type="button" className={styles.reloadButton} onClick={reload}>
          {strings.ReloadLabel}
        </button>
      </div>

      <section className={styles.tree} aria-label={strings.Title}>
        {renderTree(viewModel.root, viewMode)}
      </section>
    </section>
  );
}
