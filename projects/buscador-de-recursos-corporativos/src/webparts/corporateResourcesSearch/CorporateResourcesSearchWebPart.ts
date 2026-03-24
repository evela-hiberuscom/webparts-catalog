import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneCheckbox,
  PropertyPaneSlider,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'CorporateResourcesSearchWebPartStrings';
import CorporateResourcesSearch from './components/CorporateResourcesSearch';
import type { ICorporateResourcesSearchProps } from './components/ICorporateResourcesSearchProps';
import type { ICorporateResourcesSearchWebPartProps } from './models/corporateResourcesSearchModels';

export default class CorporateResourcesSearchWebPart extends BaseClientSideWebPart<ICorporateResourcesSearchWebPartProps> {
  private _isDarkTheme = false;

  public onInit(): Promise<void> {
    this.properties.title ??= 'Buscador de recursos corporativos';
    this.properties.subtitle ??= 'Encuentra políticas, plantillas, procedimientos y manuales en segundos.';
    this.properties.dataSourceTypesCsv ??= 'SearchAPI,SharePointList';
    this.properties.listTitleOrUrl ??= '';
    this.properties.searchScopeUrl ??= '';
    this.properties.showFeaturedWhenEmpty ??= true;
    this.properties.maxItems ??= 10;

    return Promise.resolve();
  }

  public render(): void {
    const element: React.ReactElement<ICorporateResourcesSearchProps> = React.createElement(CorporateResourcesSearch, {
      title: this.properties.title,
      subtitle: this.properties.subtitle,
      dataSourceTypesCsv: this.properties.dataSourceTypesCsv,
      listTitleOrUrl: this.properties.listTitleOrUrl,
      searchScopeUrl: this.properties.searchScopeUrl,
      showFeaturedWhenEmpty: this.properties.showFeaturedWhenEmpty,
      maxItems: this.properties.maxItems,
      webUrl: this.context.pageContext.web.absoluteUrl,
      isDarkTheme: this._isDarkTheme,
      hasTeamsContext: Boolean(this.context.sdks.microsoftTeams),
      userDisplayName: this.context.pageContext.user.displayName
    });

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = Boolean(currentTheme.isInverted);
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText ?? '');
      this.domElement.style.setProperty('--link', semanticColors.link ?? '');
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered ?? '');
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
                  multiline: true
                }),
                PropertyPaneTextField('dataSourceTypesCsv', {
                  label: strings.DataSourceTypesFieldLabel,
                  description: strings.DataSourceTypesDescription
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneTextField('searchScopeUrl', {
                  label: strings.SearchScopeUrlFieldLabel
                }),
                PropertyPaneCheckbox('showFeaturedWhenEmpty', {
                  text: strings.ShowFeaturedWhenEmptyFieldLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 50,
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
