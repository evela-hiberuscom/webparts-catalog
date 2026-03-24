import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  PropertyPaneCheckbox,
  PropertyPaneTextField,
  type IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { SPHttpClient } from '@microsoft/sp-http';
import BirthdaysAndAnniversaries from './components/BirthdaysAndAnniversaries';
import type { IBirthdaysAndAnniversariesProps } from './components/IBirthdaysAndAnniversariesProps';
import { parseDataSourceTypes } from './utils/celebrationUtils';

export interface IBirthdaysAndAnniversariesWebPartProps {
  dataSourceTypesCsv: string;
  directoryJsonUrl: string;
  listTitleOrUrl: string;
  jsonUrl: string;
  showBirthdays: boolean;
  showAnniversaries: boolean;
  daysAhead: number | string;
}

const DEFAULT_DATA_SOURCE_TYPES = 'Directory, SharePointList';

export default class BirthdaysAndAnniversariesWebPart extends BaseClientSideWebPart<IBirthdaysAndAnniversariesWebPartProps> {
  public async onInit(): Promise<void> {
    this.properties.dataSourceTypesCsv = this.properties.dataSourceTypesCsv || DEFAULT_DATA_SOURCE_TYPES;
    this.properties.showBirthdays = this.properties.showBirthdays ?? true;
    this.properties.showAnniversaries = this.properties.showAnniversaries ?? true;
    this.properties.daysAhead = this.properties.daysAhead || 14;
  }

  public render(): void {
    const element: React.ReactElement<IBirthdaysAndAnniversariesProps> = React.createElement(BirthdaysAndAnniversaries, {
      spHttpClient: this.context.spHttpClient as SPHttpClient,
      webAbsoluteUrl: this.context.pageContext.web.absoluteUrl,
      dataSourceTypes: parseDataSourceTypes(this.properties.dataSourceTypesCsv),
      directoryJsonUrl: this.properties.directoryJsonUrl || '',
      listTitleOrUrl: this.properties.listTitleOrUrl || '',
      jsonUrl: this.properties.jsonUrl || '',
      showBirthdays: this.properties.showBirthdays ?? true,
      showAnniversaries: this.properties.showAnniversaries ?? true,
      daysAhead: Number(this.properties.daysAhead) || 14
    });

    ReactDom.render(element, this.domElement);
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
            description: 'Configura la fuente de celebraciones y la ventana temporal.'
          },
          groups: [
            {
              groupName: 'Origen de datos',
              groupFields: [
                PropertyPaneTextField('dataSourceTypesCsv', {
                  label: 'Tipos de origen',
                  description: 'Valores permitidos: Directory, SharePointList, JsonUrl',
                  multiline: false
                }),
                PropertyPaneTextField('directoryJsonUrl', {
                  label: 'URL JSON de directorio',
                  description: 'Origen same-origin para el feed de directorio.',
                  multiline: false
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: 'Título o URL de la lista',
                  description: 'Acepta título de lista o URL de vista same-origin.',
                  multiline: false
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: 'URL JSON alternativa',
                  description: 'Origen same-origin para cargas JSON directas.',
                  multiline: false
                })
              ]
            },
            {
              groupName: 'Comportamiento',
              groupFields: [
                PropertyPaneCheckbox('showBirthdays', {
                  text: 'Mostrar cumpleaños',
                  checked: true
                }),
                PropertyPaneCheckbox('showAnniversaries', {
                  text: 'Mostrar aniversarios',
                  checked: true
                }),
                PropertyPaneTextField('daysAhead', {
                  label: 'Días hacia adelante',
                  description: 'Ventana temporal para próximas celebraciones.'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
