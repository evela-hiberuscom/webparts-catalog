import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneToggle,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'DailyPulseWebPartStrings';
import DailyPulse from './components/DailyPulse';
import { IDailyPulseProps } from './components/IDailyPulseProps';
import type { IDailyPulseWebPartProps } from './models/dailyPulseModels';
import { DEFAULT_DAILY_PULSE_PROMPT, serializePrompt } from './utils/dailyPulseUtils';

const DEFAULT_PROMPT_JSON = serializePrompt(DEFAULT_DAILY_PULSE_PROMPT);

export default class DailyPulseWebPart extends BaseClientSideWebPart<IDailyPulseWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IDailyPulseProps> = React.createElement(DailyPulse, {
      title: this.properties.title,
      subtitle: this.properties.subtitle,
      sourceType: this.properties.sourceType,
      webUrl: this.properties.webUrl,
      listTitleOrUrl: this.properties.listTitleOrUrl,
      jsonUrl: this.properties.jsonUrl,
      apiEndpointUrl: this.properties.apiEndpointUrl,
      promptJson: this.properties.promptJson,
      oneResponsePerDay: this.properties.oneResponsePerDay,
      submitLabel: this.properties.submitLabel,
      userDisplayName: this.context.pageContext.user.displayName,
      userLoginName: this.context.pageContext.user.loginName
    });

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    this.properties.title ??= 'Pulso del día';
    this.properties.subtitle ??= 'Una señal diaria mínima para tomar temperatura del equipo.';
    this.properties.sourceType ??= 'SharePointList';
    this.properties.webUrl ??= this.context.pageContext.web.absoluteUrl;
    this.properties.listTitleOrUrl ??= '';
    this.properties.jsonUrl ??= '';
    this.properties.apiEndpointUrl ??= '';
    this.properties.promptJson ??= '';
    this.properties.oneResponsePerDay ??= true;
    this.properties.submitLabel ??= 'Registrar pulso';

    if (
      this.properties.sourceType === 'SharePointList' &&
      !this.properties.listTitleOrUrl &&
      !this.properties.jsonUrl &&
      !this.properties.apiEndpointUrl &&
      !this.properties.promptJson
    ) {
      this.properties.sourceType = 'StaticConfig';
      this.properties.promptJson = DEFAULT_PROMPT_JSON;
    }

    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
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
                  multiline: true,
                  rows: 2
                }),
                PropertyPaneDropdown('sourceType', {
                  label: strings.SourceTypeFieldLabel,
                  options: [
                    { key: 'SharePointList', text: 'SharePointList' },
                    { key: 'JsonUrl', text: 'JsonUrl' },
                    { key: 'ApiEndpoint', text: 'ApiEndpoint' },
                    { key: 'StaticConfig', text: 'StaticConfig' }
                  ]
                }),
                PropertyPaneTextField('webUrl', {
                  label: strings.WebUrlFieldLabel
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: strings.JsonUrlFieldLabel
                }),
                PropertyPaneTextField('apiEndpointUrl', {
                  label: strings.ApiEndpointFieldLabel
                }),
                PropertyPaneTextField('promptJson', {
                  label: strings.PromptJsonFieldLabel,
                  multiline: true,
                  rows: 8
                }),
                PropertyPaneToggle('oneResponsePerDay', {
                  label: strings.OneResponsePerDayFieldLabel
                }),
                PropertyPaneTextField('submitLabel', {
                  label: strings.SubmitLabelFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
