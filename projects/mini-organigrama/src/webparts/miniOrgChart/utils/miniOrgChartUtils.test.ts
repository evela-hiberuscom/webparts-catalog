import {
  buildOrgTree,
  buildSharePointListEndpoint,
  filterTree,
  normalizeDataSourceTypes,
  normalizeListRootPath,
  sanitizeMaxDepth
} from './miniOrgChartUtils';
import type { IOrgPerson } from '../models/miniOrgChartModels';

describe('miniOrgChartUtils', () => {
  it('normalizes list URLs and strips AllItems.aspx', () => {
    expect(
      normalizeListRootPath('https://contoso.sharepoint.com/sites/hr/Lists/Org/Forms/AllItems.aspx', 'https://contoso.sharepoint.com/sites/hr')
    ).toBe('/sites/hr/Lists/Org');
  });

  it('builds the GetList endpoint for URL-based lists', () => {
    expect(
      buildSharePointListEndpoint('https://contoso.sharepoint.com/sites/hr/Lists/Org/AllItems.aspx', 'https://contoso.sharepoint.com/sites/hr')
    ).toContain('/_api/web/GetList(@listUrl)/items');
  });

  it('normalizes default data source types and depth', () => {
    expect(normalizeDataSourceTypes(undefined)).toEqual(['Directory', 'SharePointList']);
    expect(sanitizeMaxDepth(12)).toBe(4);
    expect(sanitizeMaxDepth(0)).toBe(1);
  });

  it('builds and filters a simple hierarchy', () => {
    const people: IOrgPerson[] = [
      {
        id: '1',
        displayName: 'Root Person',
        jobTitle: 'Director',
        profileUrl: 'https://contoso.sharepoint.com/sites/hr/person/1',
        reportIds: ['2'],
        sourceLabel: 'StaticConfig',
        isPartial: false
      },
      {
        id: '2',
        displayName: 'Direct Report',
        jobTitle: 'Manager',
        profileUrl: 'https://contoso.sharepoint.com/sites/hr/person/2',
        managerId: '1',
        reportIds: [],
        sourceLabel: 'StaticConfig',
        isPartial: false
      }
    ];

    const tree = buildOrgTree(people, '1', 2);
    expect(tree?.person.displayName).toBe('Root Person');
    expect(tree?.children).toHaveLength(1);
    expect(filterTree(tree, 'report')?.children).toHaveLength(1);
  });
});
