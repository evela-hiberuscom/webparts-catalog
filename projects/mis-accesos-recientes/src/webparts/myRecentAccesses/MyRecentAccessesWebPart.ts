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

import * as strings from 'MyRecentAccessesWebPartStrings';
import MyRecentAccesses from './components/MyRecentAccesses';
import type { IMyRecentAccessesProps } from './components/IMyRecentAccessesProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type { RecentAccessesSourceMode } from './models/recentAccesses.types';
import { recentAccessesDefaults } from './models/recentAccesses.constants';

export interface IMyRecentAccessesWebPartProps {
  description: string;
  dataSourceMode: RecentAccessesSourceMode;
  recentItemsJsonUrl: string;
  maxItems: number;
  resourceTypeFilter: string;
}

export default class MyRecentAccessesWebPart extends BaseClientSideWebPart<IMyRecentAccessesWebPartProps> {
  private _isDarkTheme: boolean = false;

  private _environmentMessage: string = '';

  protected onInit(): Promise<void> {
    this.properties.description = this.properties.description ?? strings.DefaultDescription;
    this.properties.dataSourceMode = this.properties.dataSourceMode ?? recentAccessesDefaults.sourceMode;
    this.properties.recentItemsJsonUrl = this.properties.recentItemsJsonUrl ?? '';
    this.properties.maxItems = this.properties.maxItems ?? recentAccessesDefaults.maxItems;
    this.properties.resourceTypeFilter = this.properties.resourceTypeFilter ?? '';

    return this._getEnvironmentMessage().then((message) => {
      this._environmentMessage = message;
    });
  }

  public render(): void {
    const element: React.ReactElement<IMyRecentAccessesProps> = React.createElement(MyRecentAccesses, {
      description: this.properties.description,
      isDarkTheme: this._isDarkTheme,
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      userDisplayName: this.context.pageContext.user.displayName,
      dataSourceMode: this.properties.dataSourceMode ?? recentAccessesDefaults.sourceMode,
      recentItemsJsonUrl: this.properties.recentItemsJsonUrl ?? '',
      maxItems: this.properties.maxItems ?? recentAccessesDefaults.maxItems,
      resourceTypeFilter: this.properties.resourceTypeFilter ?? ''
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

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      if (semanticColors.bodyText) {
        this.domElement.style.setProperty('--bodyText', semanticColors.bodyText);
      }
      if (semanticColors.link) {
        this.domElement.style.setProperty('--link', semanticColors.link);
      }
      if (semanticColors.linkHovered) {
        this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered);
      }
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
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneDropdown('dataSourceMode', {
                  label: strings.DataSourceModeFieldLabel,
                  selectedKey: this.properties.dataSourceMode ?? recentAccessesDefaults.sourceMode,
                  options: [
                    { key: 'SharePointList', text: 'SharePoint list' },
                    { key: 'JsonUrl', text: 'JSON URL' },
                    { key: 'GraphRecent', text: 'Graph recent' }
                  ]
                }),
                PropertyPaneTextField('recentItemsJsonUrl', {
                  label: strings.RecentItemsJsonUrlFieldLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 12,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneTextField('resourceTypeFilter', {
                  label: strings.ResourceTypeFilterFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext().then((context) => {
        let environmentMessage: string = '';
        switch (context.app.host.name) {
          case 'Office':
            environmentMessage = this.context.isServedFromLocalhost
              ? strings.AppLocalEnvironmentOffice
              : strings.AppOfficeEnvironment;
            break;
          case 'Outlook':
            environmentMessage = this.context.isServedFromLocalhost
              ? strings.AppLocalEnvironmentOutlook
              : strings.AppOutlookEnvironment;
            break;
          case 'Teams':
          case 'TeamsModern':
            environmentMessage = this.context.isServedFromLocalhost
              ? strings.AppLocalEnvironmentTeams
              : strings.AppTeamsTabEnvironment;
            break;
          default:
            environmentMessage = strings.UnknownEnvironment;
        }

        return environmentMessage;
      });
    }

    return Promise.resolve(
      this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment
    );
  }
}
