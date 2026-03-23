import { createBookingResourcesRepository } from '../repositories/bookingResourcesRepository';
import type { IQuickBookingContext, IQuickBookingWebPartProps } from '../models/quickBookingModels';

describe('bookingResourcesRepository', () => {
  const context: IQuickBookingContext = {
    webUrl: 'https://contoso.sharepoint.com/sites/operations'
  };
  const originalFetch = globalThis.fetch;

  const baseProps: IQuickBookingWebPartProps = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: '',
    showAvailability: true,
    defaultCategory: 'Todos',
    resourcesJson: '',
    openInNewTab: true
  };

  afterEach(() => {
    jest.restoreAllMocks();
    globalThis.fetch = originalFetch;
  });

  it('returns static config resources without inventing demo data', async () => {
    const repository = createBookingResourcesRepository(context, {
      ...baseProps,
      resourcesJson: JSON.stringify({
        resources: [
          {
            id: 'desk-1',
            name: 'Puesto 1',
            bookingUrl: '/book/desk-1'
          }
        ]
      })
    });

    await expect(repository.getResources()).resolves.toHaveLength(1);
  });

  it('loads JsonUrl resources only from the same origin', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        {
          id: 'room-2a',
          name: 'Sala 2A',
          bookingUrl: '/book/room-2a'
        }
      ]
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const repository = createBookingResourcesRepository(context, {
      ...baseProps,
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: '/assets/booking-resources.json'
    });

    const resources = await repository.getResources();

    expect(fetchMock).toHaveBeenCalledWith('https://contoso.sharepoint.com/assets/booking-resources.json');
    expect(resources).toHaveLength(1);
    expect(resources[0].name).toBe('Sala 2A');
  });

  it('rejects JsonUrl values that point to another host', async () => {
    const repository = createBookingResourcesRepository(context, {
      ...baseProps,
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: 'https://evil.example.com/resources.json'
    });

    await expect(repository.getResources()).rejects.toThrow('JsonUrl debe ser relativa o mantener el mismo origen que el sitio actual.');
  });

  it('maps SharePoint list items to booking resources', async () => {
    const fetchMock = jest.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Sala 2A',
            Category: 'Sala',
            Site: 'Madrid',
            BookingUrl: '/sites/facilities/book/2A',
            Availability: 'available',
            Rules: 'Max 4h',
            Featured: 1,
            Priority: '3'
          }
        ]
      })
    });
    globalThis.fetch = fetchMock as unknown as typeof fetch;

    const repository = createBookingResourcesRepository(context, {
      ...baseProps,
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'BookingResourcesList'
    });

    const resources = await repository.getResources();

    expect(fetchMock).toHaveBeenCalledWith(
      "https://contoso.sharepoint.com/sites/operations/_api/web/lists/getbytitle('BookingResourcesList')/items?$select=Id,Title,Category,Site,BookingUrl,Availability,Rules,Featured,Priority&$top=100",
      expect.objectContaining({
        headers: expect.objectContaining({
          Accept: 'application/json;odata=nometadata'
        })
      })
    );
    expect(resources[0].site).toBe('Madrid');
    expect(resources[0].priority).toBe(3);
  });

  it('throws a clear error when the configured source value is missing', () => {
    expect(() =>
      createBookingResourcesRepository(context, {
        ...baseProps,
        dataSourceType: 'JsonUrl'
      })
    ).toThrow('JsonUrl requiere una URL relativa o del mismo origen.');

    expect(() =>
      createBookingResourcesRepository(context, {
        ...baseProps,
        dataSourceType: 'SharePointList'
      })
    ).toThrow('SharePointList requiere el titulo de la lista.');
  });
});
