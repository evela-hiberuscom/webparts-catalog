jest.mock('../services/audienceQuickLinksService', () => ({
  AudienceQuickLinksService: jest.fn()
}));

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type { IAudienceQuickLinksHostContext, IAudienceQuickLinksViewModel, IAudienceQuickLinksWebPartProps } from '../models/audienceLinkModels';
import { AudienceQuickLinksService } from '../services/audienceQuickLinksService';
import { useAudienceQuickLinks } from './useAudienceQuickLinks';

type HookResult = ReturnType<typeof useAudienceQuickLinks>;

const hostContext: IAudienceQuickLinksHostContext = {
  spHttpClient: {} as never,
  webUrl: 'https://contoso.sharepoint.com/sites/intranet',
  siteUrl: 'https://contoso.sharepoint.com/sites/intranet',
  userDisplayName: 'Ada Lovelace',
  userEmail: 'ada@contoso.com',
  userLoginName: 'i:0#.f|membership|ada@contoso.com',
  localeName: 'es-ES'
};

const baseProps: IAudienceQuickLinksWebPartProps = {
  title: 'Accesos rápidos por audiencia',
  description: 'Descripción',
  dataSourceType: 'StaticConfig',
  listTitleOrUrl: '',
  audienceMode: 'group',
  defaultCategory: 'General',
  maxItems: 12,
  showAudienceHint: true
};

function HookHarness(props: {
  input: {
    webPartProps: IAudienceQuickLinksWebPartProps;
    hostContext: IAudienceQuickLinksHostContext;
  };
  onChange: (result: HookResult) => void;
}): React.ReactElement {
  const result = useAudienceQuickLinks(props.input);

  React.useEffect(() => {
    props.onChange(result);
  }, [props.onChange, result]);

  return <></>;
}

describe('useAudienceQuickLinks', () => {
  const serviceFactory = AudienceQuickLinksService as unknown as jest.Mock;
  let container: HTMLDivElement;
  let latestResult: HookResult | undefined;
  let loadMock: jest.Mock;

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
    latestResult = undefined;
    loadMock = jest.fn();
    serviceFactory.mockImplementation(() => ({
      load: loadMock
    }));
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  async function renderAndFlush(input: IAudienceQuickLinksWebPartProps): Promise<void> {
    await act(async () => {
      ReactDOM.render(
        <HookHarness
          input={{
            webPartProps: input,
            hostContext
          }}
          onChange={(result) => {
            latestResult = result;
          }}
        />,
        container
      );

      await Promise.resolve();
    });
  }

  it('updates the state to empty when a category filter removes every visible item', async () => {
    loadMock.mockResolvedValue({
      title: 'Accesos rápidos por audiencia',
      description: 'Descripción',
      sourceLabel: 'Catálogo de prueba',
      resolvedAudienceLabel: 'Audiencia group: sales',
      resolvedAudienceTokens: ['sales'],
      categories: ['Todas', 'General', 'Comercial'],
      selectedCategory: 'Todas',
      allItems: [
        {
          id: 'general',
          title: 'Portal general',
          category: 'General',
          iconName: 'Home',
          description: 'Acceso común',
          openUrl: '/sites/intranet',
          audiences: [],
          isGeneric: true,
          priority: 1,
          sourceBadge: 'genérico'
        }
      ],
      visibleItems: [
        {
          id: 'general',
          title: 'Portal general',
          category: 'General',
          iconName: 'Home',
          description: 'Acceso común',
          openUrl: '/sites/intranet',
          audiences: [],
          isGeneric: true,
          priority: 1,
          sourceBadge: 'genérico'
        }
      ],
      hasPartialData: false,
      state: 'ready',
      notes: []
    } as IAudienceQuickLinksViewModel);

    await renderAndFlush(baseProps);

    expect(latestResult?.viewModel?.state).toBe('ready');
    expect(latestResult?.viewModel?.visibleItems).toHaveLength(1);

    await act(async () => {
      latestResult?.setSelectedCategory('Comercial');
      await Promise.resolve();
    });

    expect(latestResult?.viewModel?.selectedCategory).toBe('Comercial');
    expect(latestResult?.viewModel?.visibleItems).toHaveLength(0);
    expect(latestResult?.viewModel?.state).toBe('empty');
  });

  it('exposes an error state when the service rejects', async () => {
    loadMock.mockRejectedValue(new Error('feed failure'));

    await renderAndFlush(baseProps);

    expect(latestResult?.viewModel?.state).toBe('error');
    expect(latestResult?.viewModel?.notes[0]).toContain('feed failure');
  });
});
