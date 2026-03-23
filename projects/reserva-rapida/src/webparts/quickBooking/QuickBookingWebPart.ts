import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  PropertyPaneChoiceGroup,
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'QuickBookingWebPartStrings';
import QuickBooking from './components/QuickBooking';
import type { IQuickBookingProps } from './components/IQuickBookingProps';
import type { IQuickBookingWebPartProps } from './models/quickBookingModels';

export default class QuickBookingWebPart extends BaseClientSideWebPart<IQuickBookingWebPartProps> {
  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public constructor() {
    super();
    this.properties.dataSourceType = 'SharePointList';
    this.properties.listTitleOrUrl = 'BookingResourcesList';
    this.properties.defaultCategory = 'Todos';
    this.properties.showAvailability = true;
    this.properties.resourcesJson = '';
    this.properties.openInNewTab = true;
  }

  public render(): void {
    const element: React.ReactElement<IQuickBookingProps> = React.createElement(
      QuickBooking,
      {
        ...this.properties,
        webUrl: this.context.pageContext.web.absoluteUrl,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
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
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || '');
      this.domElement.style.setProperty('--link', semanticColors.link || '');
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || '');
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
                PropertyPaneChoiceGroup('dataSourceType', {
                  label: 'Fuente de datos',
                  options: [
                    { key: 'SharePointList', text: 'SharePoint list' },
                    { key: 'JsonUrl', text: 'URL JSON del mismo origen' },
                    { key: 'StaticConfig', text: 'Configuracion estatica' }
                  ]
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: 'Lista o URL de origen',
                  description: 'Usa el titulo de la lista o una URL JSON relativa o del mismo origen.'
                }),
                PropertyPaneTextField('defaultCategory', {
                  label: 'Categoria por defecto'
                }),
                PropertyPaneToggle('showAvailability', {
                  label: 'Mostrar disponibilidad resumida'
                }),
                PropertyPaneToggle('openInNewTab', {
                  label: 'Abrir reservas en nueva pestaña'
                }),
                PropertyPaneTextField('resourcesJson', {
                  label: 'JSON estatica de respaldo',
                  multiline: true,
                  rows: 8,
                  description: 'Opcional. Debe ser un array JSON o un objeto con la propiedad resources.'
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
