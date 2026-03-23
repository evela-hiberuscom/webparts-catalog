import * as React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import QuickBooking from '../components/QuickBooking';
import * as useQuickBookingModule from '../hooks/useQuickBooking';
import type { IQuickBookingProps } from '../components/IQuickBookingProps';
import type { IQuickBookingViewModel } from '../models/quickBookingModels';

function buildProps(): IQuickBookingProps {
  return {
    webUrl: 'https://contoso.sharepoint.com/sites/operations',
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: '',
    showAvailability: true,
    defaultCategory: 'Todos',
    resourcesJson: '',
    openInNewTab: true,
    userDisplayName: 'Ada Lovelace',
    environmentMessage: 'SharePoint Online',
    hasTeamsContext: false,
    isDarkTheme: false
  };
}

function buildModel(overrides: Partial<IQuickBookingViewModel>): IQuickBookingViewModel {
  return {
    status: 'ready',
    resources: [],
    categories: ['Todos'],
    sites: ['Todos'],
    selectedCategory: 'Todos',
    selectedSite: 'Todos',
    errorMessage: undefined,
    hasPartialData: false,
    visibleResources: [],
    ...overrides
  };
}

describe('QuickBooking', () => {
  const useQuickBookingSpy = jest.spyOn(useQuickBookingModule, 'useQuickBooking');

  afterEach(() => {
    useQuickBookingSpy.mockReset();
  });

  it('renders loading state distinctly', () => {
    useQuickBookingSpy.mockReturnValue({
      model: buildModel({ status: 'loading' }),
      setSelectedCategory: jest.fn(),
      setSelectedSite: jest.fn(),
      reload: jest.fn()
    });

    const markup = renderToStaticMarkup(<QuickBooking {...buildProps()} />);

    expect(markup).toContain('Cargando recursos de reserva');
    expect(markup).toContain('Estamos leyendo la fuente configurada');
    expect(markup).not.toContain('Categoria');
  });

  it('renders error state with the real message', () => {
    useQuickBookingSpy.mockReturnValue({
      model: buildModel({ status: 'error', errorMessage: 'Boom' }),
      setSelectedCategory: jest.fn(),
      setSelectedSite: jest.fn(),
      reload: jest.fn()
    });

    const markup = renderToStaticMarkup(<QuickBooking {...buildProps()} />);

    expect(markup).toContain('No se han podido cargar los recursos');
    expect(markup).toContain('MessageBar');
    expect(markup).toContain('Reintentar');
  });

  it('renders empty state without cards', () => {
    useQuickBookingSpy.mockReturnValue({
      model: buildModel({ status: 'empty' }),
      setSelectedCategory: jest.fn(),
      setSelectedSite: jest.fn(),
      reload: jest.fn()
    });

    const markup = renderToStaticMarkup(<QuickBooking {...buildProps()} />);

    expect(markup).toContain('No hay recursos para esta vista');
    expect(markup).toContain('Restablecer filtros');
    expect(markup).not.toContain('Reservar ahora');
  });

  it('renders ready and partial content with safe booking actions only', () => {
    useQuickBookingSpy.mockReturnValue({
      model: buildModel({
        status: 'partialData',
        categories: ['Todos', 'Sala'],
        sites: ['Todos', 'Madrid'],
        selectedCategory: 'Todos',
        selectedSite: 'Todos',
        hasPartialData: true,
        visibleResources: [
          {
            id: 'room-1',
            name: 'Sala 1',
            category: 'Sala',
            site: 'Madrid',
            bookingUrl: '/booking/room-1',
            availability: 'available',
            rules: 'Max 4h',
            featured: false,
            priority: 1
          },
          {
            id: 'room-2',
            name: 'Sala 2',
            category: 'Sala',
            site: 'Madrid',
            bookingUrl: 'data:text/html,boom',
            availability: undefined,
            rules: undefined,
            featured: false,
            priority: 2
          }
        ]
      }),
      setSelectedCategory: jest.fn(),
      setSelectedSite: jest.fn(),
      reload: jest.fn()
    });

    const markup = renderToStaticMarkup(<QuickBooking {...buildProps()} />);

    expect(markup).toContain('Sede');
    expect(markup).toContain('MessageBar');
    expect(markup).toContain('Reservar ahora');
    expect(markup).toContain('Sin enlace de reserva seguro.');
  });
});
