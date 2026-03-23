import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import { useQuickBooking, type IUseQuickBookingResult } from '../hooks/useQuickBooking';
import * as repositoryModule from '../repositories/bookingResourcesRepository';
import type { IBookingResource, IQuickBookingContext, IQuickBookingWebPartProps } from '../models/quickBookingModels';

interface IHookHarnessProps {
  context: IQuickBookingContext;
  props: IQuickBookingWebPartProps;
  onRender: (result: IUseQuickBookingResult) => void;
}

function HookHarness(props: IHookHarnessProps): JSX.Element {
  const result = useQuickBooking(props.context, props.props);

  React.useEffect(() => {
    props.onRender(result);
  }, [props, result]);

  return <></>;
}

describe('useQuickBooking', () => {
  const createBookingResourcesRepositorySpy = jest.spyOn(repositoryModule, 'createBookingResourcesRepository');

  const context: IQuickBookingContext = {
    webUrl: 'https://contoso.sharepoint.com/sites/operations'
  };

  const baseProps: IQuickBookingWebPartProps = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: '',
    showAvailability: true,
    defaultCategory: 'Todos',
    resourcesJson: '',
    openInNewTab: true
  };
  let container: HTMLDivElement;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    document.body.removeChild(container);
    createBookingResourcesRepositorySpy.mockReset();
  });

  function unmountHarness(): void {
    ReactDOM.unmountComponentAtNode(container);
  }

  it('loads resources, exposes loading and updates the selected site', async () => {
    const resources: IBookingResource[] = [
      { id: 'room-1', name: 'Sala 1', category: 'Sala', site: 'Madrid', bookingUrl: '/room-1', availability: 'available', rules: undefined, featured: false, priority: 1 },
      { id: 'room-2', name: 'Sala 2', category: 'Sala', site: 'Barcelona', bookingUrl: '/room-2', availability: 'busy', rules: undefined, featured: false, priority: 2 }
    ];
    const getResources = jest.fn().mockResolvedValue(resources);
    createBookingResourcesRepositorySpy.mockReturnValue({ getResources } as never);

    const statuses: string[] = [];
    let latestResult: IUseQuickBookingResult | undefined;

    await act(async () => {
      ReactDOM.render(
        <HookHarness
          context={context}
          props={baseProps}
          onRender={(result) => {
            latestResult = result;
            statuses.push(result.model.status);
          }}
        />,
        container
      );

      await Promise.resolve();
    });

    expect(statuses[0]).toBe('loading');
    expect(statuses[statuses.length - 1]).toBe('ready');
    expect(latestResult?.model.visibleResources).toHaveLength(2);

    await act(async () => {
      latestResult?.setSelectedSite('Madrid');
      await Promise.resolve();
    });

    expect(latestResult?.model.selectedSite).toBe('Madrid');
    expect(latestResult?.model.visibleResources).toHaveLength(1);

    await act(async () => {
      unmountHarness();
      await Promise.resolve();
    });
  });

  it('exposes an error state when the repository fails', async () => {
    createBookingResourcesRepositorySpy.mockReturnValue({
      getResources: jest.fn().mockRejectedValue(new Error('Boom'))
    } as never);

    let latestResult: IUseQuickBookingResult | undefined;

    await act(async () => {
      ReactDOM.render(
        <HookHarness
          context={context}
          props={baseProps}
          onRender={(result) => {
            latestResult = result;
          }}
        />,
        container
      );

      await Promise.resolve();
    });

    expect(latestResult?.model.status).toBe('error');
    expect(latestResult?.model.errorMessage).toBe('Boom');

    await act(async () => {
      unmountHarness();
      await Promise.resolve();
    });
  });
});
