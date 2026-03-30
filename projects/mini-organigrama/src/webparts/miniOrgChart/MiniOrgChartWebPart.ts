import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { type IPropertyPaneConfiguration, PropertyPaneDropdown, PropertyPaneTextField } from '@microsoft/sp-property-pane';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import * as strings from 'MiniOrgChartWebPartStrings';
import MiniOrgChart from './components/MiniOrgChart';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type { IMiniOrgChartWebPartProps } from './models/miniOrgChartModels';
import { normalizeDataSourceTypes, sanitizeMaxDepth } from './utils/miniOrgChartUtils';

export default class MiniOrgChartWebPart extends BaseClientSideWebPart<IMiniOrgChartWebPartProps> {
  private _isDarkTheme = false;
  private _environmentMessage = '';

  public async onInit(): Promise<void> {
    this.properties.title = this.properties.title || strings.Title;
    this.properties.description = this.properties.description || '';
    this.properties.dataSourceTypesCsv = this.properties.dataSourceTypesCsv || 'Directory,SharePointList';
    this.properties.viewMode = this.properties.viewMode || 'managerWithReports';
    this.properties.maxDepth = sanitizeMaxDepth(this.properties.maxDepth);

    this._environmentMessage = await this._getEnvironmentMessage();
  }

  public render(): void {
    const element = React.createElement(
      WebPartErrorBoundary,
      {
        title: strings.ErrorBoundaryTitle,
        message: strings.ErrorBoundaryMessage
      },
      React.createElement(MiniOrgChart, {
        context: this.context,
        config: {
          dataSourceTypes: normalizeDataSourceTypes(this.properties.dataSourceTypesCsv),
          listTitleOrUrl: this.properties.listTitleOrUrl,
          rootPersonId: this.properties.rootPersonId,
          viewMode: this.properties.viewMode || 'managerWithReports',
          maxDepth: sanitizeMaxDepth(this.properties.maxDepth),
          directoryEndpoint: this.properties.directoryEndpoint,
          jsonUrl: this.properties.jsonUrl,
          staticConfigJson: this.properties.staticConfigJson
        },
        title: this.properties.title || strings.Title,
        description: this.properties.description,
        userDisplayName: this.context.pageContext.user.displayName,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams
      })
    );

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || '');
      this.domElement.style.setProperty('--link', semanticColors.link || '');
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || '');
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
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel
                }),
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel,
                  multiline: true
                }),
                PropertyPaneDropdown('viewMode', {
                  label: strings.ViewModeFieldLabel,
                  options: [
                    { key: 'managerWithReports', text: strings.ViewModeManagerWithReportsLabel },
                    { key: 'chain', text: strings.ViewModeChainLabel },
                    { key: 'smallTree', text: strings.ViewModeSmallTreeLabel }
                  ]
                }),
                PropertyPaneTextField('maxDepth', {
                  label: strings.MaxDepthFieldLabel,
                  description: strings.MaxDepthFieldDescription
                })
              ]
            },
            {
              groupName: strings.DataSourcesGroupName,
              groupFields: [
                PropertyPaneTextField('dataSourceTypesCsv', {
                  label: strings.DataSourceTypesFieldLabel,
                  description: strings.DataSourceTypesFieldDescription
                }),
                PropertyPaneTextField('rootPersonId', {
                  label: strings.RootPersonIdFieldLabel,
                  description: strings.RootPersonIdFieldDescription
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel,
                  description: strings.ListTitleOrUrlFieldDescription
                }),
                PropertyPaneTextField('directoryEndpoint', {
                  label: strings.DirectoryEndpointFieldLabel,
                  description: strings.DirectoryEndpointFieldDescription
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: strings.JsonUrlFieldLabel,
                  description: strings.JsonUrlFieldDescription
                }),
                PropertyPaneTextField('staticConfigJson', {
                  label: strings.StaticConfigJsonFieldLabel,
                  description: strings.StaticConfigJsonFieldDescription,
                  multiline: true
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private async _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext().then((context) => {
        switch (context.app.host.name) {
          case 'Office':
            return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
          case 'Outlook':
            return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
          case 'Teams':
          case 'TeamsModern':
            return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
          default:
            return strings.UnknownEnvironment;
        }
      });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }
}
