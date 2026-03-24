import * as React from 'react';
import type { IProfileBasedComponentProps } from './IProfileBasedComponentProps';
import { useProfileBasedComponent } from '../hooks/useProfileBasedComponent';
import ProfileBasedComponentView from './ProfileBasedComponentView';

export default function ProfileBasedComponent(props: IProfileBasedComponentProps): JSX.Element {
  const { viewModel, reload } = useProfileBasedComponent(props);

  return <ProfileBasedComponentView props={props} viewModel={viewModel} onRetry={reload} />;
}
