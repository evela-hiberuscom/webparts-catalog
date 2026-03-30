import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'PortalMapWebPartStrings';
import PortalMap from './components/PortalMap';
import type { IPortalMapProps } from './components/IPortalMapProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type { IPortalMapWebPartProps } from './models/portalMapModels';

export default class PortalMapWebPart extends BaseClientSideWebPart<IPortalMapWebPartProps> {
  private _isDarkTheme = false;

  public onInit(): Promise<void> {
    this.properties.dataSourceType = this.properties.dataSourceType ?? 'StaticConfig';
    this.properties.listTitleOrUrl = this.properties.listTitleOrUrl ?? 'PortalMapList';
    this.properties.viewMode = this.properties.viewMode ?? 'tree';
    this.properties.maxDepth = this.properties.maxDepth ?? 4;

    return Promise.resolve();
  }

  public render(): void {
    const element: React.ReactElement<IPortalMapProps> = React.createElement(PortalMap, {
      dataSourceType: this.properties.dataSourceType,
      listTitleOrUrl: this.properties.listTitleOrUrl,
      viewMode: this.properties.viewMode,
      maxDepth: this.properties.maxDepth,
      webUrl: this.context.pageContext.web.absoluteUrl,
      isDarkTheme: this._isDarkTheme,
      hasTeamsContext: Boolean(this.context.sdks.microsoftTeams)
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
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = Boolean(currentTheme.isInverted);
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText ?? '');
      this.domElement.style.setProperty('--link', semanticColors.link ?? '');
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered ?? '');
    }
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
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
                PropertyPaneDropdown('dataSourceType', {
                  label: strings.DataSourceTypeFieldLabel,
                  options: [
                    { key: 'SharePointList', text: strings.DataSourceTypeSharePointListOption },
                    { key: 'JsonUrl', text: strings.DataSourceTypeJsonUrlOption },
                    { key: 'StaticConfig', text: strings.DataSourceTypeStaticConfigOption }
                  ]
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel,
                  description: strings.ListTitleOrUrlDescription
                }),
                PropertyPaneDropdown('viewMode', {
                  label: strings.ViewModeFieldLabel,
                  options: [
                    { key: 'tree', text: strings.ViewModeTreeOption },
                    { key: 'grouped', text: strings.ViewModeGroupedOption },
                    { key: 'cards', text: strings.ViewModeCardsOption }
                  ]
                }),
                PropertyPaneSlider('maxDepth', {
                  label: strings.MaxDepthFieldLabel,
                  min: 1,
                  max: 10,
                  step: 1,
                  showValue: true
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
