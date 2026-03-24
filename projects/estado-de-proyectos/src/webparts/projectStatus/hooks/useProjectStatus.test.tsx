import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { IProjectStatusRequest, IProjectStatusViewModel, ProjectStatusFilter } from '../models/projectStatusTypes';
import { useProjectStatus } from './useProjectStatus';
import * as repositoryFactory from '../repositories/createProjectsRepository';

const createProjectsRepositorySpy = jest.spyOn(repositoryFactory, 'createProjectsRepository');

describe('useProjectStatus', () => {
  let container: HTMLDivElement;

  const request: IProjectStatusRequest = {
    webUrl: 'https://contoso.sharepoint.com/sites/demo',
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'ProjectsList',
    maxItems: 8,
    defaultStatusFilter: 'all',
    showOwner: true
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
    createProjectsRepositorySpy.mockReset();
  });

  it('loads items and applies filters locally', async () => {
    const repository = {
      loadProjects: jest.fn(async () => [
        {
          id: 'a',
          title: 'Proyecto A',
          status: 'red',
          owner: 'Equipo 1',
          relevantDate: '2026-03-28',
          openUrl: 'https://contoso.sharepoint.com/sites/demo/a'
        },
        {
          id: 'b',
          title: 'Proyecto B',
          status: 'green',
          owner: 'Equipo 2',
          relevantDate: '2026-03-30',
          openUrl: 'https://contoso.sharepoint.com/sites/demo/b'
        }
      ]),
      getSourceLabel: () => 'StaticConfig'
    };

    createProjectsRepositorySpy.mockReturnValue(repository as never);

    let latestResult: IProjectStatusViewModel | undefined;
    let latestStatus = '';
    let latestSetFilter: (filter: ProjectStatusFilter) => void = () => undefined;
    let latestRefresh: () => void = () => undefined;

    function Probe(): React.ReactElement | null {
      const controller = useProjectStatus(request);
      latestResult = controller.viewModel;
      latestStatus = controller.viewModel.status;
      latestSetFilter = controller.setStatusFilter;
      latestRefresh = controller.refresh;
      return null;
    }

    await act(async () => {
      ReactDOM.render(<Probe />, container);
      await Promise.resolve();
    });

    expect(latestStatus).toBe('ready');
    expect(latestResult?.items).toHaveLength(2);

    await act(async () => {
      latestSetFilter('green');
      await Promise.resolve();
    });

    expect(latestResult?.items).toHaveLength(1);
    expect(latestResult?.items[0]?.title).toBe('Proyecto B');

    await act(async () => {
      latestRefresh();
      await Promise.resolve();
    });

    expect(repository.loadProjects).toHaveBeenCalledTimes(2);
  });

  it('enters error state when the repository rejects', async () => {
    const repository = {
      loadProjects: jest.fn(async () => {
        throw new Error('JsonUrl source returned malformed JSON: Unexpected token');
      }),
      getSourceLabel: () => 'JSON: /sites/demo/projects.json'
    };

    createProjectsRepositorySpy.mockReturnValue(repository as never);

    let latestResult: IProjectStatusViewModel | undefined;

    function Probe(): React.ReactElement | null {
      const controller = useProjectStatus({
        ...request,
        dataSourceType: 'JsonUrl',
        jsonUrl: '/sites/demo/projects.json'
      });
      latestResult = controller.viewModel;
      return null;
    }

    await act(async () => {
      ReactDOM.render(<Probe />, container);
      await Promise.resolve();
    });

    expect(latestResult?.status).toBe('error');
    expect(latestResult?.errorMessage).toContain('malformed JSON');
  });
});
