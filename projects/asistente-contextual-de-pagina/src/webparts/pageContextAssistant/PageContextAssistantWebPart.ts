import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField,
  PropertyPaneToggle
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";

import * as strings from "PageContextAssistantWebPartStrings";
import PageContextAssistant from "./components/PageContextAssistant";
import type { IPageContextAssistantProps } from "./components/IPageContextAssistantProps";
import type {
  IPageContextAssistantWebPartProps,
  PageContextAssistantDataSourceType,
  PageContextAssistantFallbackMode
} from "./models/pageContextAssistantModels";
import { createPageContextAssistantRepository } from "./repositories/pageContextAssistantRepository";
import { PageContextAssistantService } from "./services/pageContextAssistantService";
import { resolveCurrentContextKey } from "./utils/pageContextAssistantUtils";

export default class PageContextAssistantWebPart extends BaseClientSideWebPart<IPageContextAssistantWebPartProps> {
  protected async onInit(): Promise<void> {
    if (!this.properties.title) {
      this.properties.title = "Asistente contextual de página";
    }

    if (!this.properties.description) {
      this.properties.description = "Ayuda breve y accionable según el contexto de la página.";
    }

    if (!this.properties.dataSourceType) {
      this.properties.dataSourceType = "SharePointList";
    }

    if (!this.properties.listTitleOrUrl) {
      this.properties.listTitleOrUrl = "ContextualHelp";
    }

    if (!this.properties.fallbackMode) {
      this.properties.fallbackMode = "generic";
    }

    if (typeof this.properties.collapsedByDefault !== "boolean") {
      this.properties.collapsedByDefault = true;
    }

    if (typeof this.properties.contextKeyOverride !== "string") {
      this.properties.contextKeyOverride = "";
    }
  }

  public render(): void {
    const repository = createPageContextAssistantRepository(this.context.pageContext.web.absoluteUrl);
    const service = new PageContextAssistantService(repository);
    const pageContextKey = resolveCurrentContextKey(
      this.context.pageContext.web.absoluteUrl,
      this.context.pageContext.web.title,
      this.properties.contextKeyOverride
    );

    const element: React.ReactElement<IPageContextAssistantProps> = React.createElement(PageContextAssistant, {
      title: this.properties.title,
      description: this.properties.description,
      userDisplayName: this.context.pageContext.user.displayName,
      collapsedByDefault: this.properties.collapsedByDefault,
      service,
      request: {
        webUrl: this.context.pageContext.web.absoluteUrl,
        pageContextKey,
        dataSourceType: this.properties.dataSourceType as PageContextAssistantDataSourceType,
        listTitleOrUrl: this.properties.listTitleOrUrl,
        fallbackMode: this.properties.fallbackMode as PageContextAssistantFallbackMode,
        contextKeyOverride: this.properties.contextKeyOverride
      }
    });

    ReactDom.render(element, this.domElement);
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse("1.0");
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return {
      pages: [
        {
          header: {
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField("title", {
                  label: strings.WebPartTitleFieldLabel
                }),
                PropertyPaneTextField("description", {
                  label: strings.WebPartDescriptionFieldLabel,
                  multiline: true,
                  resizable: true
                }),
                PropertyPaneDropdown("dataSourceType", {
                  label: strings.DataSourceTypeFieldLabel,
                  options: [
                    { key: "SharePointList", text: "SharePointList" },
                    { key: "JsonUrl", text: "JsonUrl" },
                    { key: "StaticConfig", text: "StaticConfig" }
                  ]
                }),
                PropertyPaneTextField("listTitleOrUrl", {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneDropdown("fallbackMode", {
                  label: strings.FallbackModeFieldLabel,
                  options: [
                    { key: "generic", text: "generic" },
                    { key: "empty", text: "empty" }
                  ]
                }),
                PropertyPaneToggle("collapsedByDefault", {
                  label: strings.CollapsedByDefaultFieldLabel
                }),
                PropertyPaneTextField("contextKeyOverride", {
                  label: strings.ContextKeyOverrideFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
