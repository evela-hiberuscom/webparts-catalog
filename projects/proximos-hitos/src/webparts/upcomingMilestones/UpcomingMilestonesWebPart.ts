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

import * as strings from 'UpcomingMilestonesWebPartStrings';
import UpcomingMilestones from './components/UpcomingMilestones';
import type { IUpcomingMilestonesProps } from './components/IUpcomingMilestonesProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import { UpcomingMilestonesRepository } from './repositories/upcomingMilestonesRepository';
import { UpcomingMilestonesService } from './services/upcomingMilestonesService';
import type { UpcomingMilestonesViewMode } from './models/upcomingMilestonesModels';

export interface IUpcomingMilestonesWebPartProps {
  title: string;
  description: string;
  listTitleOrUrl: string;
  maxItems: number;
  viewMode: UpcomingMilestonesViewMode;
}

export default class UpcomingMilestonesWebPart extends BaseClientSideWebPart<IUpcomingMilestonesWebPartProps> {
  private _isDarkTheme = false;
  private _environmentMessage = '';

  public render(): void {
    const service = new UpcomingMilestonesService(new UpcomingMilestonesRepository({
      spHttpClient: this.context.spHttpClient,
      spHttpClientConfiguration: SPHttpClient.configurations.v1,
      webAbsoluteUrl: this.context.pageContext.web.absoluteUrl
    }));

    const element: React.ReactElement<IUpcomingMilestonesProps> = React.createElement(UpcomingMilestones, {
      configuration: {
        title: this.properties.title,
        description: this.properties.description,
        listTitleOrUrl: this.properties.listTitleOrUrl,
        maxItems: this.properties.maxItems,
        viewMode: this.properties.viewMode
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
    this.properties.listTitleOrUrl = this.properties.listTitleOrUrl || 'MilestonesList';
    this.properties.maxItems = this.properties.maxItems || 5;
    this.properties.viewMode = this.properties.viewMode || 'timeline';

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
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleFieldLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 20,
                  step: 1
                }),
                PropertyPaneDropdown('viewMode', {
                  label: strings.ViewModeFieldLabel,
                  options: [
                    { key: 'timeline', text: strings.ViewModeTimelineLabel },
                    { key: 'list', text: strings.ViewModeListLabel }
                  ]
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
