import * as React from "react";
import * as ReactDom from "react-dom";
import { act } from "react-dom/test-utils";
import ContextHelpPanel from "./ContextHelpPanel";

describe("ContextHelpPanel", () => {
  it("renders the expanded help and related links", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    act(() => {
      ReactDom.render(
        <ContextHelpPanel
          title="Asistente contextual de página"
          description="Ayuda breve y accionable."
          pageContextKey="Inicio"
          userDisplayName="Ana"
          status="ready"
          result={{
            status: "ready",
            items: [],
            help: {
              id: "1",
              contextKey: "home",
              title: "Inicio",
              message: "Abre los pasos más usados.",
              relatedLinks: [{ label: "Ir a la guía", url: "/sitepages/guia.aspx" }],
              isGeneric: false,
              isPartial: false,
              order: 1,
              sourceType: "StaticConfig"
            },
            sourceCount: 1,
            matchedCount: 1,
            usedFallback: false
          }}
          isExpanded
          onToggleExpanded={jest.fn()}
          onRefresh={jest.fn()}
        />,
        container
      );
    });

    expect(container.textContent).toContain("Asistente contextual de página");
    expect(container.textContent).toContain("Ir a la guía");
    expect(container.querySelector('a[href="/sitepages/guia.aspx"]')).not.toBeNull();

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });

  it("does not render unsafe related links from the source payload", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    act(() => {
      ReactDom.render(
        <ContextHelpPanel
          title="Asistente contextual de página"
          description="Ayuda breve y accionable."
          pageContextKey="Inicio"
          status="ready"
          result={{
            status: "ready",
            items: [],
            help: {
              id: "1",
              contextKey: "home",
              title: "Inicio",
              message: "Abre los pasos más usados.",
              relatedLinks: [{ label: "Abrir", url: "javascript:alert(1)" }],
              isGeneric: false,
              isPartial: false,
              order: 1,
              sourceType: "StaticConfig"
            },
            sourceCount: 1,
            matchedCount: 1,
            usedFallback: false
          }}
          isExpanded
          onToggleExpanded={jest.fn()}
          onRefresh={jest.fn()}
        />,
        container
      );
    });

    expect(container.querySelector('a[href^="javascript:"]')).toBeNull();
    expect(container.textContent).toContain("No hay enlaces relacionados");

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });

  it("renders the compact state when collapsed", () => {
    const container = document.createElement("div");
    document.body.appendChild(container);

    act(() => {
      ReactDom.render(
        <ContextHelpPanel
          title="Asistente contextual de página"
          description="Ayuda breve y accionable."
          pageContextKey="Inicio"
          status="empty"
          isExpanded={false}
          onToggleExpanded={jest.fn()}
          onRefresh={jest.fn()}
        />,
        container
      );
    });

    expect(container.textContent).toContain("No hay ayuda contextual disponible.");

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });
});
