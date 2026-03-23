import { PageContextAssistantService } from "./pageContextAssistantService";

describe("PageContextAssistantService", () => {
  it("returns ready data when the context matches exactly", async () => {
    const service = new PageContextAssistantService({
      loadRecords: jest.fn().mockResolvedValue([
        {
          id: "1",
          contextKey: "home",
          title: "Inicio",
          message: "Usa esta ayuda para empezar.",
          relatedLinks: [{ label: "Ver más", url: "/sitepages/ver-mas.aspx" }]
        }
      ])
    });

    const result = await service.loadHelp({
      webUrl: "https://contoso.sharepoint.com/sites/portal",
      pageContextKey: "home",
      dataSourceType: "StaticConfig",
      listTitleOrUrl: "",
      fallbackMode: "generic"
    });

    expect(result.status).toBe("ready");
    expect(result.help?.title).toBe("Inicio");
    expect(result.matchedCount).toBe(1);
  });

  it("falls back to generic help when configured", async () => {
    const service = new PageContextAssistantService({
      loadRecords: jest.fn().mockResolvedValue([
        {
          id: "1",
          contextKey: "generic",
          title: "General",
          message: "Ayuda general.",
          isGeneric: true
        }
      ])
    });

    const result = await service.loadHelp({
      webUrl: "https://contoso.sharepoint.com/sites/portal",
      pageContextKey: "missing",
      dataSourceType: "StaticConfig",
      listTitleOrUrl: "",
      fallbackMode: "generic"
    });

    expect(result.status).toBe("partialData");
    expect(result.usedFallback).toBe(true);
    expect(result.help?.contextKey).toBe("generic");
  });

  it("returns empty when the fallback mode blocks generic help", async () => {
    const service = new PageContextAssistantService({
      loadRecords: jest.fn().mockResolvedValue([
        {
          id: "1",
          contextKey: "generic",
          title: "General",
          message: "Ayuda general.",
          isGeneric: true
        }
      ])
    });

    const result = await service.loadHelp({
      webUrl: "https://contoso.sharepoint.com/sites/portal",
      pageContextKey: "missing",
      dataSourceType: "StaticConfig",
      listTitleOrUrl: "",
      fallbackMode: "empty"
    });

    expect(result.status).toBe("empty");
    expect(result.help).toBeUndefined();
  });

  it("marks incomplete records as partial data", async () => {
    const service = new PageContextAssistantService({
      loadRecords: jest.fn().mockResolvedValue([
        {
          id: "1",
          contextKey: "home",
          title: "Inicio",
          message: "",
          relatedLinks: []
        }
      ])
    });

    const result = await service.loadHelp({
      webUrl: "https://contoso.sharepoint.com/sites/portal",
      pageContextKey: "home",
      dataSourceType: "StaticConfig",
      listTitleOrUrl: "",
      fallbackMode: "generic"
    });

    expect(result.status).toBe("partialData");
    expect(result.help?.title).toBe("Inicio");
  });
});
