import { createPageContextAssistantRepository } from "./pageContextAssistantRepository";

describe("pageContextAssistantRepository", () => {
  const webUrl = "https://contoso.sharepoint.com/sites/portal";

  beforeEach(() => {
    globalThis.fetch = jest.fn() as unknown as typeof fetch;
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("returns embedded static catalog when configured", async () => {
    const repository = createPageContextAssistantRepository(webUrl);
    const result = await repository.loadRecords({
      webUrl,
      pageContextKey: "home",
      dataSourceType: "StaticConfig",
      listTitleOrUrl: "",
      fallbackMode: "generic"
    });

    expect(result.length).toBeGreaterThan(0);
    expect(result[0].contextKey).toBeDefined();
  });

  it("loads same-origin JsonUrl sources", async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue([{ id: 1, Title: "Inicio", ContextKey: "home", Message: "Hola" }])
    } as never);

    const repository = createPageContextAssistantRepository(webUrl);
    const result = await repository.loadRecords({
      webUrl,
      pageContextKey: "home",
      dataSourceType: "JsonUrl",
      listTitleOrUrl: "/SiteAssets/contextual-help.json",
      fallbackMode: "generic"
    });

    expect(fetchMock).toHaveBeenCalledWith("https://contoso.sharepoint.com/SiteAssets/contextual-help.json", {
      credentials: "same-origin"
    });
    expect(result).toHaveLength(1);
  });

  it("rejects JsonUrl entries from another origin", async () => {
    const repository = createPageContextAssistantRepository(webUrl);

    await expect(
      repository.loadRecords({
        webUrl,
        pageContextKey: "home",
        dataSourceType: "JsonUrl",
        listTitleOrUrl: "https://example.com/help.json",
        fallbackMode: "generic"
      })
    ).rejects.toThrow("JsonUrl must be same-origin or relative");
  });

  it("builds a getbytitle endpoint for SharePoint lists", async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ value: [{ Id: 1, Title: "Inicio", ContextKey: "home", Message: "Hola" }] })
    } as never);

    const repository = createPageContextAssistantRepository(webUrl);
    await repository.loadRecords({
      webUrl,
      pageContextKey: "home",
      dataSourceType: "SharePointList",
      listTitleOrUrl: "ContextualHelp",
      fallbackMode: "generic"
    });

    expect(fetchMock.mock.calls[0]?.[0]?.toString()).toContain("/_api/web/lists/getbytitle('ContextualHelp')/items");
  });

  it("builds a GetList endpoint when the list is configured as a URL", async () => {
    const fetchMock = globalThis.fetch as jest.MockedFunction<typeof fetch>;
    fetchMock.mockResolvedValue({
      ok: true,
      json: jest.fn().mockResolvedValue({ value: [] })
    } as never);

    const repository = createPageContextAssistantRepository(webUrl);
    await repository.loadRecords({
      webUrl,
      pageContextKey: "home",
      dataSourceType: "SharePointList",
      listTitleOrUrl: "/sites/portal/Lists/ContextualHelp/AllItems.aspx",
      fallbackMode: "generic"
    });

    expect(fetchMock.mock.calls[0]?.[0]?.toString()).toContain("/_api/web/GetList(@listUrl)/items");
    expect(fetchMock.mock.calls[0]?.[0]?.toString()).toContain("%2Fsites%2Fportal%2FLists%2FContextualHelp");
  });
});
