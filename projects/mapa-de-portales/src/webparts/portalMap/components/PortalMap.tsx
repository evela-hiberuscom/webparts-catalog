import * as React from 'react';
import { MessageBar, MessageBarType, Separator } from '@fluentui/react';
import * as strings from 'PortalMapWebPartStrings';
import { usePortalMap } from '../hooks/usePortalMap';
import styles from './PortalMap.module.scss';
import type { IPortalMapProps } from './IPortalMapProps';
import { PortalCards, PortalGroupedList, PortalTree } from './PortalTree';
import { PortalMapHeader } from './PortalMapHeader';
import { PortalStatePanel } from './PortalStatePanel';

export default function PortalMap(props: IPortalMapProps): React.ReactElement<IPortalMapProps> {
  const [selectedViewMode, setSelectedViewMode] = React.useState(props.viewMode);
  const snapshot = usePortalMap(
    {
      dataSourceType: props.dataSourceType,
      listTitleOrUrl: props.listTitleOrUrl,
      viewMode: props.viewMode,
      maxDepth: props.maxDepth,
      webUrl: props.webUrl
    },
    props.service
  );

  React.useEffect(() => {
    setSelectedViewMode(snapshot.resolvedViewMode);
  }, [snapshot.resolvedViewMode]);

  const sectionClassName = `${styles.portalMap} ${props.hasTeamsContext ? styles.teams : ''} ${
    props.isDarkTheme ? styles.darkTheme : ''
  }`;

  return (
    <section className={sectionClassName}>
      <PortalMapHeader
        selectedViewMode={selectedViewMode}
        onViewModeChange={setSelectedViewMode}
        sourceLabel={snapshot.sourceLabel}
        rootsCount={snapshot.roots.length}
        nodesCount={snapshot.flatItems.length}
      />

      {snapshot.state === 'loading' || snapshot.state === 'empty' || snapshot.state === 'error' ? (
        <PortalStatePanel state={snapshot.state} errorMessage={snapshot.errorMessage} />
      ) : (
        <div className={styles.surface}>
          {snapshot.state === 'partialData' ? (
            <MessageBar messageBarType={MessageBarType.warning} isMultiline={true}>
              <strong>{strings.PartialDataBanner}</strong>
              {snapshot.notes.length > 0 ? (
                <ul className={styles.noteList}>
                  {snapshot.notes.map((note) => (
                    <li key={note}>{note}</li>
                  ))}
                </ul>
              ) : undefined}
            </MessageBar>
          ) : undefined}

          <Separator>{strings.StructureSectionTitle}</Separator>

          {selectedViewMode === 'grouped' ? (
            <PortalGroupedList groups={snapshot.groupedItems} />
          ) : undefined}
          {selectedViewMode === 'cards' ? (
            <PortalCards items={snapshot.flatItems} />
          ) : undefined}
          {selectedViewMode === 'tree' ? (
            <PortalTree roots={snapshot.roots} />
          ) : undefined}
        </div>
      )}
    </section>
  );
}
