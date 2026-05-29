/* eslint-disable @rushstack/pair-react-dom-render-unmount */
import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import { initializeIcons } from '@fluentui/react/lib/Icons';

import { MeetTheTeamView } from './MeetTheTeamView';
import type { ITeamMembersViewModel } from '../models/teamMemberModels';

initializeIcons();

describe('MeetTheTeamView', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    act(() => {
      ReactDOM.unmountComponentAtNode(container);
    });
    container.remove();
  });

  it('renders ready state cards', () => {
    const viewModel: ITeamMembersViewModel = {
      title: 'Conoce al equipo',
      description: 'Descripcion',
      sourceLabel: 'StaticConfig',
      state: 'ready',
      hasPartialData: false,
      notes: [],
      items: [
        {
          id: '1',
          displayName: 'Laura Perez',
          jobTitle: 'Product Manager',
          bio: 'Bio',
          photoUrl: '/img.jpg',
          profileUrl: '/profile',
          sortOrder: 1,
          initials: 'LP',
          partialData: false
        }
      ]
    };

    act(() => {
      ReactDOM.render(
        <MeetTheTeamView viewModel={viewModel} onRetry={() => undefined} isDarkTheme={false} userDisplayName="Ana" />,
        container
      );
    });

    expect(container.textContent).toContain('Laura Perez');
    expect(container.textContent).toContain('Ver perfil');
  });

  it('renders the empty state message', () => {
    const viewModel: ITeamMembersViewModel = {
      title: 'Conoce al equipo',
      description: 'Descripcion',
      sourceLabel: 'StaticConfig',
      state: 'empty',
      hasPartialData: false,
      notes: [],
      items: []
    };

    act(() => {
      ReactDOM.render(
        <MeetTheTeamView viewModel={viewModel} onRetry={() => undefined} isDarkTheme={false} userDisplayName="Ana" />,
        container
      );
    });

    expect(container.textContent).toContain('Estado: empty');
    expect(container.textContent).toContain('Reintentar');
  });
});
