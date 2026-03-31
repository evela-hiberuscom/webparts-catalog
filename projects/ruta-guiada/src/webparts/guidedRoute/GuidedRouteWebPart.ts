import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { PropertyPaneDropdown, PropertyPaneTextField, PropertyPaneSlider, type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { type IReadonlyTheme } from '@microsoft/sp-component-base';
import { SPHttpClient } from '@microsoft/sp-http';
import * as strings from 'GuidedRouteWebPartStrings';
import GuidedRoute from './components/GuidedRoute';
import type { IGuidedRouteConfiguration } from './models/guidedRouteModels';
import { GuidedRouteRepository } from './repositories/guidedRouteRepository';
import { GuidedRouteService } from './services/guidedRouteService';

export default class GuidedRouteWebPart extends BaseClientSideWebPart<IGuidedRouteConfiguration> {
  private _service: GuidedRouteService | undefined;
  public render(): void {
    const repository = new GuidedRouteRepository({ fetchClient: window.fetch.bind(window), spHttpClient: this.context.spHttpClient, webAbsoluteUrl: this.context.pageContext.web.absoluteUrl });
    this._service = new GuidedRouteService(repository);
    const element = React.createElement(GuidedRoute, { configuration: { dataSourceType: this.properties.dataSourceType || 'StaticConfig', listTitleOrUrl: this.properties.listTitleOrUrl || '', routeTitle: this.properties.routeTitle || '', maxSteps: this.properties.maxSteps || 5 }, service: this._service, title: strings.WebPartTitle });
    ReactDom.render(element, this.domElement);
  }
  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void { if (currentTheme?.semanticColors) { this.domElement.style.setProperty('--bodyText', currentTheme.semanticColors.bodyText || '#111111'); } }
  protected onDispose(): void { ReactDom.unmountComponentAtNode(this.domElement); }
  protected get dataVersion(): Version { return Version.parse('1.0'); }
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ header: { description: strings.PropertyPaneDescription }, groups: [{ groupName: strings.PropertyPaneGeneralGroupName, groupFields: [PropertyPaneDropdown('dataSourceType', { label: strings.DataSourceFieldLabel, options: [{ key: 'SharePointList', text: strings.DataSourceSharePointListLabel }, { key: 'JsonUrl', text: strings.DataSourceJsonUrlLabel }, { key: 'StaticConfig', text: strings.DataSourceStaticConfigLabel }] }), PropertyPaneTextField('listTitleOrUrl', { label: strings.ListTitleOrUrlFieldLabel }), PropertyPaneSlider('maxSteps', { label: strings.MaxStepsFieldLabel, min: 1, max: 10, value: 5 })] }] }] };
  }
}