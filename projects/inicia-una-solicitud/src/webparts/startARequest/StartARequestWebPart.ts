import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneChoiceGroup,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import type { IReadonlyTheme } from '@microsoft/sp-component-base';
import * as strings from 'StartARequestWebPartStrings';
import { RequestsCatalogRepository } from './repositories/requestsCatalogRepository';
import { RequestsCatalogService } from './services/requestsCatalogService';
import { StartARequestProvider } from './contexts/StartARequestContext';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import { StartARequest } from './components/StartARequest';
import type { IStartARequestProps, IStartARequestWebPartProps } from './models/startARequestModels';

export default class StartARequestWebPart extends BaseClientSideWebPart<IStartARequestWebPartProps> {
  private _service!: RequestsCatalogService;

  public async onInit(): Promise<void> {
    this._service = new RequestsCatalogService(
      new RequestsCatalogRepository({
        spHttpClient: this.context.spHttpClient
      })
    );

    this.properties.dataSourceType = this.properties.dataSourceType ?? 'SharePointList';
    this.properties.listTitleOrUrl = this.properties.listTitleOrUrl ?? 'RequestsCatalogList';
    this.properties.defaultCategory = this.properties.defaultCategory ?? '';
    this.properties.showPrerequisites = this.properties.showPrerequisites ?? true;
  }

  public render(): void {
    const element: React.ReactElement = React.createElement(
      StartARequestProvider,
      { service: this._service },
      React.createElement(
        WebPartErrorBoundary,
        {
          title: strings.ErrorBoundaryTitle,
          message: strings.ErrorBoundaryMessage
        },
        React.createElement(StartARequest, {
          title: strings.WebPartTitle,
          subtitle: strings.WebPartSubtitle,
          webUrl: this.context.pageContext.web.absoluteUrl,
          dataSourceType: this.properties.dataSourceType,
          listTitleOrUrl: this.properties.listTitleOrUrl,
          defaultCategory: this.properties.defaultCategory,
          showPrerequisites: this.properties.showPrerequisites
        } satisfies IStartARequestProps)
      )
    );

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme?.semanticColors) {
      return;
    }

    this.domElement.style.setProperty('--bodyText', currentTheme.semanticColors.bodyText || '');
    this.domElement.style.setProperty('--link', currentTheme.semanticColors.link || '');
    this.domElement.style.setProperty('--linkHovered', currentTheme.semanticColors.linkHovered || '');
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
                    {
                      key: 'SharePointList',
                      text: strings.DataSourceTypeSharePointList
                    },
                    {
                      key: 'JsonUrl',
                      text: strings.DataSourceTypeJsonUrl
                    },
                    {
                      key: 'StaticConfig',
                      text: strings.DataSourceTypeStaticConfig
                    }
                  ]
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel,
                  placeholder: strings.ListTitleOrUrlFieldPlaceholder
                }),
                PropertyPaneTextField('defaultCategory', {
                  label: strings.DefaultCategoryFieldLabel,
                  placeholder: strings.DefaultCategoryFieldPlaceholder
                }),
                PropertyPaneToggle('showPrerequisites', {
                  label: strings.ShowPrerequisitesFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
