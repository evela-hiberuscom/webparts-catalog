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

import * as strings from 'PlannedMaintenanceWebPartStrings';
import PlannedMaintenance from './components/PlannedMaintenance';
import type { IPlannedMaintenanceProps } from './components/IPlannedMaintenanceProps';
import type { IPlannedMaintenanceWebPartProps } from './models/plannedMaintenanceModels';
import { normalizeWebPartProps } from './utils/plannedMaintenanceUtils';

export default class PlannedMaintenanceWebPart extends BaseClientSideWebPart<IPlannedMaintenanceWebPartProps> {
  public async onInit(): Promise<void> {
    const normalized = normalizeWebPartProps(this.properties);
    Object.assign(this.properties, normalized);
  }

  public render(): void {
    const normalized = normalizeWebPartProps(this.properties);
    const element: React.ReactElement<IPlannedMaintenanceProps> = React.createElement(PlannedMaintenance, {
      webPartProps: normalized,
      hostContext: {
        spHttpClient: this.context.spHttpClient,
        webUrl: this.context.pageContext.web.absoluteUrl,
        siteUrl: this.context.pageContext.site.absoluteUrl,
        localeName: this.context.pageContext.cultureInfo.currentUICultureName
      }
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
            description: strings.PropertyPaneDescription
          },
          groups: [
            {
              groupName: strings.ContentGroupName,
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
                  options: [
                    { key: 'SharePointList', text: strings.DataSourceTypeSharePointList },
                    { key: 'JsonUrl', text: strings.DataSourceTypeJsonUrl }
                  ]
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: strings.JsonUrlFieldLabel
                })
              ]
            },
            {
              groupName: strings.ViewGroupName,
              groupFields: [
                PropertyPaneToggle('hideCompleted', {
                  label: strings.HideCompletedFieldLabel,
                  onText: strings.ToggleOnLabel,
                  offText: strings.ToggleOffLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 25,
                  step: 1,
                  value: 10
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
