import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';

import { MeetTheTeamView } from './MeetTheTeamView';
import type { ITeamMembersViewModel } from '../models/teamMemberModels';

describe('MeetTheTeamView', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders ready state cards', async () => {
    const viewModel: ITeamMembersViewModel = {
      title: 'Conoce al equipo',
      description: 'Descripción',
      sourceLabel: 'StaticConfig',
      state: 'ready',
      hasPartialData: false,
      notes: [],
      items: [
        {
          id: '1',
          displayName: 'Laura Pérez',
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

    await act(async () => {
      ReactDom.render(
        <MeetTheTeamView viewModel={viewModel} onRetry={() => undefined} isDarkTheme={false} userDisplayName="Ana" />,
        container
      );
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Laura Pérez');
    expect(container.textContent).toContain('Ver perfil');
  });

  it('renders the empty state message', async () => {
    const viewModel: ITeamMembersViewModel = {
      title: 'Conoce al equipo',
      description: 'Descripción',
      sourceLabel: 'StaticConfig',
      state: 'empty',
      hasPartialData: false,
      notes: [],
      items: []
    };

    await act(async () => {
      ReactDom.render(
        <MeetTheTeamView viewModel={viewModel} onRetry={() => undefined} isDarkTheme={false} userDisplayName="Ana" />,
        container
      );
      await Promise.resolve();
    });

    expect(container.textContent).toContain('No hay miembros del equipo configurados.');
  });
});
