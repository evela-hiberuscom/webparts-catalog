import { loadLaunchItemsFromConfig } from './launchRepository';

describe('launchRepository', () => {
  it('falls back to built-in items when JSON is missing', () => {
    const result = loadLaunchItemsFromConfig({
      launchItemsJson: '',
      defaultCategory: 'All',
      openInNewTab: false
    });

    expect(result.items.length).toBeGreaterThan(0);
    expect(result.sourceLabel).toBe('Built-in sample catalog');
  });

  it('normalizes JSON items and flags missing audience metadata', () => {
    const result = loadLaunchItemsFromConfig({
      launchItemsJson: JSON.stringify([
        {
          id: 'custom-link',
          title: 'Enlace personalizado',
          category: 'General',
          description: 'Acceso sin audiencia explícita',
          openUrl: '/sites/custom'
        }
      ]),
      defaultCategory: 'All',
      openInNewTab: false
    });

    expect(result.items[0].id).toBe('custom-link');
    expect(result.hasPartialData).toBe(true);
  });
});
