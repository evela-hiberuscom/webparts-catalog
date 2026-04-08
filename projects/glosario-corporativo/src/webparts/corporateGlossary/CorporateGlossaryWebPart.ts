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

import * as strings from 'CorporateGlossaryWebPartStrings';
import CorporateGlossary from './components/CorporateGlossary';
import type { ICorporateGlossaryProps } from './components/ICorporateGlossaryProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import { CorporateGlossaryRepository } from './repositories/corporateGlossaryRepository';
import { CorporateGlossaryService } from './services/corporateGlossaryService';

export interface ICorporateGlossaryWebPartProps {
  title: string;
  description: string;
  listTitle: string;
  defaultCategory: string;
  maxItems: number;
  enableAlphabetNav: boolean;
}

export default class CorporateGlossaryWebPart extends BaseClientSideWebPart<ICorporateGlossaryWebPartProps> {
  private _isDarkTheme = false;
  private _environmentMessage = '';

  public render(): void {
    const service = new CorporateGlossaryService(new CorporateGlossaryRepository({
      spHttpClient: this.context.spHttpClient,
      spHttpClientConfiguration: SPHttpClient.configurations.v1,
      webAbsoluteUrl: this.context.pageContext.web.absoluteUrl
    }));

    const element: React.ReactElement<ICorporateGlossaryProps> = React.createElement(CorporateGlossary, {
      configuration: {
        title: this.properties.title,
        description: this.properties.description,
        listTitle: this.properties.listTitle,
        defaultCategory: this.properties.defaultCategory,
        maxItems: this.properties.maxItems,
        enableAlphabetNav: this.properties.enableAlphabetNav
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
    this.properties.listTitle = this.properties.listTitle || 'Glossary';
    this.properties.defaultCategory = this.properties.defaultCategory || 'General';
    this.properties.maxItems = this.properties.maxItems || 200;
    if (typeof this.properties.enableAlphabetNav !== 'boolean') {
      this.properties.enableAlphabetNav = true;
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
                PropertyPaneTextField('listTitle', {
                  label: strings.ListTitleFieldLabel
                }),
                PropertyPaneTextField('defaultCategory', {
                  label: strings.DefaultCategoryFieldLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 1000,
                  step: 1
                }),
                PropertyPaneToggle('enableAlphabetNav', {
                  label: strings.EnableAlphabetNavFieldLabel,
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
