import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle,
  type IPropertyPaneDropdownOption
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'PersonalFavoritesWebPartStrings';
import PersonalFavorites from './components/PersonalFavorites';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type { IPersonalFavoritesWebPartProps } from './models/favoritesTypes';

const DEFAULT_FAVORITES_JSON = `[
  {
    "id": "portal-comercial",
    "title": "Portal Comercial",
    "description": "Acceso rápido a campañas, recursos y materiales de negocio.",
    "openUrl": "/sites/comercial",
    "icon": "WorkforceManagement",
    "type": "site",
    "category": "Negocio",
    "featured": true,
    "sortOrder": 1
  },
  {
    "id": "docs-utiles",
    "title": "Mis documentos útiles",
    "description": "Plantillas y documentos de uso recurrente.",
    "openUrl": "/sites/documentos-utiles",
    "icon": "Page",
    "type": "document",
    "category": "Documentos",
    "featured": false,
    "sortOrder": 2
  }
]`;

const dataSourceOptions: IPropertyPaneDropdownOption[] = [
  { key: 'StaticConfig', text: 'Configuración estática' },
  { key: 'SharePointList', text: 'Lista SharePoint' }
];

export default class PersonalFavoritesWebPart extends BaseClientSideWebPart<IPersonalFavoritesWebPartProps> {

  public render(): void {
    const element: React.ReactElement = React.createElement(
      PersonalFavorites,
      {
        title: this.properties.title,
        description: this.properties.description,
        dataSourceType: this.properties.dataSourceType,
        listTitleOrUrl: this.properties.listTitleOrUrl,
        maxItems: this.properties.maxItems,
        showMetadata: this.properties.showMetadata,
        favoritesJson: this.properties.favoritesJson,
        userDisplayName: this.context.pageContext.user.displayName,
        webPartContext: this.context
      }
    );

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
    this.properties.title ??= 'Favoritos personales';
    this.properties.description ??= 'Accesos personales que vuelves a usar a diario.';
    this.properties.dataSourceType ??= 'StaticConfig';
    this.properties.listTitleOrUrl ??= 'FavoritesList';
    this.properties.maxItems ??= 8;
    this.properties.showMetadata ??= true;
    this.properties.favoritesJson ??= DEFAULT_FAVORITES_JSON;
    return Promise.resolve();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const dataSourceType = this.properties.dataSourceType ?? 'StaticConfig';
    const isSharePointList = dataSourceType === 'SharePointList';

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
                  options: dataSourceOptions
                }),
                ...(isSharePointList
                  ? [
                      PropertyPaneTextField('listTitleOrUrl', {
                        label: strings.ListTitleOrUrlFieldLabel
                      })
                    ]
                  : []),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 24,
                  value: this.properties.maxItems ?? 8,
                  showValue: true
                }),
                PropertyPaneToggle('showMetadata', {
                  label: strings.ShowMetadataFieldLabel
                }),
                ...(!isSharePointList
                  ? [
                      PropertyPaneTextField('favoritesJson', {
                        label: strings.FavoritesJsonFieldLabel,
                        multiline: true,
                        rows: 10
                      })
                    ]
                  : [])
              ]
            }
          ]
        }
      ]
    };
  }
}
