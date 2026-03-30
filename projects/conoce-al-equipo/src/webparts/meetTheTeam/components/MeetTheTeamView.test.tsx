import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

import { initializeIcons } from '@fluentui/react/lib/Icons';

import { MeetTheTeamView } from './MeetTheTeamView';
import type { ITeamMembersViewModel } from '../models/teamMemberModels';

initializeIcons();

describe('MeetTheTeamView', () => {
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

    const markup = renderToStaticMarkup(
      <MeetTheTeamView viewModel={viewModel} onRetry={() => undefined} isDarkTheme={false} userDisplayName="Ana" />
    );

    expect(markup).toContain('Laura Perez');
    expect(markup).toContain('Ver perfil');
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

    const markup = renderToStaticMarkup(
      <MeetTheTeamView viewModel={viewModel} onRetry={() => undefined} isDarkTheme={false} userDisplayName="Ana" />
    );

    expect(markup).toContain('Estado: empty');
    expect(markup).toContain('Reintentar');
  });
});
