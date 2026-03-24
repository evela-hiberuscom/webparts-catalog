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

import * as strings from "IdeasMailboxWebPartStrings";
import IdeasMailbox from "./components/IdeasMailbox";
import type { IIdeasMailboxProps, IIdeasMailboxWebPartProps } from "./components/IIdeasMailboxProps";

const DEFAULT_PROPS: IIdeasMailboxWebPartProps = {
  title: "Buzón de ideas",
  subtitle: "Comparte una propuesta sin fricción y con validación clara.",
  sourceType: "SharePointList",
  listTitleOrUrl: "",
  endpointUrl: "",
  allowAnonymous: false,
  showCategory: true,
  submitLabel: "Enviar idea",
  categoryLabel: "Categoría"
};

export default class IdeasMailboxWebPart extends BaseClientSideWebPart<IIdeasMailboxWebPartProps> {
  protected async onInit(): Promise<void> {
    Object.assign(this.properties, DEFAULT_PROPS);
  }

  private getWebPartProps(): IIdeasMailboxWebPartProps {
    return {
      ...DEFAULT_PROPS,
      ...this.properties
    };
  }

  public render(): void {
    const webPartProps = this.getWebPartProps();
    const element: React.ReactElement<IIdeasMailboxProps> = React.createElement(IdeasMailbox, {
      ...webPartProps,
      userDisplayName: this.context.pageContext.user.displayName,
      pageUrl: this.context.pageContext.web.absoluteUrl
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
                  label: strings.TitleFieldLabel
                }),
                PropertyPaneTextField("subtitle", {
                  label: strings.SubtitleFieldLabel,
                  multiline: true,
                  resizable: false
                }),
                PropertyPaneDropdown("sourceType", {
                  label: strings.SourceTypeFieldLabel,
                  options: [
                    { key: "SharePointList", text: "SharePointList" },
                    { key: "ApiEndpoint", text: "ApiEndpoint" },
                    { key: "JsonBridge", text: "JsonBridge" }
                  ]
                }),
                PropertyPaneTextField("listTitleOrUrl", {
                  label: strings.ListTitleOrUrlFieldLabel,
                  description: strings.ListTitleOrUrlHelpText
                }),
                PropertyPaneTextField("endpointUrl", {
                  label: strings.EndpointUrlFieldLabel,
                  description: strings.EndpointUrlHelpText
                }),
                PropertyPaneToggle("allowAnonymous", {
                  label: strings.AllowAnonymousFieldLabel
                }),
                PropertyPaneToggle("showCategory", {
                  label: strings.ShowCategoryFieldLabel
                }),
                PropertyPaneTextField("submitLabel", {
                  label: strings.SubmitLabelFieldLabel
                }),
                PropertyPaneTextField("categoryLabel", {
                  label: strings.CategoryLabelFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
