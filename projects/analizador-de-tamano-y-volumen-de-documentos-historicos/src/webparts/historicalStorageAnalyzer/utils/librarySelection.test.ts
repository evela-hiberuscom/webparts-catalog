import {
  getSelectableLibraryTitle,
  pickDefaultLibrary,
  toLibraryComboBoxOption
} from './librarySelection';

describe('librarySelection', () => {
  const libraries = [
    {
      id: '1',
      title: 'Site Assets',
      serverRelativeUrl: '/sites/demo/SiteAssets',
      webUrl: 'https://contoso.sharepoint.com/sites/demo/SiteAssets',
      hidden: true,
      itemCount: 3,
      isSystemLibrary: true
    },
    {
      id: '2',
      title: 'Contracts',
      serverRelativeUrl: '/sites/demo/Contracts',
      webUrl: 'https://contoso.sharepoint.com/sites/demo/Contracts',
      hidden: false,
      itemCount: 24,
      isSystemLibrary: false
    }
  ];

  it('picks the hinted library and falls back to visible ones', () => {
    expect(pickDefaultLibrary(libraries, 'contracts')?.id).toBe('2');
    expect(pickDefaultLibrary(libraries, 'missing')?.id).toBe('2');
  });

  it('creates combo box options and readable titles', () => {
    expect(toLibraryComboBoxOption(libraries[1]).text).toContain('Contracts');
    expect(getSelectableLibraryTitle(libraries[1])).toContain('/sites/demo/Contracts');
  });
});
