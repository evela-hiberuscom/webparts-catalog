import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'ExpressDirectoryWebPartStrings';
import ExpressDirectory from './components/ExpressDirectory';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type { IExpressDirectoryProps, IExpressDirectoryWebPartProps } from './models/expressDirectoryModels';

export default class ExpressDirectoryWebPart extends BaseClientSideWebPart<IExpressDirectoryWebPartProps> {
  private _isDarkTheme = false;
  private _environmentMessage = '';

  protected async onInit(): Promise<void> {
    this.properties.description ??= '';
    this.properties.dataSourceTypesCsv ??= 'Directory,SharePointList';
    this.properties.listTitleOrUrl ??= '';
    this.properties.jsonUrl ??= '';
    this.properties.staticPeopleJson ??= '';
    this.properties.maxItems ??= 12;
    this.properties.defaultAreaFilter ??= '';
    this._environmentMessage = await this._getEnvironmentMessage();
  }

  public render(): void {
    const element: React.ReactElement<IExpressDirectoryProps> = React.createElement(
      ExpressDirectory,
      {
        context: this.context,
        description: this.properties.description,
        dataSourceTypesCsv: this.properties.dataSourceTypesCsv,
        listTitleOrUrl: this.properties.listTitleOrUrl,
        jsonUrl: this.properties.jsonUrl,
        staticPeopleJson: this.properties.staticPeopleJson,
        maxItems: this.properties.maxItems ?? 12,
        defaultAreaFilter: this.properties.defaultAreaFilter,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName
      }
    );

    ReactDom.render(
      React.createElement(
        WebPartErrorBoundary,
        { title: strings.ErrorBoundaryTitle, message: strings.ErrorBoundaryMessage },
        element
      ),
      this.domElement
    );
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
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

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

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
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneTextField('dataSourceTypesCsv', {
                  label: strings.DataSourceTypesFieldLabel,
                  description: strings.DataSourceTypesDescription
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel,
                  description: strings.ListTitleOrUrlDescription
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: strings.JsonUrlFieldLabel,
                  description: strings.JsonUrlDescription
                }),
                PropertyPaneTextField('staticPeopleJson', {
                  label: strings.StaticPeopleJsonFieldLabel,
                  description: strings.StaticPeopleJsonDescription,
                  multiline: true
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 100,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneTextField('defaultAreaFilter', {
                  label: strings.DefaultAreaFilterFieldLabel,
                  description: strings.DefaultAreaFilterDescription
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
