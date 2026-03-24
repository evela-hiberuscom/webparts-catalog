import * as React from 'react';
import * as strings from 'AudienceQuickLinksWebPartStrings';

import type { IAudienceQuickLinksProps } from './IAudienceQuickLinksProps';
import { useAudienceQuickLinks } from '../hooks/useAudienceQuickLinks';
import { AudienceQuickLinksView } from './AudienceQuickLinksView';
import styles from './AudienceQuickLinks.module.scss';

export default function AudienceQuickLinks(props: IAudienceQuickLinksProps): React.ReactElement {
  const { viewModel, reload, setSelectedCategory } = useAudienceQuickLinks({
    webPartProps: props.webPartProps,
    hostContext: props.hostContext,
    labels: {
      allCategoriesLabel: strings.AllCategoriesLabel,
      defaultWebPartTitle: strings.DefaultWebPartTitle,
      loadingCatalogLabel: strings.LoadingCatalogLabel,
      loadingAudienceLabel: strings.LoadingAudienceLabel,
      noDataSourceLabel: strings.NoDataSourceLabel,
      couldNotResolveAudienceLabel: strings.CouldNotResolveAudienceLabel,
      audienceGeneralLabel: strings.AudienceGeneralLabel,
      audienceHybridPrefix: strings.AudienceHybridPrefix,
      audienceNamedPrefix: strings.AudienceNamedPrefix
    }
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
