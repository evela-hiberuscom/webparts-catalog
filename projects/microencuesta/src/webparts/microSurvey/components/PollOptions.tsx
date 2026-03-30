import * as React from 'react';
import { ChoiceGroup, type IChoiceGroupOption } from '@fluentui/react';
import type { IPollQuestion } from '../models/pollModels';

interface IPollOptionsProps {
  question: IPollQuestion;
  selectedOption?: string;
  disabled: boolean;
  label: string;
  onChange(optionId: string): void;
}

export function PollOptions(props: IPollOptionsProps): React.ReactElement {
  const options: IChoiceGroupOption[] = props.question.options.map((option) => ({
    key: option.label,
    text: option.label
  }));

  return (
    <ChoiceGroup
      className="microSurveyChoiceGroup"
      label={props.label}
      options={options}
      selectedKey={props.selectedOption}
      disabled={props.disabled}
      onChange={(_event, option) => {
        if (option) {
          props.onChange(option.key);
        }
      }}
    />
  );
}
