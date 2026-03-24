import * as React from "react";
import * as ReactDom from "react-dom";
import { Version } from "@microsoft/sp-core-library";
import {
  type IPropertyPaneConfiguration,
  PropertyPaneChoiceGroup,
  PropertyPaneTextField,
  PropertyPaneToggle
} from "@microsoft/sp-property-pane";
import { BaseClientSideWebPart } from "@microsoft/sp-webpart-base";
import type { IReadonlyTheme } from "@microsoft/sp-component-base";
import * as strings from "InternalServicesStatusWebPartStrings";
import InternalServicesStatus from "./components/InternalServicesStatus";
import type { IInternalServicesStatusProps } from "./components/IInternalServicesStatusProps";
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type { IInternalServicesStatusWebPartProps } from "./models/internalServicesStatusModels";

export default class InternalServicesStatusWebPart extends BaseClientSideWebPart<IInternalServicesStatusWebPartProps> {
  public async onInit(): Promise<void> {
    this.properties.description ??= strings.DefaultDescription;
    this.properties.dataSourceType ??= "SharePointList";
    this.properties.listTitleOrUrl ??= "ServiceStatusList";
    this.properties.autoRefreshSeconds ??= 300;
    this.properties.showOnlyCritical ??= false;
    this.properties.staleThresholdMinutes ??= 240;
  }

  public render(): void {
    const element = React.createElement<IInternalServicesStatusProps>(InternalServicesStatus, {
      ...this.properties,
      webUrl: this.context.pageContext.web.absoluteUrl,
      userDisplayName: this.context.pageContext.user.displayName
    });

    ReactDom.render(
      React.createElement(
        WebPartErrorBoundary,
        { title: strings.ErrorBoundaryTitle, message: strings.ErrorBoundaryMessage },
        element
      ),
      this.domElement
    );
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme?.semanticColors) {
      return;
    }

    const { semanticColors } = currentTheme;
    this.domElement.style.setProperty("--bodyText", semanticColors.bodyText ?? "");
    this.domElement.style.setProperty("--link", semanticColors.link ?? "");
    this.domElement.style.setProperty("--linkHovered", semanticColors.linkHovered ?? "");
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
                PropertyPaneTextField("description", {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneChoiceGroup("dataSourceType", {
                  label: strings.DataSourceTypeFieldLabel,
                  options: [
                    { key: "SharePointList", text: strings.DataSourceSharePointListOption },
                    { key: "JsonUrl", text: strings.DataSourceJsonUrlOption },
                    { key: "StaticConfig", text: strings.DataSourceStaticConfigOption }
                  ]
                }),
                PropertyPaneTextField("listTitleOrUrl", {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneTextField("autoRefreshSeconds", {
                  label: strings.AutoRefreshFieldLabel
                }),
                PropertyPaneTextField("staleThresholdMinutes", {
                  label: strings.StaleThresholdFieldLabel
                }),
                PropertyPaneToggle("showOnlyCritical", {
                  label: strings.ShowOnlyCriticalFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
