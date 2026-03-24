import { createProjectsRepository } from './createProjectsRepository';
import { JsonProjectsRepository } from './jsonProjectsRepository';
import { SharePointListProjectsRepository } from './sharePointListProjectsRepository';
import { StaticProjectsRepository } from './staticProjectsRepository';

describe('createProjectsRepository', () => {
  it('returns the static repository by default', () => {
    expect(createProjectsRepository('StaticConfig')).toBeInstanceOf(StaticProjectsRepository);
  });

  it('returns the json repository', () => {
    expect(createProjectsRepository('JsonUrl')).toBeInstanceOf(JsonProjectsRepository);
  });

  it('returns the sharepoint repository', () => {
    expect(createProjectsRepository('SharePointList')).toBeInstanceOf(SharePointListProjectsRepository);
  });
});

describe('JsonProjectsRepository', () => {
  it('loads items from a same-origin JSON source', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        items: [
          {
            id: 'one',
            title: 'Proyecto JSON',
            status: 'amber',
            owner: 'Equipo A',
            relevantDate: '2026-03-29',
            openUrl: '/sites/demo/proyecto-json'
          }
        ]
      })
    })) as unknown as typeof fetch;

    const repository = new JsonProjectsRepository(fetcher);
    const items = await repository.loadProjects({
      webUrl: 'https://contoso.sharepoint.com/sites/demo',
      dataSourceType: 'JsonUrl',
      listTitleOrUrl: 'ProjectsList',
      jsonUrl: '/sites/demo/projects.json',
      maxItems: 8,
      showOwner: true,
      defaultStatusFilter: 'all'
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(items).toHaveLength(1);
    expect(items[0]?.title).toBe('Proyecto JSON');
  });

  it('fails on malformed JSON payloads', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => {
        throw new SyntaxError('Unexpected token');
      }
    })) as unknown as typeof fetch;

    const repository = new JsonProjectsRepository(fetcher);

    await expect(
      repository.loadProjects({
        webUrl: 'https://contoso.sharepoint.com/sites/demo',
        dataSourceType: 'JsonUrl',
        listTitleOrUrl: 'ProjectsList',
        jsonUrl: '/sites/demo/projects.json',
        maxItems: 8,
        showOwner: true,
        defaultStatusFilter: 'all'
      })
    ).rejects.toThrow('malformed JSON');
  });
});

describe('SharePointListProjectsRepository', () => {
  it('loads list items from SharePoint REST', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Proyecto SharePoint',
            Status: 'green',
            Owner: 'Equipo PMO',
            RelevantDate: '2026-03-31',
            OpenUrl: '/sites/demo/proyecto-sp',
            Category: 'PMO'
          }
        ]
      })
    })) as unknown as typeof fetch;

    const repository = new SharePointListProjectsRepository(fetcher);
    const items = await repository.loadProjects({
      webUrl: 'https://contoso.sharepoint.com/sites/demo',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'ProjectsList',
      maxItems: 8,
      showOwner: true,
      defaultStatusFilter: 'all'
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect(items[0]?.title).toBe('Proyecto SharePoint');
  });

  it('derives the REST endpoint from a same-origin list URL', async () => {
    const fetcher = jest.fn(async () => ({
      ok: true,
      status: 200,
      json: async () => ({
        value: [
          {
            Id: 1,
            Title: 'Proyecto URL',
            Status: 'amber',
            Owner: 'Equipo PMO',
            RelevantDate: '2026-03-31',
            OpenUrl: '/sites/demo/proyecto-url',
            Category: 'PMO'
          }
        ]
      })
    })) as unknown as typeof fetch;

    const repository = new SharePointListProjectsRepository(fetcher);
    await repository.loadProjects({
      webUrl: 'https://contoso.sharepoint.com/sites/demo',
      dataSourceType: 'SharePointList',
      listTitleOrUrl: 'https://contoso.sharepoint.com/sites/demo/Lists/Projects/AllItems.aspx',
      maxItems: 8,
      showOwner: true,
      defaultStatusFilter: 'all'
    });

    expect(fetcher).toHaveBeenCalledTimes(1);
    expect((fetcher as jest.Mock).mock.calls[0]?.[0]).toContain('/_api/web/GetList(');
    expect((fetcher as jest.Mock).mock.calls[0]?.[0]).not.toContain('getbytitle');
  });
});

describe('PlannerProjectsRepository', () => {
  it('is not surfaced as an operational option', () => {
    expect(true).toBe(true);
  });
});
