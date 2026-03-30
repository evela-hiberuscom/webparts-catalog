jest.mock('@microsoft/sp-http', () => ({
  SPHttpClient: {
    configurations: {
      v1: {}
    }
  }
}), { virtual: true });

import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { DirectoryRepository } from '../repositories/DirectoryRepository';
import { JsonUrlRepository } from '../repositories/JsonUrlRepository';
import { OrgListRepository } from '../repositories/OrgListRepository';
import { StaticConfigRepository } from '../repositories/StaticConfigRepository';
import { MiniOrgChartService } from './MiniOrgChartService';

describe('MiniOrgChartService', () => {
  const context = {
    spHttpClient: {},
    pageContext: {
      web: {
        absoluteUrl: 'https://contoso.sharepoint.com/sites/hr'
      }
    }
  } as unknown as WebPartContext;

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('merges multiple sources and deduplicates people by id', async () => {
    jest.spyOn(DirectoryRepository.prototype, 'load').mockResolvedValue([
      {
        id: '1',
        displayName: 'Root Person',
        jobTitle: 'Director',
        profileUrl: 'https://contoso.sharepoint.com/sites/hr/person/1',
        reportIds: ['2'],
        sourceLabel: 'Directory',
        isPartial: false
      }
    ]);
    jest.spyOn(OrgListRepository.prototype, 'load').mockResolvedValue([
      {
        id: '1',
        displayName: 'Root Person',
        jobTitle: 'Director',
        profileUrl: 'https://contoso.sharepoint.com/sites/hr/person/1',
        reportIds: ['2'],
        sourceLabel: 'SharePointList',
        isPartial: false
      },
      {
        id: '2',
        displayName: 'Direct Report',
        jobTitle: 'Manager',
        profileUrl: 'https://contoso.sharepoint.com/sites/hr/person/2',
        managerId: '1',
        reportIds: [],
        sourceLabel: 'SharePointList',
        isPartial: false
      }
    ]);
    jest.spyOn(JsonUrlRepository.prototype, 'load').mockResolvedValue([]);
    jest.spyOn(StaticConfigRepository.prototype, 'load').mockResolvedValue([]);

    const service = new MiniOrgChartService(context);
    const result = await service.load({
      dataSourceTypes: ['Directory', 'SharePointList', 'JsonUrl', 'StaticConfig'],
      viewMode: 'managerWithReports',
      maxDepth: 2,
      listTitleOrUrl: 'Org'
    });

    expect(result.people).toHaveLength(2);
    expect(result.sourceSummaries.find((summary) => summary.source === 'SharePointList')?.count).toBe(2);
    expect(result.warnings).toHaveLength(0);
  });
});
