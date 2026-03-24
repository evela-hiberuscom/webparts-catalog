import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  type IPropertyPaneDropdownOption,
  PropertyPaneDropdown,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'OnboardingChecklistWebPartStrings';
import OnboardingChecklist from './components/OnboardingChecklist';
import type { IOnboardingChecklistProps } from './components/IOnboardingChecklistProps';
import type { IOnboardingChecklistWebPartProps } from './models/onboardingChecklistModels';

const DEFAULT_WEB_PART_PROPS: IOnboardingChecklistWebPartProps = {
  title: 'Checklist de onboarding',
  description: 'Checklist secuencial para acompañar la incorporacion, priorizando pasos obligatorios, fase actual y recursos relacionados.',
  dataSourceType: 'StaticConfig',
  webUrl: 'https://contoso.sharepoint.com/sites/onboarding',
  listTitleOrUrl: 'OnboardingChecklistList',
  jsonUrl: '',
  staticConfigJson:
    '[{ "Id": "1", "Title": "Revisar bienvenida", "Description": "Compartir contexto y contactos clave.", "Phase": "Inicio", "Variant": "General", "Mandatory": true, "Order": 1, "RelatedUrl": "/sites/onboarding/Documentos/Bienvenida" }, { "Id": "2", "Title": "Completar perfil", "Description": "Confirmar foto, cargo y localizacion.", "Phase": "Inicio", "Variant": "Nuevo ingreso", "Mandatory": true, "Order": 2, "RelatedUrl": "/sites/onboarding/Documentos/Perfil" }, { "Id": "3", "Title": "Activar accesos", "Description": "Validar permisos a aplicaciones y grupos necesarios.", "Phase": "Configuracion", "Variant": "General", "Mandatory": true, "Order": 3, "RelatedUrl": "/sites/onboarding/Documentos/Accesos" }, { "Id": "4", "Title": "Formacion inicial", "Description": "Completar formacion obligatoria y guias base.", "Phase": "Aprendizaje", "Variant": "General", "Mandatory": false, "Order": 4, "RelatedUrl": "/sites/onboarding/Documentos/Formacion" }]',
  defaultVariant: 'all',
  defaultPhase: 'all'
};

const DATA_SOURCE_OPTIONS: IPropertyPaneDropdownOption[] = [
  { key: 'StaticConfig', text: 'Configuracion local' },
  { key: 'SharePointList', text: 'Lista SharePoint' },
  { key: 'JsonUrl', text: 'URL JSON same-origin' }
];

export default class OnboardingChecklistWebPart extends BaseClientSideWebPart<IOnboardingChecklistWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public async onInit(): Promise<void> {
    this._environmentMessage = await this._getEnvironmentMessage();
  }

  public render(): void {
    const props = {
      ...DEFAULT_WEB_PART_PROPS,
      ...this.properties
    };

    const element: React.ReactElement<IOnboardingChecklistProps> = React.createElement(OnboardingChecklist, {
      ...props,
      isDarkTheme: this._isDarkTheme,
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      userDisplayName: this.context.pageContext.user.displayName
    });

    ReactDom.render(element, this.domElement);
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
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel
                }),
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel,
                  multiline: true,
                  rows: 3
                }),
                PropertyPaneDropdown('dataSourceType', {
                  label: strings.DataSourceTypeFieldLabel,
                  options: DATA_SOURCE_OPTIONS
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
                PropertyPaneTextField('staticConfigJson', {
                  label: strings.StaticConfigJsonFieldLabel,
                  multiline: true,
                  rows: 6
                }),
                PropertyPaneTextField('defaultVariant', {
                  label: strings.DefaultVariantFieldLabel
                }),
                PropertyPaneTextField('defaultPhase', {
                  label: strings.DefaultPhaseFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
