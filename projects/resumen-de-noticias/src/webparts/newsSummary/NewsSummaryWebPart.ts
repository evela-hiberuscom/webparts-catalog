import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { SPHttpClient } from '@microsoft/sp-http';

import * as strings from 'NewsSummaryWebPartStrings';
import NewsSummary from './components/NewsSummary';
import type { INewsSummaryProps } from './components/INewsSummaryProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import { NewsSummaryRepository } from './repositories/newsSummaryRepository';
import { NewsSummaryService } from './services/newsSummaryService';

export interface INewsSummaryWebPartProps {
  title: string;
  description: string;
  sitePagesListTitle: string;
  maxItems: number;
  featuredFirst: boolean;
}

export default class NewsSummaryWebPart extends BaseClientSideWebPart<INewsSummaryWebPartProps> {
  private _isDarkTheme = false;
  private _environmentMessage = '';

  public render(): void {
    const service = new NewsSummaryService(new NewsSummaryRepository({
      spHttpClient: this.context.spHttpClient,
      spHttpClientConfiguration: SPHttpClient.configurations.v1,
      webAbsoluteUrl: this.context.pageContext.web.absoluteUrl
    }));

    const element: React.ReactElement<INewsSummaryProps> = React.createElement(NewsSummary, {
      configuration: {
        title: this.properties.title,
        description: this.properties.description,
        sitePagesListTitle: this.properties.sitePagesListTitle,
        maxItems: this.properties.maxItems,
        featuredFirst: this.properties.featuredFirst
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
    this.properties.sitePagesListTitle = this.properties.sitePagesListTitle || 'Site Pages';
    this.properties.maxItems = this.properties.maxItems || 4;
    if (typeof this.properties.featuredFirst !== 'boolean') {
      this.properties.featuredFirst = true;
    }

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
                PropertyPaneTextField('sitePagesListTitle', {
                  label: strings.SitePagesListFieldLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 12,
                  step: 1
                }),
                PropertyPaneToggle('featuredFirst', {
                  label: strings.FeaturedFirstFieldLabel,
                  onText: strings.ToggleOnLabel,
                  offText: strings.ToggleOffLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
