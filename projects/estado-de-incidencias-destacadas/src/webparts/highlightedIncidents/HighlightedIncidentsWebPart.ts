import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneToggle,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'HighlightedIncidentsWebPartStrings';
import HighlightedIncidents from './components/HighlightedIncidents';
import { IHighlightedIncidentsProps } from './components/IHighlightedIncidentsProps';

import {
  defaultHighlightedIncidentsWebPartProps,
  type IHighlightedIncidentsWebPartProps
} from './models/highlightedIncidentModels';

export default class HighlightedIncidentsWebPart extends BaseClientSideWebPart<IHighlightedIncidentsWebPartProps> {
  private _isDarkTheme: boolean = false;

  public render(): void {
    const webPartProps = {
      ...defaultHighlightedIncidentsWebPartProps,
      ...this.properties
    };

    const element: React.ReactElement<IHighlightedIncidentsProps> = React.createElement(
      HighlightedIncidents,
      {
        title: webPartProps.title,
        subtitle: webPartProps.subtitle,
        dataSourceType: webPartProps.dataSourceType,
        listTitleOrUrl: webPartProps.listTitleOrUrl,
        showResolved: webPartProps.showResolved,
        maxItems: webPartProps.maxItems,
        webUrl: this.context.pageContext.web.absoluteUrl
      }
    );

    ReactDom.render(element, this.domElement);
  }

  protected onInit(): Promise<void> {
    return Promise.resolve();
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
                  multiline: true,
                  resizable: false
                }),
                PropertyPaneDropdown('dataSourceType', {
                  label: strings.DataSourceTypeFieldLabel,
                  options: [
                    { key: 'SharePointList', text: strings.SharePointListOptionLabel },
                    { key: 'JsonUrl', text: strings.JsonUrlOptionLabel }
                  ]
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneToggle('showResolved', {
                  label: strings.ShowResolvedFieldLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 20,
                  step: 1,
                  showValue: true
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
