import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useInternalServicesStatus, type IUseInternalServicesStatusResult } from './useInternalServicesStatus';
import type { IInternalServicesStatusService } from '../models/internalServicesStatusModels';

interface IProbeProps {
  service: IInternalServicesStatusService;
  onRender: (value: IUseInternalServicesStatusResult) => void;
  autoRefreshSeconds?: number;
}

function Probe(props: IProbeProps): React.ReactElement {
  const state = useInternalServicesStatus(props.service, {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'ServiceStatusList',
    showOnlyCritical: false,
    staleThresholdMinutes: 30,
    autoRefreshSeconds: props.autoRefreshSeconds ?? 0
  });

  React.useEffect(() => {
    props.onRender(state);
  }, [props, state]);

  return <></>;
}

describe('useInternalServicesStatus', () => {
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    container.remove();
  });

  it('transitions from loading to ready and exposes refresh', async () => {
    const loadSnapshot = jest.fn().mockResolvedValue({
      status: 'ready',
      items: [],
      hasPartialData: false,
      sourceCount: 1,
      staleCount: 0,
      lastUpdated: '2026-03-23T10:00:00.000Z'
    });
    const service: IInternalServicesStatusService = {
      loadSnapshot
    };

    let latestState: IUseInternalServicesStatusResult | undefined;

    await act(async () => {
      ReactDOM.render(
        <Probe
          service={service}
          onRender={(value) => {
            latestState = value;
          }}
        />,
        container
      );

      await Promise.resolve();
    });

    expect(loadSnapshot).toHaveBeenCalledTimes(1);
    expect(latestState?.status).toBe('ready');
    expect(latestState?.result?.sourceCount).toBe(1);

    await act(async () => {
      latestState?.refresh();
      await Promise.resolve();
    });

    expect(loadSnapshot).toHaveBeenCalledTimes(2);

    await act(async () => {
      ReactDOM.unmountComponentAtNode(container);
      await Promise.resolve();
    });
  });

  it('surfaces repository errors as error state', async () => {
    const service: IInternalServicesStatusService = {
      loadSnapshot: jest.fn().mockRejectedValue(new Error('Boom'))
    };

    let latestState: IUseInternalServicesStatusResult | undefined;

    await act(async () => {
      ReactDOM.render(
        <Probe
          service={service}
          onRender={(value) => {
            latestState = value;
          }}
        />,
        container
      );

      await Promise.resolve();
    });

    expect(latestState?.status).toBe('error');
    expect(latestState?.error).toBe('Boom');

    await act(async () => {
      ReactDOM.unmountComponentAtNode(container);
      await Promise.resolve();
    });
  });

  it('auto refreshes on the configured interval', async () => {
    jest.useFakeTimers();

    const loadSnapshot = jest.fn().mockResolvedValue({
      status: 'ready',
      items: [],
      hasPartialData: false,
      sourceCount: 1,
      staleCount: 0,
      lastUpdated: '2026-03-23T10:00:00.000Z'
    });
    const service: IInternalServicesStatusService = {
      loadSnapshot
    };

    await act(async () => {
      ReactDOM.render(
        <Probe
          service={service}
          autoRefreshSeconds={1}
          onRender={() => undefined}
        />,
        container
      );
      await Promise.resolve();
    });

    expect(loadSnapshot).toHaveBeenCalledTimes(1);

    await act(async () => {
      jest.advanceTimersByTime(1000);
      await Promise.resolve();
    });

    expect(loadSnapshot).toHaveBeenCalledTimes(2);

    await act(async () => {
      ReactDOM.unmountComponentAtNode(container);
      await Promise.resolve();
    });

    jest.useRealTimers();
  });
});
