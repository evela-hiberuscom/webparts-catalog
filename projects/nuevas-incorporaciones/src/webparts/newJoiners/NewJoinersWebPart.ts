import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  PropertyPaneDropdown,
  PropertyPaneTextField,
  PropertyPaneSlider,
  type IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { type IReadonlyTheme } from '@microsoft/sp-component-base';
import { SPHttpClient } from '@microsoft/sp-http';

import * as strings from 'NewJoinersWebPartStrings';
import NewJoiners from './components/NewJoiners';
import type { INewJoinersConfiguration } from './models/joinerModels';
import { NewJoinersRepository } from './repositories/newJoinersRepository';
import { NewJoinersService } from './services/newJoinersService';

export interface INewJoinersWebPartProps extends INewJoinersConfiguration {}

export default class NewJoinersWebPart extends BaseClientSideWebPart<INewJoinersWebPartProps> {
  private _service: NewJoinersService | undefined;

  public render(): void {
    const repository = new NewJoinersRepository({
      fetchClient: window.fetch.bind(window),
      spHttpClient: this.context.spHttpClient,
      spHttpClientConfiguration: SPHttpClient.configurations.v1,
      webAbsoluteUrl: this.context.pageContext.web.absoluteUrl
    });
    this._service = new NewJoinersService(repository);

    const element: React.ReactElement = React.createElement(NewJoiners, {
      configuration: {
        dataSourceType: this.properties.dataSourceType || 'StaticConfig',
        listTitleOrUrl: this.properties.listTitleOrUrl || '',
        maxItems: this.properties.maxItems || 10,
        daysBack: this.properties.daysBack || 30
      },
      service: this._service,
      autoRefreshSeconds: this.properties.autoRefreshSeconds,
      title: strings.WebPartTitle
    });

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme || !currentTheme.semanticColors) {
      return;
    }

    this.domElement.style.setProperty('--bodyText', currentTheme.semanticColors.bodyText || '#111111');
    this.domElement.style.setProperty('--link', currentTheme.semanticColors.link || '#1032cf');
    this.domElement.style.setProperty('--linkHovered', currentTheme.semanticColors.linkHovered || '#19255a');
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
              groupName: strings.PropertyPaneGeneralGroupName,
              groupFields: [
                PropertyPaneDropdown('dataSourceType', {
                  label: strings.DataSourceFieldLabel,
                  options: [
                    { key: 'SharePointList', text: strings.DataSourceSharePointListLabel },
                    { key: 'JsonUrl', text: strings.DataSourceJsonUrlLabel },
                    { key: 'StaticConfig', text: strings.DataSourceStaticConfigLabel }
                  ]
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 20,
                  value: 10
                }),
                PropertyPaneSlider('daysBack', {
                  label: strings.DaysBackFieldLabel,
                  min: 7,
                  max: 90,
                  value: 30
                })
              ]
            }
          ]
        }
      ]
    };
  }
}