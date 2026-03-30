import { buildSharePointListEndpoint, filterAndSortPeople, normalizeListRootPath, parseDataSourceTypes } from './expressDirectoryUtils';
import type { IPersonItem } from '../models/expressDirectoryModels';

describe('expressDirectoryUtils', () => {
  it('parses source types without duplicates', () => {
    expect(parseDataSourceTypes('Directory, SharePointList, Directory, JsonUrl')).toEqual([
      'Directory',
      'SharePointList',
      'JsonUrl'
    ]);
  });

  it('normalizes a SharePoint list view URL to its root path', () => {
    expect(
      normalizeListRootPath('/sites/portal/Lists/People/Forms/AllItems.aspx?view=1', 'https://contoso.sharepoint.com/sites/portal')
    ).toBe('/sites/portal/Lists/People');
  });

  it('builds a SharePoint list endpoint from a same-origin URL', () => {
    const endpoint = buildSharePointListEndpoint(
      'https://contoso.sharepoint.com/sites/portal',
      '/sites/portal/Lists/People/Forms/AllItems.aspx'
    );

    expect(endpoint).toContain("web/GetList(@listUrl)/items");
    expect(endpoint).toContain("/sites/portal/Lists/People");
    expect(endpoint).not.toContain('AllItems.aspx');
  });

  it('filters and sorts people giving priority to exact matches', () => {
    const items: IPersonItem[] = [
      { id: '1', displayName: 'Marta Ruiz', jobTitle: 'HRBP', area: 'RRHH', email: 'marta@corp.com', profileUrl: undefined, photoUrl: undefined },
      { id: '2', displayName: 'Marta Sánchez', jobTitle: 'People Manager', area: 'RRHH', email: 'marta.sanchez@corp.com', profileUrl: undefined, photoUrl: undefined },
      { id: '3', displayName: 'Luis', jobTitle: 'Manager', area: 'HR', email: 'luis@corp.com', profileUrl: undefined, photoUrl: undefined }
    ];

    expect(filterAndSortPeople(items, 'Marta Ruiz', '', 12).map((person) => person.displayName)).toEqual([
      'Marta Ruiz'
    ]);
  });
});
