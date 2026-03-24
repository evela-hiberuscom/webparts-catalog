import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneChoiceGroup,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'EventCountdownWebPartStrings';
import EventCountdown from './components/EventCountdown';
import type { IEventCountdownProps } from './components/IEventCountdownProps';
import type { CountdownSourceType, ICountdownWebPartConfig } from './models/eventCountdownModels';

export interface IEventCountdownWebPartProps {
  sourceType?: CountdownSourceType;
  eventTitle?: string;
  targetDate?: string;
  subtitle?: string;
  detailUrl?: string;
  showCompleted?: boolean;
  jsonUrl?: string;
  listTitleOrUrl?: string;
  titleField?: string;
  targetDateField?: string;
  subtitleField?: string;
  detailUrlField?: string;
  refreshIntervalSeconds?: number | string;
}

export default class EventCountdownWebPart extends BaseClientSideWebPart<IEventCountdownWebPartProps> {
  private _isDarkTheme = false;
  private _environmentMessage = '';

  public render(): void {
    const element: React.ReactElement<IEventCountdownProps> = React.createElement(EventCountdown, {
      config: this._buildConfig(),
      isDarkTheme: this._isDarkTheme,
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      userDisplayName: this.context.pageContext.user.displayName
    });

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    this.properties.sourceType = this.properties.sourceType ?? 'StaticConfig';
    this.properties.eventTitle = this.properties.eventTitle ?? 'Cuenta atrás a eventos';
    this.properties.targetDate = this.properties.targetDate ?? '';
    this.properties.subtitle = this.properties.subtitle ?? '';
    this.properties.detailUrl = this.properties.detailUrl ?? '';
    this.properties.showCompleted = this.properties.showCompleted ?? false;
    this.properties.jsonUrl = this.properties.jsonUrl ?? '';
    this.properties.listTitleOrUrl = this.properties.listTitleOrUrl ?? '';
    this.properties.titleField = this.properties.titleField ?? 'Title';
    this.properties.targetDateField = this.properties.targetDateField ?? 'TargetDate';
    this.properties.subtitleField = this.properties.subtitleField ?? 'Subtitle';
    this.properties.detailUrlField = this.properties.detailUrlField ?? 'DetailUrl';
    this.properties.refreshIntervalSeconds = this.properties.refreshIntervalSeconds ?? 60;

    return this._getEnvironmentMessage().then((message) => {
      this._environmentMessage = message;
    });
  }

  private _buildConfig(): ICountdownWebPartConfig {
    return {
      sourceType: this.properties.sourceType ?? 'StaticConfig',
      eventTitle: this.properties.eventTitle?.trim() || 'Cuenta atrás a eventos',
      targetDate: this.properties.targetDate?.trim() || '',
      subtitle: this.properties.subtitle?.trim() || undefined,
      detailUrl: this.properties.detailUrl?.trim() || undefined,
      showCompleted: this.properties.showCompleted ?? false,
      jsonUrl: this.properties.jsonUrl?.trim() || undefined,
      listTitleOrUrl: this.properties.listTitleOrUrl?.trim() || undefined,
      titleField: this.properties.titleField?.trim() || undefined,
      targetDateField: this.properties.targetDateField?.trim() || undefined,
      subtitleField: this.properties.subtitleField?.trim() || undefined,
      detailUrlField: this.properties.detailUrlField?.trim() || undefined,
      refreshIntervalSeconds: Math.max(15, Number(this.properties.refreshIntervalSeconds ?? 60) || 60),
      webUrl: this.context.pageContext.web.absoluteUrl
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
              groupName: strings.SourceGroupName,
              groupFields: [
                PropertyPaneChoiceGroup('sourceType', {
                  label: strings.SourceTypeFieldLabel,
                  options: [
                    { key: 'StaticConfig', text: strings.SourceTypeStaticLabel },
                    { key: 'SharePointList', text: strings.SourceTypeSharePointListLabel },
                    { key: 'JsonUrl', text: strings.SourceTypeJsonUrlLabel }
                  ]
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: strings.JsonUrlFieldLabel
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                })
              ]
            },
            {
              groupName: strings.EventGroupName,
              groupFields: [
                PropertyPaneTextField('eventTitle', {
                  label: strings.EventTitleFieldLabel
                }),
                PropertyPaneTextField('targetDate', {
                  label: strings.TargetDateFieldLabel
                }),
                PropertyPaneTextField('subtitle', {
                  label: strings.SubtitleFieldLabel
                }),
                PropertyPaneTextField('detailUrl', {
                  label: strings.DetailUrlFieldLabel
                })
              ]
            },
            {
              groupName: strings.MappingGroupName,
              groupFields: [
                PropertyPaneTextField('titleField', {
                  label: strings.TitleFieldLabel
                }),
                PropertyPaneTextField('targetDateField', {
                  label: strings.TargetDateFieldLabelList
                }),
                PropertyPaneTextField('subtitleField', {
                  label: strings.SubtitleFieldLabelList
                }),
                PropertyPaneTextField('detailUrlField', {
                  label: strings.DetailUrlFieldLabelList
                })
              ]
            },
            {
              groupName: strings.BehaviorGroupName,
              groupFields: [
                PropertyPaneToggle('showCompleted', {
                  label: strings.ShowCompletedFieldLabel
                }),
                PropertyPaneTextField('refreshIntervalSeconds', {
                  label: strings.RefreshIntervalFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
