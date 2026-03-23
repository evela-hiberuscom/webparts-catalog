import {
  getResourceCategories,
  getResourceSites,
  normalizeBookingResource,
  parseBookingResourcesJson
} from '../utils/bookingResourceHelpers';

describe('bookingResourceHelpers', () => {
  it('returns an empty collection when the static JSON input is empty', () => {
    const resources = parseBookingResourcesJson('');

    expect(resources).toEqual([]);
  });

  it('normalizes raw resource fields safely', () => {
    const resource = normalizeBookingResource(
      {
        name: ' Sala 5 ',
        featured: 'yes',
        priority: '3',
        availability: 'available',
        bookingUrl: 'data:text/html,boom'
      },
      0
    );

    expect(resource.name).toBe('Sala 5');
    expect(resource.featured).toBe(true);
    expect(resource.priority).toBe(3);
    expect(resource.availability).toBe('available');
    expect(resource.bookingUrl).toBeUndefined();
  });

  it('builds unique categories and sites with Todos first', () => {
    const categories = getResourceCategories([
      { id: '1', name: 'A', category: 'Parking', site: 'Madrid', bookingUrl: undefined, availability: undefined, rules: undefined, featured: false, priority: undefined },
      { id: '2', name: 'B', category: 'Sala', site: 'Barcelona', bookingUrl: undefined, availability: undefined, rules: undefined, featured: false, priority: undefined }
    ]);
    const sites = getResourceSites([
      { id: '1', name: 'A', category: 'Parking', site: 'Madrid', bookingUrl: undefined, availability: undefined, rules: undefined, featured: false, priority: undefined },
      { id: '2', name: 'B', category: 'Sala', site: 'Barcelona', bookingUrl: undefined, availability: undefined, rules: undefined, featured: false, priority: undefined }
    ]);

    expect(categories).toEqual(['Todos', 'Parking', 'Sala']);
    expect(sites).toEqual(['Todos', 'Barcelona', 'Madrid']);
  });
});
