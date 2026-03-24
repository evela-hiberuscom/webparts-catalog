import { CountdownService } from './countdownService';

describe('CountdownService', () => {
  const webUrl = 'https://contoso.sharepoint.com/sites/portal';

  it('builds a countdown ready view model', () => {
    const repository = {
      load: jest.fn()
    };
    const service = new CountdownService(repository as never);
    const now = new Date('2026-03-24T09:00:00Z');

    const viewModel = service.buildViewModel(
      {
        item: {
          title: 'Lanzamiento Q2',
          targetDate: '2026-03-25T11:12:00Z',
          subtitle: 'Campaña Q2',
          detailUrl: 'https://contoso.sharepoint.com/sites/portal/SitePages/evento.aspx',
          state: 'unknown',
          showCompleted: true,
          hasPartialData: false
        },
        sourceLabel: 'Configuración estática',
        hasPartialData: false,
        notes: []
      },
      {
        sourceType: 'StaticConfig',
        eventTitle: 'Lanzamiento Q2',
        targetDate: '2026-03-25T11:12:00Z',
        subtitle: 'Campaña Q2',
        detailUrl: 'https://contoso.sharepoint.com/sites/portal/SitePages/evento.aspx',
        showCompleted: true,
        webUrl,
        refreshIntervalSeconds: 60
      },
      now
    );

    expect(viewModel.state).toBe('ready');
    expect(viewModel.phase).toBe('countdown');
    expect(viewModel.remaining?.days).toBe(1);
    expect(viewModel.ctaLink?.href).toContain('contoso.sharepoint.com');
  });

  it('marks partial data when subtitle or detailUrl is missing', () => {
    const service = new CountdownService({ load: jest.fn() } as never);
    const viewModel = service.buildViewModel(
      {
        item: {
          title: 'Lanzamiento Q2',
          targetDate: '2026-03-24T12:00:00Z',
          state: 'unknown',
          showCompleted: true,
          hasPartialData: true
        } as never,
        sourceLabel: 'Origen remoto',
        hasPartialData: true,
        notes: ['Faltan campos']
      },
      {
        sourceType: 'JsonUrl',
        eventTitle: 'Lanzamiento Q2',
        targetDate: '2026-03-24T12:00:00Z',
        showCompleted: true,
        jsonUrl: '/sites/portal/data/event.json',
        webUrl,
        refreshIntervalSeconds: 60
      },
      new Date('2026-03-24T09:00:00Z')
    );

    expect(viewModel.state).toBe('partialData');
    expect(viewModel.phase).toBe('live');
    expect(viewModel.hasPartialData).toBe(true);
  });

  it('returns empty when completed content is hidden', () => {
    const service = new CountdownService({ load: jest.fn() } as never);
    const viewModel = service.buildViewModel(
      {
        item: {
          title: 'Lanzamiento Q2',
          targetDate: '2026-03-23T12:00:00Z',
          state: 'unknown',
          showCompleted: false,
          hasPartialData: false
        } as never,
        sourceLabel: 'Configuración estática',
        hasPartialData: false,
        notes: []
      },
      {
        sourceType: 'StaticConfig',
        eventTitle: 'Lanzamiento Q2',
        targetDate: '2026-03-23T12:00:00Z',
        showCompleted: false,
        webUrl,
        refreshIntervalSeconds: 60
      },
      new Date('2026-03-24T09:00:00Z')
    );

    expect(viewModel.state).toBe('empty');
    expect(viewModel.emptyReason).toContain('oculto por configuración');
  });

  it('returns error when the target date is invalid', () => {
    const service = new CountdownService({ load: jest.fn() } as never);
    const viewModel = service.buildViewModel(
      {
        item: {
          title: 'Lanzamiento Q2',
          targetDate: 'nope',
          state: 'unknown',
          showCompleted: true,
          hasPartialData: false
        } as never,
        sourceLabel: 'Configuración estática',
        hasPartialData: false,
        notes: []
      },
      {
        sourceType: 'StaticConfig',
        eventTitle: 'Lanzamiento Q2',
        targetDate: 'nope',
        showCompleted: true,
        webUrl,
        refreshIntervalSeconds: 60
      },
      new Date('2026-03-24T09:00:00Z')
    );

    expect(viewModel.state).toBe('error');
    expect(viewModel.errorMessage).toContain('No se ha podido interpretar la fecha objetivo.');
  });
});
