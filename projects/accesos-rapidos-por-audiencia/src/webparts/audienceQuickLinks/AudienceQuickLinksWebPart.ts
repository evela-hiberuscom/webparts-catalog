import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { type IReadonlyTheme } from '@microsoft/sp-component-base';
import { hiberusThemeTokens } from '@paquete/spfx-common';

import * as strings from 'AudienceQuickLinksWebPartStrings';
import AudienceQuickLinks from './components/AudienceQuickLinks';
import type { IAudienceQuickLinksProps } from './components/IAudienceQuickLinksProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type {
  IAudienceQuickLinksHostContext,
  IAudienceQuickLinksWebPartProps
} from './models/audienceLinkModels';

export default class AudienceQuickLinksWebPart extends BaseClientSideWebPart<IAudienceQuickLinksWebPartProps> {
  private _isDarkTheme = false;
  private _environmentMessage = '';

  public render(): void {
    const element: React.ReactElement<IAudienceQuickLinksProps> = React.createElement(AudienceQuickLinks, {
      webPartProps: this.properties,
      hostContext: {
        spHttpClient: this.context.spHttpClient,
        webUrl: this.context.pageContext.web.absoluteUrl,
        siteUrl: this.context.pageContext.site.absoluteUrl,
        userDisplayName: this.context.pageContext.user.displayName,
        userEmail: this.context.pageContext.user.email,
        userLoginName: this.context.pageContext.user.loginName,
        localeName: this.context.pageContext.cultureInfo.currentUICultureName
      } as IAudienceQuickLinksHostContext,
      isDarkTheme: this._isDarkTheme,
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      userDisplayName: this.context.pageContext.user.displayName
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

  protected onInit(): Promise<void> {
    this._applyThemeVariables(undefined);
    this._setDefaultProperties();

    return this._getEnvironmentMessage().then((message) => {
      this._environmentMessage = message;
    });
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    this._isDarkTheme = !!currentTheme?.isInverted;
    this._applyThemeVariables(currentTheme);
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
                  multiline: true,
                  rows: 2
                }),
                PropertyPaneDropdown('dataSourceType', {
                  label: strings.DataSourceTypeFieldLabel,
                  options: [
                    { key: 'SharePointList', text: strings.SharePointListLabel },
                    { key: 'JsonUrl', text: strings.JsonUrlLabel },
                    { key: 'StaticConfig', text: strings.StaticConfigLabel }
                  ]
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneDropdown('audienceMode', {
                  label: strings.AudienceModeFieldLabel,
                  options: [
                    { key: 'group', text: strings.GroupLabel },
                    { key: 'department', text: strings.DepartmentLabel },
                    { key: 'country', text: strings.CountryLabel },
                    { key: 'role', text: strings.RoleLabel },
                    { key: 'hybrid', text: strings.HybridLabel }
                  ]
                }),
                PropertyPaneTextField('defaultCategory', {
                  label: strings.DefaultCategoryFieldLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 24,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneToggle('showAudienceHint', {
                  label: strings.ShowAudienceHintFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private _setDefaultProperties(): void {
    this.properties.title = this.properties.title || 'Accesos rápidos por audiencia';
    this.properties.description = this.properties.description || 'Muestra accesos distintos según perfil, área, país o grupos del usuario.';
    this.properties.dataSourceType = this.properties.dataSourceType || 'StaticConfig';
    this.properties.listTitleOrUrl = this.properties.listTitleOrUrl || '';
    this.properties.audienceMode = this.properties.audienceMode || 'group';
    this.properties.defaultCategory = this.properties.defaultCategory || 'General';
    this.properties.maxItems = this.properties.maxItems || 12;
    this.properties.showAudienceHint = this.properties.showAudienceHint ?? true;
  }

  private _applyThemeVariables(currentTheme: IReadonlyTheme | undefined): void {
    const semanticColors = currentTheme?.semanticColors;
    const palette = currentTheme?.palette;

    this.domElement.style.setProperty('--aq-primary', semanticColors?.link || palette?.themePrimary || hiberusThemeTokens.palette.primary);
    this.domElement.style.setProperty(
      '--aq-primary-dark',
      semanticColors?.bodyText || palette?.themeDark || hiberusThemeTokens.palette.primaryDark
    );
    this.domElement.style.setProperty('--aq-accent', semanticColors?.linkHovered || palette?.themeDarkAlt || hiberusThemeTokens.palette.accent);
    this.domElement.style.setProperty('--aq-accent-hover', palette?.themeDarkAlt || hiberusThemeTokens.palette.accentHover);
    this.domElement.style.setProperty('--aq-text-primary', semanticColors?.bodyText || hiberusThemeTokens.palette.textPrimary);
    this.domElement.style.setProperty('--aq-text-secondary', semanticColors?.bodySubtext || hiberusThemeTokens.palette.textSecondary);
    this.domElement.style.setProperty('--aq-text-inverse', semanticColors?.buttonText || hiberusThemeTokens.palette.textInverse);
    this.domElement.style.setProperty('--aq-surface', semanticColors?.bodyBackground || hiberusThemeTokens.palette.surface);
    this.domElement.style.setProperty('--aq-border', palette?.neutralTertiary || '#3B477A');
    this.domElement.style.setProperty('--aq-font-heading', hiberusThemeTokens.typography.heading);
    this.domElement.style.setProperty('--aq-font-body', hiberusThemeTokens.typography.body);
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext().then((context) => {
        let environmentMessage = '';

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
