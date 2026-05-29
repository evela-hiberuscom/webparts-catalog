import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle,
  type IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'TeamAgendaWebPartStrings';
import TeamAgenda from './components/TeamAgenda';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type { ITeamAgendaProps } from './components/ITeamAgendaProps';
import type { ITeamAgendaWebPartProps } from './models/teamAgendaModels';
import { TeamAgendaService } from './services/teamAgendaService';

export default class TeamAgendaWebPart extends BaseClientSideWebPart<ITeamAgendaWebPartProps> {
  private readonly _service: TeamAgendaService = new TeamAgendaService();
  private _isDarkTheme = false;
  private _environmentMessage = '';

  public render(): void {
    const element: React.ReactElement<ITeamAgendaProps> = React.createElement(TeamAgenda, {
      configuration: {
        title: this.properties.title,
        description: this.properties.description,
        dataSourceType: this.properties.dataSourceType,
        listTitleOrUrl: this.properties.listTitleOrUrl,
        maxItems: this.properties.maxItems,
        showPast: this.properties.showPast,
        defaultTypeFilter: this.properties.defaultTypeFilter,
        webUrl: this.context.pageContext.web.absoluteUrl,
        localeName: this.context.pageContext.cultureInfo.currentUICultureName || 'es-ES'
      },
      service: this._service,
      localeName: this.context.pageContext.cultureInfo.currentUICultureName || 'es-ES',
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      isDarkTheme: this._isDarkTheme
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
    this.properties.title ||= strings.DefaultWebPartTitle;
    this.properties.description ||= strings.DefaultWebPartDescription;
    this.properties.dataSourceType ||= 'StaticConfig';
    this.properties.listTitleOrUrl ||= 'AgendaList';
    this.properties.maxItems ||= 6;
    this.properties.showPast ??= false;
    this.properties.defaultTypeFilter ||= '';
    this._environmentMessage = await this._getEnvironmentMessage();
  }

  private _getEnvironmentMessage(): Promise<string> {
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

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme?.semanticColors) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    this._setThemeProperty('--bodyText', currentTheme.semanticColors.bodyText);
    this._setThemeProperty('--link', currentTheme.semanticColors.link);
    this._setThemeProperty('--linkHovered', currentTheme.semanticColors.linkHovered);
  }

  private _setThemeProperty(name: string, value: string | undefined): void {
    if (value) {
      this.domElement.style.setProperty(name, value);
      return;
    }

    this.domElement.style.removeProperty(name);
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
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneDropdown('dataSourceType', {
                  label: strings.DataSourceTypeFieldLabel,
                  options: [
                    { key: 'Calendar', text: strings.DataSourceCalendarLabel },
                    { key: 'SharePointList', text: strings.DataSourceSharePointListLabel },
                    { key: 'JsonUrl', text: strings.DataSourceJsonUrlLabel },
                    { key: 'StaticConfig', text: strings.DataSourceStaticConfigLabel }
                  ]
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 12,
                  showValue: true,
                  value: this.properties.maxItems ?? 6
                }),
                PropertyPaneToggle('showPast', {
                  label: strings.ShowPastFieldLabel
                }),
                PropertyPaneTextField('defaultTypeFilter', {
                  label: strings.DefaultTypeFilterFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
