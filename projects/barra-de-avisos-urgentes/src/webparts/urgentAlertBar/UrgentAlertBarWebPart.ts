import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneChoiceGroup,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { SPHttpClient } from '@microsoft/sp-http';

import * as strings from 'UrgentAlertBarWebPartStrings';
import UrgentAlertBar from './components/UrgentAlertBar';
import type { IUrgentAlertBarProps } from './components/IUrgentAlertBarProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type { AlertDataSourceType } from './models/alertModels';

export interface IUrgentAlertBarWebPartProps {
  dataSourceType: AlertDataSourceType;
  listTitleOrUrl: string;
  jsonUrl: string;
  staticConfigJson: string;
  maxAlerts: number;
  dismissible: boolean;
}

const DEFAULT_PROPERTIES: IUrgentAlertBarWebPartProps = {
  dataSourceType: 'SharePointList',
  listTitleOrUrl: 'AlertsList',
  jsonUrl: '',
  staticConfigJson: '',
  maxAlerts: 3,
  dismissible: false
};

export default class UrgentAlertBarWebPart extends BaseClientSideWebPart<IUrgentAlertBarWebPartProps> {
  protected onAfterDeserialize(
    deserializedObject: Partial<IUrgentAlertBarWebPartProps>,
    dataVersion: Version
  ): IUrgentAlertBarWebPartProps {
    const properties = super.onAfterDeserialize(deserializedObject, dataVersion) as Partial<IUrgentAlertBarWebPartProps>;

    return {
      ...DEFAULT_PROPERTIES,
      ...properties
    };
  }

  public render(): void {
    const element: React.ReactElement<IUrgentAlertBarProps> = React.createElement(UrgentAlertBar, {
      spHttpClient: this.context.spHttpClient as SPHttpClient,
      webAbsoluteUrl: this.context.pageContext.web.absoluteUrl,
      dataSourceType: this.properties.dataSourceType,
      listTitleOrUrl: this.properties.listTitleOrUrl,
      jsonUrl: this.properties.jsonUrl,
      staticConfigJson: this.properties.staticConfigJson,
      maxAlerts: this.properties.maxAlerts,
      dismissible: this.properties.dismissible
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
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneChoiceGroup('dataSourceType', {
                  label: strings.DataSourceTypeFieldLabel,
                  options: [
                    { key: 'SharePointList', text: strings.DataSourceTypeSharePointList },
                    { key: 'JsonUrl', text: strings.DataSourceTypeJsonUrl },
                    { key: 'StaticConfig', text: strings.DataSourceTypeStaticConfig }
                  ]
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: strings.JsonUrlFieldLabel
                }),
                PropertyPaneTextField('staticConfigJson', {
                  label: strings.StaticConfigFieldLabel,
                  multiline: true,
                  rows: 8
                }),
                PropertyPaneSlider('maxAlerts', {
                  label: strings.MaxAlertsFieldLabel,
                  min: 1,
                  max: 10,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneToggle('dismissible', {
                  label: strings.DismissibleFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
