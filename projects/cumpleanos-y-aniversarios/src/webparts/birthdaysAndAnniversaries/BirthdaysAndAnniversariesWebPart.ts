import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  PropertyPaneCheckbox,
  PropertyPaneTextField,
  type IPropertyPaneConfiguration
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { SPHttpClient } from '@microsoft/sp-http';
import BirthdaysAndAnniversaries from './components/BirthdaysAndAnniversaries';
import type { IBirthdaysAndAnniversariesProps } from './components/IBirthdaysAndAnniversariesProps';
import * as strings from 'BirthdaysAndAnniversariesWebPartStrings';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
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
      spHttpClientConfiguration: SPHttpClient.configurations.v1,
      webAbsoluteUrl: this.context.pageContext.web.absoluteUrl,
      dataSourceTypes: parseDataSourceTypes(this.properties.dataSourceTypesCsv),
      directoryJsonUrl: this.properties.directoryJsonUrl || '',
      listTitleOrUrl: this.properties.listTitleOrUrl || '',
      jsonUrl: this.properties.jsonUrl || '',
      showBirthdays: this.properties.showBirthdays ?? true,
      showAnniversaries: this.properties.showAnniversaries ?? true,
      daysAhead: Number(this.properties.daysAhead) || 14
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
              groupName: strings.PropertyPaneDataGroupName,
              groupFields: [
                PropertyPaneTextField('dataSourceTypesCsv', {
                  label: strings.DataSourceTypesLabel,
                  description: strings.DataSourceTypesDescription,
                  multiline: false
                }),
                PropertyPaneTextField('directoryJsonUrl', {
                  label: strings.DirectoryJsonUrlLabel,
                  description: strings.DirectoryJsonUrlDescription,
                  multiline: false
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlLabel,
                  description: strings.ListTitleOrUrlDescription,
                  multiline: false
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: strings.JsonUrlLabel,
                  description: strings.JsonUrlDescription,
                  multiline: false
                })
              ]
            },
            {
              groupName: strings.PropertyPaneBehaviorGroupName,
              groupFields: [
                PropertyPaneCheckbox('showBirthdays', {
                  text: strings.ShowBirthdaysText,
                  checked: true
                }),
                PropertyPaneCheckbox('showAnniversaries', {
                  text: strings.ShowAnniversariesText,
                  checked: true
                }),
                PropertyPaneTextField('daysAhead', {
                  label: strings.DaysAheadLabel,
                  description: strings.DaysAheadDescription
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
