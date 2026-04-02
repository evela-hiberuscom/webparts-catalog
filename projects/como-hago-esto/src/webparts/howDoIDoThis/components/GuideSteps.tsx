import * as React from 'react';
import { Text } from '@fluentui/react';
import { escape } from '@microsoft/sp-lodash-subset';
import * as strings from 'HowDoIDoThisWebPartStrings';
import styles from './HowDoIDoThis.module.scss';

export interface IGuideStepsProps {
  steps: string[];
}

export function GuideSteps(props: IGuideStepsProps): React.ReactElement<IGuideStepsProps> {
  return (
    <div className={styles.stepsBlock}>
      <Text variant="mediumPlus" className={styles.stepsHeading}>
        {strings.StepsHeading}
      </Text>
      <ol className={styles.stepsList}>
        {props.steps.map((step, index) => (
          <li key={`${index}-${step}`}>{escape(step)}</li>
        ))}
      </ol>
    </div>
  );
}
