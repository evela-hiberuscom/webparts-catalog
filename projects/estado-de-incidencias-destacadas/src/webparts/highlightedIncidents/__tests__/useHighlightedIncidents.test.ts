/* eslint-disable @rushstack/pair-react-dom-render-unmount */

jest.mock('../repositories/highlightedIncidentsRepository', () => ({
  createHighlightedIncidentsRepository: jest.fn(() => ({ repositoryName: 'mock-repository' }))
}));

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { createHighlightedIncidentsRepository } from '../repositories/highlightedIncidentsRepository';
import { useHighlightedIncidents, type IUseHighlightedIncidentsResult } from '../hooks/useHighlightedIncidents';
import { HighlightedIncidentsService } from '../services/highlightedIncidentsService';
import type { IHighlightedIncidentsRequest } from '../models/highlightedIncidentModels';

function flushEffects(): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, 0);
  });
}

describe('useHighlightedIncidents', () => {
  const request: IHighlightedIncidentsRequest = {
    title: 'Estado de incidencias destacadas',
    subtitle: 'Seguimiento compacto',
    webUrl: 'https://contoso.sharepoint.com/sites/portal',
    dataSourceType: 'SharePointList',
    listTitleOrUrl: 'IncidentsList',
    showResolved: false,
    maxItems: 5
  };

  let container: HTMLDivElement;
  let latestResult: IUseHighlightedIncidentsResult | undefined;

  function Harness(props: { currentRequest: IHighlightedIncidentsRequest }): React.ReactElement {
    latestResult = useHighlightedIncidents(props.currentRequest);
    return React.createElement('div', { 'data-status': latestResult.status }, latestResult.status);
  }

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    latestResult = undefined;
  });

  afterEach(() => {
    if (container.parentNode) {
      ReactDOM.unmountComponentAtNode(container);
    }
    document.body.removeChild(container);
    jest.restoreAllMocks();
  });

  it('transitions from loading to ready using the real effect flow', async () => {
    const loadOverviewMock = jest.spyOn(HighlightedIncidentsService.prototype, 'loadOverview').mockResolvedValue({
      status: 'ready',
      items: [],
      hasPartialData: false,
      sourceCount: 1,
      activeCount: 0,
      monitoringCount: 0,
      resolvedCount: 0,
      hiddenResolvedCount: 0
    });

    await act(async () => {
      ReactDOM.render(React.createElement(Harness, { currentRequest: request }), container);
      await flushEffects();
    });

    expect(createHighlightedIncidentsRepository).toHaveBeenCalledWith({ webUrl: request.webUrl }, request.dataSourceType);
    expect(loadOverviewMock).toHaveBeenCalledWith(request);
    expect(latestResult?.status).toBe('ready');
    expect(latestResult?.result?.sourceCount).toBe(1);

    ReactDOM.unmountComponentAtNode(container);
  });

  it('surfaces repository or payload errors as error state', async () => {
    jest.spyOn(HighlightedIncidentsService.prototype, 'loadOverview').mockRejectedValue(new Error('Payload inesperado'));

    await act(async () => {
      ReactDOM.render(React.createElement(Harness, { currentRequest: request }), container);
      await flushEffects();
    });

    expect(latestResult?.status).toBe('error');
    expect(latestResult?.error).toBe('Payload inesperado');

    ReactDOM.unmountComponentAtNode(container);
  });

  it('refreshes and triggers a second load', async () => {
    const loadOverviewMock = jest
      .spyOn(HighlightedIncidentsService.prototype, 'loadOverview')
      .mockResolvedValue({
        status: 'ready',
        items: [],
        hasPartialData: false,
        sourceCount: 1,
        activeCount: 0,
        monitoringCount: 0,
        resolvedCount: 0,
        hiddenResolvedCount: 0
      });

    await act(async () => {
      ReactDOM.render(React.createElement(Harness, { currentRequest: request }), container);
      await flushEffects();
    });

    await act(async () => {
      latestResult?.refresh();
      await flushEffects();
    });

    expect(loadOverviewMock).toHaveBeenCalledTimes(2);
    expect(latestResult?.status).toBe('ready');

    ReactDOM.unmountComponentAtNode(container);
  });
});
