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

import KpiMiniCards from './components/KpiMiniCards';
import type { IKpiMiniCardsProps } from './components/IKpiMiniCardsProps';
import * as strings from 'KpiMiniCardsWebPartStrings';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type { KpiLayoutMode, KpiSourceType } from './models/kpiModels';
import { DEFAULT_KPI_CARD_JSON } from './models/kpiModels';

export interface IKpiMiniCardsWebPartProps {
  title: string;
  subtitle: string;
  layoutMode: KpiLayoutMode;
  sourceType: KpiSourceType;
  kpiCardsJson: string;
  jsonUrl: string;
  apiEndpointUrl: string;
  listTitleOrUrl: string;
  showTrend: boolean;
  maxItems: number;
  openInNewTab: boolean;
}

const DEFAULT_PROPERTIES: IKpiMiniCardsWebPartProps = {
  title: 'KPI mini-cards',
  subtitle: 'Métricas clave para leer el estado del equipo al instante.',
  layoutMode: 'compact',
  sourceType: 'StaticConfig',
  kpiCardsJson: DEFAULT_KPI_CARD_JSON,
  jsonUrl: '',
  apiEndpointUrl: '',
  listTitleOrUrl: 'KpiList',
  showTrend: true,
  maxItems: 20,
  openInNewTab: false
};

const SOURCE_TYPE_OPTIONS = [
  { key: 'StaticConfig', text: 'StaticConfig' },
  { key: 'JsonUrl', text: 'JsonUrl' },
  { key: 'SharePointList', text: 'SharePointList' },
  { key: 'ApiEndpoint', text: 'ApiEndpoint' }
];

const LAYOUT_MODE_OPTIONS = [
  { key: 'standard', text: 'Standard' },
  { key: 'compact', text: 'Compact' }
];

export default class KpiMiniCardsWebPart extends BaseClientSideWebPart<IKpiMiniCardsWebPartProps> {
  public async onInit(): Promise<void> {
    Object.assign(this.properties, DEFAULT_PROPERTIES, this.properties);
    const legacyProperties = this.properties as IKpiMiniCardsWebPartProps & { sharePointListTitle?: string };
    if (!this.properties.listTitleOrUrl && legacyProperties.sharePointListTitle) {
      this.properties.listTitleOrUrl = legacyProperties.sharePointListTitle;
    }
  }

  public render(): void {
    const element: React.ReactElement<IKpiMiniCardsProps> = React.createElement(KpiMiniCards, {
      ...this.properties,
      webUrl: this.context.pageContext.web.absoluteUrl,
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
            description: 'Configura la fuente y la lectura visual de los KPI mini-cards.'
          },
          groups: [
            {
              groupName: 'Contenido',
              groupFields: [
                PropertyPaneTextField('title', {
                  label: 'Título'
                }),
                PropertyPaneTextField('subtitle', {
                  label: 'Subtítulo'
                }),
                PropertyPaneDropdown('layoutMode', {
                  label: 'Modo de layout',
                  options: LAYOUT_MODE_OPTIONS
                }),
                PropertyPaneDropdown('sourceType', {
                  label: 'Origen de datos',
                  options: SOURCE_TYPE_OPTIONS
                }),
                PropertyPaneToggle('showTrend', {
                  label: 'Mostrar tendencia',
                  checked: this.properties.showTrend
                }),
                PropertyPaneSlider('maxItems', {
                  label: 'Máximo de tarjetas',
                  min: 1,
                  max: 20,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneToggle('openInNewTab', {
                  label: 'Abrir enlaces en una pestaña nueva',
                  checked: this.properties.openInNewTab
                })
              ]
            },
            {
              groupName: 'Fuentes',
              groupFields: [
                PropertyPaneTextField('listTitleOrUrl', {
                  label: 'Título o URL de lista SharePoint'
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: 'JSON URL'
                }),
                PropertyPaneTextField('apiEndpointUrl', {
                  label: 'API endpoint URL'
                }),
                PropertyPaneTextField('kpiCardsJson', {
                  label: 'JSON estático de KPIs',
                  multiline: true,
                  rows: 10
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
