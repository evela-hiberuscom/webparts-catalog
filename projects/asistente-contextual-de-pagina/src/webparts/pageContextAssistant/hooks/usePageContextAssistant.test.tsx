import * as React from "react";
import * as ReactDom from "react-dom";
import { act } from "react-dom/test-utils";
import type { IUsePageContextAssistantResult } from "./usePageContextAssistant";
import { usePageContextAssistant } from "./usePageContextAssistant";
import type { IPageContextAssistantService } from "../models/pageContextAssistantModels";

describe("usePageContextAssistant", () => {
  it("loads data and exposes refresh / toggle handlers", async () => {
    const service: IPageContextAssistantService = {
      loadHelp: jest.fn().mockResolvedValue({
        status: "ready",
        items: [],
        help: {
          id: "1",
          contextKey: "home",
          title: "Inicio",
          message: "Ayuda.",
          relatedLinks: [],
          isGeneric: false,
          isPartial: false,
          order: 1,
          sourceType: "StaticConfig"
        },
        sourceCount: 1,
        matchedCount: 1,
        usedFallback: false
      })
    };

    const container = document.createElement("div");
    document.body.appendChild(container);

    let currentState: IUsePageContextAssistantResult | undefined;

    function HookHost(): null {
      currentState = usePageContextAssistant(
        service,
        {
          webUrl: "https://contoso.sharepoint.com/sites/portal",
          pageContextKey: "home",
          dataSourceType: "StaticConfig",
          listTitleOrUrl: "",
          fallbackMode: "generic"
        },
        true
      );
      return null;
    }

    await act(async () => {
      ReactDom.render(<HookHost />, container);
    });

    expect(currentState?.status).toBe("ready");
    expect(currentState?.isExpanded).toBe(false);

    await act(async () => {
      currentState?.toggleExpanded();
    });

    expect(currentState?.isExpanded).toBe(true);

    await act(async () => {
      currentState?.refresh();
    });

    expect(service.loadHelp).toHaveBeenCalledTimes(2);

    ReactDom.unmountComponentAtNode(container);
    container.remove();
  });
});
