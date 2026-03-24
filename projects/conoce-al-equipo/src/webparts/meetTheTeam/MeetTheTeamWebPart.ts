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

import MeetTheTeam from './components/MeetTheTeam';
import type { IMeetTheTeamProps } from './components/IMeetTheTeamProps';
import type { IMeetTheTeamWebPartProps, TeamMembersDataSourceType, TeamMembersSortMode } from './models/teamMemberModels';
import { normalizeMeetTheTeamWebPartProps } from './utils/teamMemberUtils';

const SOURCE_OPTIONS: Array<{ key: TeamMembersDataSourceType; text: string }> = [
  { key: 'StaticConfig', text: 'StaticConfig' },
  { key: 'SharePointList', text: 'SharePointList' },
  { key: 'JsonUrl', text: 'JsonUrl' },
  { key: 'Directory', text: 'Directory/API' }
];

const SORT_MODE_OPTIONS: Array<{ key: TeamMembersSortMode; text: string }> = [
  { key: 'manual', text: 'Manual' },
  { key: 'role', text: 'Rol' },
  { key: 'name', text: 'Nombre' }
];

export default class MeetTheTeamWebPart extends BaseClientSideWebPart<IMeetTheTeamWebPartProps> {
  private _isDarkTheme: boolean = false;

  public async onInit(): Promise<void> {
    const normalized = normalizeMeetTheTeamWebPartProps(this.properties);
    this.properties.title = normalized.title;
    this.properties.description = normalized.description;
    this.properties.dataSourceType = normalized.dataSourceType;
    this.properties.dataSourceTypesCsv = normalized.dataSourceTypesCsv;
    this.properties.listTitleOrUrl = normalized.listTitleOrUrl;
    this.properties.jsonUrl = normalized.jsonUrl;
    this.properties.directoryEndpoint = normalized.directoryEndpoint;
    this.properties.staticMembersJson = normalized.staticMembersJson;
    this.properties.maxItems = normalized.maxItems;
    this.properties.sortMode = normalized.sortMode;
  }

  public render(): void {
    const normalized = normalizeMeetTheTeamWebPartProps(this.properties);
    const element: React.ReactElement<IMeetTheTeamProps> = React.createElement(MeetTheTeam, {
      webPartProps: normalized,
      hostContext: {
        spHttpClient: this.context.spHttpClient,
        webUrl: this.context.pageContext.web.absoluteUrl,
        siteUrl: this.context.pageContext.site.absoluteUrl
      },
      isDarkTheme: this._isDarkTheme,
      userDisplayName: this.context.pageContext.user.displayName
    });

    ReactDom.render(element, this.domElement);
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
            description: 'Configura la fuente y el orden de los miembros del equipo.'
          },
          groups: [
            {
              groupName: 'Contenido',
              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Título',
                  value: 'Conoce al equipo'
                }),
                PropertyPaneTextField('description', {
                  label: 'Descripción',
                  multiline: true,
                  rows: 3
                }),
                PropertyPaneDropdown('dataSourceType', {
                  label: 'Fuente principal',
                  options: SOURCE_OPTIONS
                }),
                PropertyPaneTextField('dataSourceTypesCsv', {
                  label: 'Orden de fuentes (CSV)',
                  description: 'Ejemplo: StaticConfig,SharePointList,JsonUrl,Directory'
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: 'Lista de miembros (título o URL)',
                  description: 'Soporta título o URL same-origin, incluyendo vistas /Forms/AllItems.aspx'
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: 'JsonUrl same-origin',
                  description: 'Úsalo para cargar un JSON alojado en el mismo sitio.'
                }),
                PropertyPaneTextField('directoryEndpoint', {
                  label: 'Directory/API same-origin',
                  description: 'Endpoint opcional para enriquecer perfiles de equipo.'
                }),
                PropertyPaneTextField('staticMembersJson', {
                  label: 'Miembros estáticos JSON',
                  multiline: true,
                  rows: 10
                })
              ]
            },
            {
              groupName: 'Orden y tamaño',
              groupFields: [
                PropertyPaneDropdown('sortMode', {
                  label: 'Modo de ordenación',
                  options: SORT_MODE_OPTIONS
                }),
                PropertyPaneSlider('maxItems', {
                  label: 'Máximo de miembros',
                  min: 1,
                  max: 50,
                  step: 1,
                  value: 12
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
