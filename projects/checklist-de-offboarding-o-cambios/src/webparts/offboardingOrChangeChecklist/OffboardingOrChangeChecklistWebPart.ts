import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  PropertyPaneDropdown,
  PropertyPaneTextField,
  type IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import OffboardingOrChangeChecklist from './components/OffboardingOrChangeChecklist';
import type { IOffboardingOrChangeChecklistProps } from './components/IOffboardingOrChangeChecklistProps';
import type { IOffboardingOrChangeChecklistWebPartProps } from './models/offboardingOrChangeChecklistModels';

const SCENARIO_OPTIONS = [
  { key: 'generic', text: 'General' },
  { key: 'offboarding', text: 'Offboarding' },
  { key: 'transfer', text: 'Transferencia' },
  { key: 'roleChange', text: 'Cambio de rol' }
];

export default class OffboardingOrChangeChecklistWebPart extends BaseClientSideWebPart<IOffboardingOrChangeChecklistWebPartProps> {
  private _isDarkTheme = false;
  private _environmentMessage = '';

  public render(): void {
    const element: React.ReactElement<IOffboardingOrChangeChecklistProps> = React.createElement(OffboardingOrChangeChecklist, {
      title: this.properties.title ?? 'Checklist de offboarding o cambios',
      description: this.properties.description ?? 'Organiza pasos de salida, transferencia o cambio organizativo.',
      dataSourceType: this.properties.dataSourceType ?? 'SharePointList',
      webUrl: this.properties.webUrl || this.context.pageContext.web.absoluteUrl,
      listTitleOrUrl: this.properties.listTitleOrUrl ?? 'OffboardingChecklistList',
      jsonUrl: this.properties.jsonUrl ?? '',
      staticConfigJson: this.properties.staticConfigJson ?? '',
      defaultScenario: this.properties.defaultScenario ?? 'generic',
      defaultPhase: this.properties.defaultPhase ?? '',
      isDarkTheme: this._isDarkTheme,
      environmentMessage: this._environmentMessage,
      hasTeamsContext: !!this.context.sdks.microsoftTeams,
      userDisplayName: this.context.pageContext.user.displayName
    });

    ReactDom.render(element, this.domElement);
  }

  protected async onInit(): Promise<void> {
    this.properties.title = this.properties.title ?? 'Checklist de offboarding o cambios';
    this.properties.description =
      this.properties.description ?? 'Organiza pasos de salida, transferencia o cambio organizativo para evitar omisiones operativas y de acceso.';
    this.properties.dataSourceType = this.properties.dataSourceType ?? 'SharePointList';
    this.properties.webUrl = this.properties.webUrl || this.context.pageContext.web.absoluteUrl;
    this.properties.listTitleOrUrl = this.properties.listTitleOrUrl ?? 'OffboardingChecklistList';
    this.properties.jsonUrl = this.properties.jsonUrl ?? '';
    this.properties.staticConfigJson = this.properties.staticConfigJson ?? '';
    this.properties.defaultScenario = this.properties.defaultScenario ?? 'generic';
    this.properties.defaultPhase = this.properties.defaultPhase ?? '';
    this._environmentMessage = this.context.isServedFromLocalhost
      ? 'Running in the local workbench'
      : 'Running in SharePoint';
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
            description: 'Configura la fuente y el escenario por defecto'
          },
          groups: [
            {
              groupName: 'Contenido',
              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Titulo'
                }),
                PropertyPaneTextField('description', {
                  label: 'Descripcion',
                  multiline: true,
                  rows: 3
                }),
                PropertyPaneDropdown('dataSourceType', {
                  label: 'Origen de datos',
                  options: [
                    { key: 'SharePointList', text: 'SharePointList' },
                    { key: 'JsonUrl', text: 'JsonUrl' },
                    { key: 'StaticConfig', text: 'StaticConfig' }
                  ]
                }),
                PropertyPaneTextField('webUrl', {
                  label: 'Web URL'
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: 'Lista o URL same-origin'
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: 'JSON URL same-origin'
                }),
                PropertyPaneTextField('staticConfigJson', {
                  label: 'Static config JSON',
                  multiline: true,
                  rows: 6
                }),
                PropertyPaneDropdown('defaultScenario', {
                  label: 'Escenario por defecto',
                  options: SCENARIO_OPTIONS
                }),
                PropertyPaneTextField('defaultPhase', {
                  label: 'Fase por defecto'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
