import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { PropertyPaneDropdown, PropertyPaneTextField, PropertyPaneSlider, type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { type IReadonlyTheme } from '@microsoft/sp-component-base';
import * as strings from 'SitesPresenceWebPartStrings';
import SitesPresence from './components/SitesPresence';
import type { ISitesPresenceConfiguration } from './models/sitesPresenceModels';
import { SitesPresenceRepository } from './repositories/sitesPresenceRepository';
import { SitesPresenceService } from './services/sitesPresenceService';

export default class SitesPresenceWebPart extends BaseClientSideWebPart<ISitesPresenceConfiguration> {
  private _service: SitesPresenceService | undefined;
  public render(): void {
    const repository = new SitesPresenceRepository({ fetchClient: window.fetch.bind(window), spHttpClient: this.context.spHttpClient, webAbsoluteUrl: this.context.pageContext.web.absoluteUrl });
    this._service = new SitesPresenceService(repository);
    const element = React.createElement(SitesPresence, { configuration: { dataSourceType: this.properties.dataSourceType || 'StaticConfig', listTitleOrUrl: this.properties.listTitleOrUrl || '', maxItems: this.properties.maxItems || 10 }, service: this._service, title: strings.WebPartTitle });
    ReactDom.render(element, this.domElement);
  }
  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void { if (currentTheme?.semanticColors) { this.domElement.style.setProperty('--bodyText', currentTheme.semanticColors.bodyText || '#111111'); } }
  protected onDispose(): void { ReactDom.unmountComponentAtNode(this.domElement); }
  protected get dataVersion(): Version { return Version.parse('1.0'); }
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ header: { description: strings.PropertyPaneDescription }, groups: [{ groupName: strings.PropertyPaneGeneralGroupName, groupFields: [PropertyPaneDropdown('dataSourceType', { label: strings.DataSourceFieldLabel, options: [{ key: 'SharePointList', text: strings.DataSourceSharePointListLabel }, { key: 'JsonUrl', text: strings.DataSourceJsonUrlLabel }, { key: 'StaticConfig', text: strings.DataSourceStaticConfigLabel }] }), PropertyPaneTextField('listTitleOrUrl', { label: strings.ListTitleOrUrlFieldLabel }), PropertyPaneSlider('maxItems', { label: strings.MaxItemsFieldLabel, min: 1, max: 20, value: 10 })] }] }] };
  }
}