import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'QuickActionsCenterWebPartStrings';
import QuickActionsCenter from './components/QuickActionsCenter';
import type { IQuickActionsWebPartProps } from './models/quickActionsModels';
import { QuickActionsRepository } from './repositories/quickActionsRepository';
import { QuickActionsService } from './services/quickActionsService';

const DEFAULT_TITLE = 'Centro de acciones rápidas';
const DEFAULT_SUBTITLE = 'Accesos corporativos más usados';

export default class QuickActionsCenterWebPart extends BaseClientSideWebPart<IQuickActionsWebPartProps> {
  private _isDarkTheme = false;
  private _environmentMessage = '';
  private _service?: QuickActionsService;

  protected onInit(): Promise<void> {
    this.properties.title = this.properties.title ?? DEFAULT_TITLE;
    this.properties.subtitle = this.properties.subtitle ?? DEFAULT_SUBTITLE;
    this.properties.dataSourceType = this.properties.dataSourceType ?? 'SharePointList';
    this.properties.listTitleOrUrl = this.properties.listTitleOrUrl ?? 'QuickActionsList';
    this.properties.jsonUrl = this.properties.jsonUrl ?? '';
    this.properties.staticActionsJson = this.properties.staticActionsJson ?? '';
    this.properties.defaultCategory = this.properties.defaultCategory ?? '';
    this.properties.maxItems = Number.isFinite(Number(this.properties.maxItems)) ? Number(this.properties.maxItems) : 12;

    this._service = new QuickActionsService(
      new QuickActionsRepository(this.context.spHttpClient, (url, init) => fetch(url, init))
    );

    return this._getEnvironmentMessage().then((message) => {
      this._environmentMessage = message;
    });
  }

  public render(): void {
    if (!this._service) {
      return;
    }

    const element: React.ReactElement = React.createElement(QuickActionsCenter, {
      title: this.properties.title ?? DEFAULT_TITLE,
      subtitle: this.properties.subtitle ?? DEFAULT_SUBTITLE,
      request: {
        ...this.properties,
        webUrl: this.context.pageContext.web.absoluteUrl,
        userDisplayName: this.context.pageContext.user.displayName
      },
      service: this._service,
      isDarkTheme: this._isDarkTheme,
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      userDisplayName: this.context.pageContext.user.displayName
    });

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || null);
      this.domElement.style.setProperty('--link', semanticColors.link || null);
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || null);
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
                PropertyPaneTextField('subtitle', {
                  label: strings.SubtitleFieldLabel,
                  multiline: true
                }),
                PropertyPaneDropdown('dataSourceType', {
                  label: strings.DataSourceTypeFieldLabel,
                  options: [
                    { key: 'SharePointList', text: strings.SharePointListOptionLabel },
                    { key: 'JsonUrl', text: strings.JsonUrlOptionLabel },
                    { key: 'StaticConfig', text: strings.StaticConfigOptionLabel }
                  ]
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: strings.JsonUrlFieldLabel
                }),
                PropertyPaneTextField('staticActionsJson', {
                  label: strings.StaticActionsJsonFieldLabel,
                  multiline: true,
                  rows: 6
                }),
                PropertyPaneTextField('defaultCategory', {
                  label: strings.DefaultCategoryFieldLabel
                }),
                PropertyPaneTextField('maxItems', {
                  label: strings.MaxItemsFieldLabel
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
        let environmentMessage = '';
        switch (context.app.host.name) {
          case 'Office':
            environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
            break;
          case 'Outlook':
            environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
            break;
          case 'Teams':
          case 'TeamsModern':
            environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
            break;
          default:
            environmentMessage = strings.UnknownEnvironment;
        }

        return environmentMessage;
      });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }
}
