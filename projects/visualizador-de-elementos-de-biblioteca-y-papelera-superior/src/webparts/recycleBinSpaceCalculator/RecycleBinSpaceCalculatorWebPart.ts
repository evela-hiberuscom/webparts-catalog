import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';

import * as strings from 'RecycleBinSpaceCalculatorWebPartStrings';
import RecycleBinSpaceCalculator from './components/RecycleBinSpaceCalculator';
import type { IRecycleBinSpaceCalculatorProps } from './components/IRecycleBinSpaceCalculatorProps';
import type { IRecycleBinSpaceCalculatorWebPartProps } from './models/recycleBinSpaceCalculatorModels';

export default class RecycleBinSpaceCalculatorWebPart extends BaseClientSideWebPart<IRecycleBinSpaceCalculatorWebPartProps> {
  public render(): void {
    const element: React.ReactElement<IRecycleBinSpaceCalculatorProps> = React.createElement(
      RecycleBinSpaceCalculator as React.ComponentType<IRecycleBinSpaceCalculatorProps>,
      {
      description: this.properties.description || 'Calcula el espacio ocupado por elementos de papelera de primer y segundo nivel del sitio.',
      showStageBreakdown: this.properties.showStageBreakdown ?? true,
      refreshIntervalSeconds: this.properties.refreshIntervalSeconds ?? 300,
      warningThresholdItems: this.properties.warningThresholdItems ?? 1000,
      warningThresholdSizeMb: this.properties.warningThresholdSizeMb ?? 512,
      runtimeContext: {
        siteUrl: this.context.pageContext.web.absoluteUrl,
        spHttpClient: {
          get: (url: string, _configuration: unknown, options?: { headers?: Record<string, string> }) =>
            this.context.spHttpClient.get(url, SPHttpClient.configurations.v1, options)
        }
      }
      }
    );

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
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneToggle('showStageBreakdown', {
                  label: strings.ShowStageBreakdownFieldLabel,
                  onText: 'Sí',
                  offText: 'No'
                }),
                PropertyPaneSlider('refreshIntervalSeconds', {
                  label: strings.RefreshIntervalFieldLabel,
                  min: 0,
                  max: 1800,
                  step: 30
                }),
                PropertyPaneSlider('warningThresholdItems', {
                  label: strings.WarningThresholdItemsFieldLabel,
                  min: 0,
                  max: 10000,
                  step: 100
                }),
                PropertyPaneSlider('warningThresholdSizeMb', {
                  label: strings.WarningThresholdSizeMbFieldLabel,
                  min: 0,
                  max: 20480,
                  step: 128
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
