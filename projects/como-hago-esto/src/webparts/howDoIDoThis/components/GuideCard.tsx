import * as React from 'react';
import { DefaultButton, Link, Text } from '@fluentui/react';
import { escape } from '@microsoft/sp-lodash-subset';
import * as strings from 'HowDoIDoThisWebPartStrings';
import type { IGuideItem } from '../models/howDoIDoThisModels';
import { GuideSteps } from './GuideSteps';
import styles from './HowDoIDoThis.module.scss';

export interface IGuideCardProps {
  guide: IGuideItem;
}

export function GuideCard(props: IGuideCardProps): React.ReactElement<IGuideCardProps> {
  const [isExpanded, setIsExpanded] = React.useState<boolean>(false);
  const hasSteps = props.guide.steps.length > 0;

  return (
    <article className={styles.guideCard}>
      <div className={styles.guideHeader}>
        <div>
          <Text variant="large" className={styles.guideTitle}>
            {escape(props.guide.title)}
          </Text>
          <Text variant="small" className={styles.guideCategory}>
            {escape(props.guide.category)}
          </Text>
        </div>
        <div className={styles.guideBadges}>
          {props.guide.featured ? <span className={styles.guideBadge}>{strings.FeaturedBadgeLabel}</span> : null}
          {props.guide.isPartial ? <span className={styles.guideBadge}>{strings.PartialBadgeLabel}</span> : null}
        </div>
      </div>

      <Text variant="medium" className={styles.guideSummary}>
        {escape(props.guide.summary)}
      </Text>

      <div className={styles.guideMeta}>
        {hasSteps ? (
          <DefaultButton
            text={isExpanded ? strings.CollapseLabel : strings.ExpandLabel}
            onClick={() => setIsExpanded((current) => !current)}
            aria-expanded={isExpanded}
          />
        ) : <span />}
        {props.guide.relatedUrl ? (
          <Link href={props.guide.relatedUrl} target="_blank" rel="noreferrer">
            {strings.RelatedLinkLabel}
          </Link>
        ) : null}
      </div>

      {hasSteps && isExpanded ? <GuideSteps steps={props.guide.steps} /> : null}
    </article>
  );
}
