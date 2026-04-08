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
import { SPHttpClient } from '@microsoft/sp-http';

import * as strings from 'TemplatesLibraryWebPartStrings';
import TemplatesLibrary from './components/TemplatesLibrary';
import type { ITemplatesLibraryProps } from './components/ITemplatesLibraryProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import { TemplatesLibraryRepository } from './repositories/templatesLibraryRepository';
import { TemplatesLibraryService } from './services/templatesLibraryService';

export interface ITemplatesLibraryWebPartProps {
  title: string;
  description: string;
  sourceKind: 'library' | 'list';
  listTitleOrUrl: string;
  defaultCategory: string;
  maxItems: number;
}

export default class TemplatesLibraryWebPart extends BaseClientSideWebPart<ITemplatesLibraryWebPartProps> {
  private _isDarkTheme = false;
  private _environmentMessage = '';

  public render(): void {
    const service = new TemplatesLibraryService(new TemplatesLibraryRepository({
      spHttpClient: this.context.spHttpClient,
      spHttpClientConfiguration: SPHttpClient.configurations.v1,
      webAbsoluteUrl: this.context.pageContext.web.absoluteUrl
    }));

    const element: React.ReactElement<ITemplatesLibraryProps> = React.createElement(TemplatesLibrary, {
      configuration: {
        title: this.properties.title,
        description: this.properties.description,
        sourceKind: this.properties.sourceKind,
        listTitleOrUrl: this.properties.listTitleOrUrl,
        defaultCategory: this.properties.defaultCategory,
        maxItems: this.properties.maxItems
      },
      service,
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      isDarkTheme: this._isDarkTheme,
      localeName: this.context.pageContext.cultureInfo.currentUICultureName || 'es-ES',
      userDisplayName: this.context.pageContext.user.displayName
    });

    ReactDom.render(
      React.createElement(
        WebPartErrorBoundary,
        {
          title: strings.ErrorBoundaryTitle,
          message: strings.ErrorBoundaryMessage
        },
        element
      ),
      this.domElement
    );
  }

  protected async onInit(): Promise<void> {
    this.properties.title = this.properties.title || strings.DefaultTitle;
    this.properties.description = this.properties.description || strings.DefaultDescription;
    this.properties.sourceKind = this.properties.sourceKind || 'library';
    this.properties.listTitleOrUrl = this.properties.listTitleOrUrl || 'Templates';
    this.properties.defaultCategory = this.properties.defaultCategory || 'General';
    this.properties.maxItems = this.properties.maxItems || 20;

    this._environmentMessage = await this._getEnvironmentMessage();
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then((context) => {
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

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const semanticColors = currentTheme.semanticColors;
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
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel,
                  multiline: true
                }),
                PropertyPaneDropdown('sourceKind', {
                  label: strings.SourceKindFieldLabel,
                  options: [
                    { key: 'library', text: strings.SourceKindLibraryLabel },
                    { key: 'list', text: strings.SourceKindListLabel }
                  ]
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleFieldLabel
                }),
                PropertyPaneTextField('defaultCategory', {
                  label: strings.DefaultCategoryFieldLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 100,
                  step: 1
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
