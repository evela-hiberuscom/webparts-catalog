import * as React from 'react';

import type { IAudienceQuickLinksProps } from './IAudienceQuickLinksProps';
import { useAudienceQuickLinks } from '../hooks/useAudienceQuickLinks';
import { AudienceQuickLinksView } from './AudienceQuickLinksView';
import styles from './AudienceQuickLinks.module.scss';

export default function AudienceQuickLinks(props: IAudienceQuickLinksProps): React.ReactElement {
  const { viewModel, reload, setSelectedCategory } = useAudienceQuickLinks({
    webPartProps: props.webPartProps,
    hostContext: props.hostContext
  });

  const rootClassName = `${styles.container} ${props.hasTeamsContext ? styles.teams : ''} ${
    props.isDarkTheme ? styles.darkTheme : styles.lightTheme
  }`;

  if (!viewModel) {
    return <div className={rootClassName} />;
  }

  return (
    <div className={rootClassName}>
      <AudienceQuickLinksView
        viewModel={viewModel}
        hostContext={props.hostContext}
        showAudienceHint={props.webPartProps.showAudienceHint}
        onRetry={reload}
        onSelectCategory={setSelectedCategory}
      />
    </div>
  );
}
