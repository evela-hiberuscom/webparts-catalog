import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import {
  IPropertyPaneConfiguration,
  IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { hiberusThemeTokens } from '@paquete/spfx-common';

import * as strings from 'UniversalAppLauncherWebPartStrings';
import UniversalAppLauncher from './components/UniversalAppLauncher';
import type { IUniversalAppLauncherProps } from './components/IUniversalAppLauncherProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type { AudienceMatchMode } from './models/launchModels';

export interface IUniversalAppLauncherWebPartProps {
  title: string;
  subtitle: string;
  audienceMode: AudienceMatchMode;
  currentAudienceTokens: string;
  defaultCategory: string;
  maxItems: number;
  openInNewTab: boolean;
  launchItemsJson: string;
}

const audienceModeOptions: IPropertyPaneDropdownOption[] = [
  { key: 'department', text: 'Department' },
  { key: 'country', text: 'Country' },
  { key: 'group', text: 'Group' },
  { key: 'role', text: 'Role' },
  { key: 'hybrid', text: 'Hybrid' }
];

const DEFAULT_LAUNCH_ITEMS_JSON = `[
  {
    "id": "portal-general",
    "title": "Portal general",
    "category": "General",
    "audienceTokens": ["general", "all"],
    "description": "Entrada genérica a recursos corporativos de uso común.",
    "iconName": "Page",
    "priority": 1,
    "featured": true,
    "openUrl": "/sites/home"
  },
  {
    "id": "portal-people",
    "title": "Portal Personas",
    "category": "RRHH",
    "audienceTokens": ["people", "hr"],
    "description": "Acceso a políticas, incidencias y formularios del equipo de personas.",
    "iconName": "Contact",
    "priority": 2,
    "featured": true,
    "openUrl": "/sites/hr"
  },
  {
    "id": "portal-ops",
    "title": "Soporte operativo",
    "category": "Operaciones",
    "audienceTokens": ["operations", "ops", "it"],
    "description": "Canal de soporte y acceso a servicios internos de operación.",
    "iconName": "Help",
    "priority": 3,
    "featured": false,
    "openUrl": "/sites/support"
  }
]`;

export default class UniversalAppLauncherWebPart extends BaseClientSideWebPart<IUniversalAppLauncherWebPartProps> {
  private _isDarkTheme: boolean = false;

  private _environmentMessage: string = '';

  protected async onInit(): Promise<void> {
    this.properties.title = this.properties.title ?? 'Lanzador universal de accesos';
    this.properties.subtitle =
      this.properties.subtitle ?? 'Muestra un grid configurable de accesos a apps, sites, formularios y utilidades corporativas.';
    this.properties.audienceMode = this.properties.audienceMode ?? 'group';
    this.properties.currentAudienceTokens = this.properties.currentAudienceTokens ?? 'general';
    this.properties.defaultCategory = this.properties.defaultCategory ?? 'All';
    this.properties.maxItems = this.properties.maxItems ?? 8;
    this.properties.openInNewTab = this.properties.openInNewTab ?? false;
    this.properties.launchItemsJson = this.properties.launchItemsJson ?? DEFAULT_LAUNCH_ITEMS_JSON;

    this._environmentMessage = await this._getEnvironmentMessage();
  }

  public render(): void {
    const element: React.ReactElement<IUniversalAppLauncherProps> = React.createElement(UniversalAppLauncher, {
      title: this.properties.title ?? 'Lanzador universal de accesos',
      subtitle:
        this.properties.subtitle ?? 'Muestra un grid configurable de accesos a apps, sites, formularios y utilidades corporativas.',
      audienceMode: this.properties.audienceMode ?? 'group',
      currentAudienceTokens: this.properties.currentAudienceTokens ?? 'general',
      defaultCategory: this.properties.defaultCategory ?? 'All',
      maxItems: this.properties.maxItems ?? 8,
      openInNewTab: this.properties.openInNewTab ?? false,
      launchItemsJson: this.properties.launchItemsJson ?? DEFAULT_LAUNCH_ITEMS_JSON,
      isDarkTheme: this._isDarkTheme,
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      userDisplayName: this.context.pageContext.user.displayName ?? ''
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

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    this.domElement.style.setProperty('--app-primary', semanticColors?.link ?? hiberusThemeTokens.palette.primary);
    this.domElement.style.setProperty(
      '--app-primary-hover',
      semanticColors?.linkHovered ?? hiberusThemeTokens.palette.accentHover
    );
    this.domElement.style.setProperty('--app-surface', semanticColors?.bodyBackground ?? hiberusThemeTokens.palette.surface);
    this.domElement.style.setProperty('--app-text', semanticColors?.bodyText ?? hiberusThemeTokens.palette.textPrimary);
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
                PropertyPaneDropdown('audienceMode', {
                  label: strings.AudienceModeFieldLabel,
                  selectedKey: this.properties.audienceMode ?? 'group',
                  options: audienceModeOptions
                }),
                PropertyPaneTextField('currentAudienceTokens', {
                  label: strings.CurrentAudienceTokensFieldLabel,
                  description: strings.CurrentAudienceTokensFieldDescription
                }),
                PropertyPaneTextField('defaultCategory', {
                  label: strings.DefaultCategoryFieldLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 24,
                  step: 1,
                  value: this.properties.maxItems ?? 8,
                  showValue: true
                }),
                PropertyPaneToggle('openInNewTab', {
                  label: strings.OpenInNewTabFieldLabel
                }),
                PropertyPaneTextField('launchItemsJson', {
                  label: strings.LaunchItemsJsonFieldLabel,
                  multiline: true,
                  rows: 12
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private async _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      const context = await this.context.sdks.microsoftTeams.teamsJs.app.getContext();

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
    }

    return this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment;
  }
}
