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
import { initializeIcons } from '@fluentui/react';

import * as strings from 'ProjectStatusWebPartStrings';
import ProjectStatus from './components/ProjectStatus';
import type { IProjectStatusProps } from './components/IProjectStatusProps';
import {
  DATA_SOURCE_OPTIONS,
  DEFAULT_DATA_SOURCE_TYPE,
  DEFAULT_STATUS_FILTER,
  MAX_PROJECT_ITEMS,
  normalizeProjectStatusDataSourceType,
  STATUS_FILTER_OPTIONS
} from './projectStatusWebPartConfig';

export default class ProjectStatusWebPart extends BaseClientSideWebPart<IProjectStatusProps> {
  public render(): void {
    const element = React.createElement(ProjectStatus, {
      webUrl: this.context.pageContext.web.absoluteUrl,
      title: this.properties.title,
      subtitle: this.properties.subtitle,
      dataSourceType: this.properties.dataSourceType,
      listTitleOrUrl: this.properties.listTitleOrUrl,
      jsonUrl: this.properties.jsonUrl,
      maxItems: this.properties.maxItems,
      defaultStatusFilter: this.properties.defaultStatusFilter,
      showOwner: this.properties.showOwner
    });

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    initializeIcons();

    this.properties.title ??= 'Estado de proyectos';
    this.properties.subtitle ??= 'Seguimiento compacto de iniciativas, riesgos y próximas revisiones.';
    this.properties.dataSourceType = normalizeProjectStatusDataSourceType(
      this.properties.dataSourceType as string | undefined
    );
    this.properties.listTitleOrUrl ??= 'ProjectsList';
    this.properties.jsonUrl ??= '';
    this.properties.maxItems ??= 8;
    this.properties.defaultStatusFilter ??= DEFAULT_STATUS_FILTER;
    this.properties.showOwner ??= true;

    return Promise.resolve();
  }

  protected onDispose(): void {
    ReactDom.unmountComponentAtNode(this.domElement);
  }

  protected get dataVersion(): Version {
    return Version.parse('1.0');
  }

  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    const dataSourceType = this.properties.dataSourceType ?? DEFAULT_DATA_SOURCE_TYPE;
    const isSharePointList = dataSourceType === 'SharePointList';
    const isJsonSource = dataSourceType === 'JsonUrl';

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
                PropertyPaneTextField('subtitle', {
                  label: strings.SubtitleFieldLabel,
                  multiline: true
                }),
                PropertyPaneDropdown('dataSourceType', {
                  label: strings.DataSourceTypeFieldLabel,
                  options: DATA_SOURCE_OPTIONS
                }),
                ...(isSharePointList
                  ? [
                      PropertyPaneTextField('listTitleOrUrl', {
                        label: strings.ListTitleOrUrlFieldLabel
                      })
                    ]
                  : []),
                ...(isJsonSource
                  ? [
                      PropertyPaneTextField('jsonUrl', {
                        label: strings.JsonUrlFieldLabel
                      })
                    ]
                  : []),
                PropertyPaneDropdown('defaultStatusFilter', {
                  label: strings.DefaultStatusFilterFieldLabel,
                  options: STATUS_FILTER_OPTIONS
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: MAX_PROJECT_ITEMS,
                  value: this.properties.maxItems ?? 8,
                  showValue: true
                }),
                PropertyPaneToggle('showOwner', {
                  label: strings.ShowOwnerFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
