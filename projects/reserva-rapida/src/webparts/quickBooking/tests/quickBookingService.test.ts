import {
  buildErrorViewModel,
  buildQuickBookingViewModel,
  updateSelectedCategory,
  updateSelectedSite
} from '../services/quickBookingService';

describe('quickBookingService', () => {
  it('sorts featured resources first', () => {
    const model = buildQuickBookingViewModel(
      [
        { id: '2', name: 'B', category: 'Sala', site: 'Madrid', bookingUrl: '/b', availability: 'available', rules: undefined, featured: false, priority: 2 },
        { id: '1', name: 'A', category: 'Sala', site: 'Madrid', bookingUrl: '/a', availability: 'available', rules: undefined, featured: true, priority: 3 }
      ],
      'Todos',
      true
    );

    expect(model.resources[0].id).toBe('1');
    expect(model.status).toBe('ready');
  });

  it('keeps partial data when the visible resources are missing booking data', () => {
    const model = buildQuickBookingViewModel(
      [
        { id: '1', name: 'A', category: 'Sala', site: 'Madrid', bookingUrl: undefined, availability: undefined, rules: undefined, featured: false, priority: 1 }
      ],
      'Todos',
      true
    );

    expect(model.status).toBe('partialData');
    expect(model.hasPartialData).toBe(true);
  });

  it('updates selected category and site without mutating source resources', () => {
    const model = buildQuickBookingViewModel(
      [
        { id: '1', name: 'A', category: 'Sala', site: 'Barcelona', bookingUrl: '/a', availability: 'available', rules: undefined, featured: false, priority: 1 },
        { id: '2', name: 'B', category: 'Parking', site: 'Madrid', bookingUrl: '/b', availability: 'busy', rules: undefined, featured: false, priority: 2 }
      ],
      'Todos',
      true
    );

    const nextByCategory = updateSelectedCategory(model, 'Parking', true);
    const nextBySite = updateSelectedSite(model, 'Barcelona', true);

    expect(nextByCategory.selectedCategory).toBe('Parking');
    expect(nextByCategory.visibleResources).toHaveLength(1);
    expect(nextBySite.selectedSite).toBe('Barcelona');
    expect(nextBySite.visibleResources).toHaveLength(1);
  });

  it('creates an error view model', () => {
    const model = buildErrorViewModel('Todos', 'Boom');

    expect(model.status).toBe('error');
    expect(model.errorMessage).toBe('Boom');
  });
});
