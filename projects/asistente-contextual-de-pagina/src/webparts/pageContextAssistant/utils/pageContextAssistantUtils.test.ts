import {
  normalizeHelpRecord,
  parseRelatedLinks,
  parseSourceCollection,
  resolveCurrentContextKey
} from "./pageContextAssistantUtils";

describe("pageContextAssistantUtils", () => {
  it("resolves explicit context keys before page metadata", () => {
    expect(resolveCurrentContextKey("https://contoso.sharepoint.com/sites/portal", "Inicio", "  help-home  ")).toBe("help-home");
  });

  it("parses related links from arrays and compact strings", () => {
    expect(
      parseRelatedLinks([
        { label: "Guía", url: "/sitepages/guia.aspx" },
        { label: "Ignorar", href: "" }
      ])
    ).toEqual([{ label: "Guía", url: "/sitepages/guia.aspx" }]);

    expect(parseRelatedLinks("Docs|/sitepages/docs.aspx")).toEqual([{ label: "Docs", url: "/sitepages/docs.aspx" }]);
  });

  it("normalizes source records and marks missing fields as partial", () => {
    const record = normalizeHelpRecord(
      {
        Title: "Ayuda de inicio",
        ContextKey: "Home",
        Message: "Abre los recursos más usados.",
        RelatedLinks: [{ label: "Abrir", url: "/sitepages/abrir.aspx" }],
        IsGeneric: false,
        Order: "2"
      },
      "StaticConfig",
      0
    );

    expect(record).toMatchObject({
      contextKey: "Home",
      title: "Ayuda de inicio",
      message: "Abre los recursos más usados.",
      order: 2,
      sourceType: "StaticConfig"
    });
    expect(record.isPartial).toBe(false);
  });

  it("extracts collections from nested payloads", () => {
    expect(
      parseSourceCollection({
        value: [{ id: 1 }, { id: 2 }],
        items: [{ id: 9 }]
      })
    ).toEqual([{ id: 1 }, { id: 2 }]);

    expect(parseSourceCollection({ d: { results: [{ id: 3 }] } })).toEqual([{ id: 3 }]);
  });
});
