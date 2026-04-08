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

import * as strings from 'RecognitionsWebPartStrings';
import Recognitions from './components/Recognitions';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type { IRecognitionsWebPartProps } from './models/recognitionsModels';
import { RecognitionsService } from './services/recognitionsService';

export default class RecognitionsWebPart extends BaseClientSideWebPart<IRecognitionsWebPartProps> {
  private readonly _service: RecognitionsService = new RecognitionsService();

  public render(): void {
    const element: React.ReactElement = React.createElement(Recognitions, {
      configuration: {
        title: this.properties.title,
        description: this.properties.description,
        dataSourceType: this.properties.dataSourceType,
        listTitleOrUrl: this.properties.listTitleOrUrl,
        maxItems: this.properties.maxItems,
        showPhotos: this.properties.showPhotos,
        webAbsoluteUrl: this.context.pageContext.web.absoluteUrl
      },
      service: this._service,
      localeName: this.context.pageContext.cultureInfo.currentUICultureName || 'es-ES'
    });

    ReactDom.render(
      React.createElement(
        WebPartErrorBoundary,
        {
          title: strings.ErrorBoundaryTitle,
          message: strings.ErrorBoundaryMessage
        },
        element
      ),
      this.domElement
    );
  }

  protected onInit(): Promise<void> {
    this.properties.title ??= strings.DefaultWebPartTitle;
    this.properties.description ??= strings.DefaultWebPartDescription;
    this.properties.dataSourceType ??= 'StaticConfig';
    this.properties.listTitleOrUrl ??= 'RecognitionsList';
    this.properties.maxItems ??= 5;
    this.properties.showPhotos ??= true;
    return Promise.resolve();
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
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel
                }),
                PropertyPaneDropdown('dataSourceType', {
                  label: strings.DataSourceTypeFieldLabel,
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
                  max: 12,
                  value: this.properties.maxItems ?? 5,
                  showValue: true
                }),
                PropertyPaneToggle('showPhotos', {
                  label: strings.ShowPhotosFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
