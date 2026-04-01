import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { PropertyPaneDropdown, PropertyPaneTextField, type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { type IReadonlyTheme } from '@microsoft/sp-component-base';
import * as strings from 'QuickDecisionCardWebPartStrings';
import QuickDecisionCard from './components/QuickDecisionCard';
import type { IQuickDecisionConfiguration } from './models/quickDecisionModels';
import { QuickDecisionRepository } from './repositories/quickDecisionRepository';
import { QuickDecisionService } from './services/quickDecisionService';

export default class QuickDecisionCardWebPart extends BaseClientSideWebPart<IQuickDecisionConfiguration> {
  private _service: QuickDecisionService | undefined;
  public render(): void {
    const repository = new QuickDecisionRepository({ fetchClient: window.fetch.bind(window), spHttpClient: this.context.spHttpClient, webAbsoluteUrl: this.context.pageContext.web.absoluteUrl });
    this._service = new QuickDecisionService(repository);
    const element = React.createElement(QuickDecisionCard, { configuration: { dataSourceType: this.properties.dataSourceType || 'StaticConfig', listTitleOrUrl: this.properties.listTitleOrUrl || '' }, service: this._service, title: strings.WebPartTitle });
    ReactDom.render(element, this.domElement);
  }
  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void { if (currentTheme?.semanticColors) { this.domElement.style.setProperty('--bodyText', currentTheme.semanticColors.bodyText || '#111111'); } }
  protected onDispose(): void { ReactDom.unmountComponentAtNode(this.domElement); }
  protected get dataVersion(): Version { return Version.parse('1.0'); }
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ header: { description: strings.PropertyPaneDescription }, groups: [{ groupName: strings.PropertyPaneGeneralGroupName, groupFields: [PropertyPaneDropdown('dataSourceType', { label: strings.DataSourceFieldLabel, options: [{ key: 'SharePointList', text: strings.DataSourceSharePointListLabel }, { key: 'JsonUrl', text: strings.DataSourceJsonUrlLabel }, { key: 'StaticConfig', text: strings.DataSourceStaticConfigLabel }] }), PropertyPaneTextField('listTitleOrUrl', { label: strings.ListTitleOrUrlFieldLabel })] }] }] };
  }
}