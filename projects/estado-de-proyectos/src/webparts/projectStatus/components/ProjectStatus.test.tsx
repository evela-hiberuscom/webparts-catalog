import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { initializeIcons } from '@fluentui/react';

import ProjectStatus from './ProjectStatus';
import * as repositoryFactory from '../repositories/createProjectsRepository';

const createProjectsRepositorySpy = jest.spyOn(repositoryFactory, 'createProjectsRepository');

describe('ProjectStatus', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    initializeIcons();
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    createProjectsRepositorySpy.mockReset();
  });

  it('renders the overview and a partial-data notice', async () => {
    createProjectsRepositorySpy.mockReturnValue({
      loadProjects: jest.fn(async () => [
        {
          id: 'a',
          title: 'Proyecto A',
          status: 'amber',
          owner: 'Equipo 1',
          relevantDate: '2026-03-28',
          openUrl: 'https://contoso.sharepoint.com/sites/demo/a'
        },
        {
          id: 'b',
          title: 'Proyecto B',
          status: 'red',
          owner: 'Equipo 2',
          relevantDate: undefined,
          openUrl: 'https://contoso.sharepoint.com/sites/demo/b'
        }
      ]),
      getSourceLabel: () => 'Configuración estática'
    } as never);

    await act(async () => {
      ReactDOM.render(
        <ProjectStatus
          webUrl="https://contoso.sharepoint.com/sites/demo"
          title="Estado de proyectos"
          subtitle="Seguimiento compacto"
          dataSourceType="StaticConfig"
          listTitleOrUrl="ProjectsList"
          jsonUrl=""
          maxItems={8}
          defaultStatusFilter="all"
          showOwner={true}
        />,
        container
      );

      await Promise.resolve();
    });

    expect(container.textContent).toContain('Estado de proyectos');
    expect(container.textContent).toContain('Configuración estática');
    expect(container.textContent).toContain('Proyecto B');
    expect(container.textContent).toContain('Datos parciales');
  });

  it('renders an error state when the source fails', async () => {
    createProjectsRepositorySpy.mockReturnValue({
      loadProjects: jest.fn(async () => {
        throw new Error('JsonUrl source returned malformed JSON: Unexpected token');
      }),
      getSourceLabel: () => 'JSON: /sites/demo/projects.json'
    } as never);

    await act(async () => {
      ReactDOM.render(
        <ProjectStatus
          webUrl="https://contoso.sharepoint.com/sites/demo"
          title="Estado de proyectos"
          subtitle="Seguimiento compacto"
          dataSourceType="JsonUrl"
          listTitleOrUrl="ProjectsList"
          jsonUrl="/sites/demo/projects.json"
          maxItems={8}
          defaultStatusFilter="all"
          showOwner={true}
        />,
        container
      );

      await Promise.resolve();
    });

    expect(container.textContent).toContain('No se ha podido cargar el estado');
    expect(container.textContent).toContain('malformed JSON');
  });
});
