import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import { PropertyPaneDropdown, PropertyPaneTextField, PropertyPaneToggle, type IPropertyPaneConfiguration } from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { type IReadonlyTheme } from '@microsoft/sp-component-base';
import * as strings from 'FeaturedQuestionWebPartStrings';
import FeaturedQuestion from './components/FeaturedQuestion';
import type { IFeaturedQuestionConfiguration } from './models/featuredQuestionModels';
import { FeaturedQuestionRepository } from './repositories/featuredQuestionRepository';
import { FeaturedQuestionService } from './services/featuredQuestionService';

export default class FeaturedQuestionWebPart extends BaseClientSideWebPart<IFeaturedQuestionConfiguration> {
  private _service: FeaturedQuestionService | undefined;
  public render(): void {
    const repository = new FeaturedQuestionRepository({
      fetchClient: window.fetch.bind(window),
      webAbsoluteUrl: this.context.pageContext.web.absoluteUrl
    });
    this._service = new FeaturedQuestionService(repository);
    const element = React.createElement(FeaturedQuestion, { configuration: { dataSourceType: this.properties.dataSourceType || 'StaticConfig', listTitleOrUrl: this.properties.listTitleOrUrl || '', showVotes: this.properties.showVotes || false, allowMultipleVotes: this.properties.allowMultipleVotes || false }, service: this._service, title: strings.WebPartTitle });
    ReactDom.render(element, this.domElement);
  }
  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void { if (currentTheme?.semanticColors) { this.domElement.style.setProperty('--bodyText', currentTheme.semanticColors.bodyText || '#111111'); } }
  protected onDispose(): void { ReactDom.unmountComponentAtNode(this.domElement); }
  protected get dataVersion(): Version { return Version.parse('1.0'); }
  protected getPropertyPaneConfiguration(): IPropertyPaneConfiguration {
    return { pages: [{ header: { description: strings.PropertyPaneDescription }, groups: [{ groupName: strings.PropertyPaneGeneralGroupName, groupFields: [PropertyPaneDropdown('dataSourceType', { label: strings.DataSourceFieldLabel, options: [{ key: 'SharePointList', text: strings.DataSourceSharePointListLabel }, { key: 'JsonUrl', text: strings.DataSourceJsonUrlLabel }, { key: 'StaticConfig', text: strings.DataSourceStaticConfigLabel }] }), PropertyPaneTextField('listTitleOrUrl', { label: strings.ListTitleOrUrlFieldLabel }), PropertyPaneToggle('showVotes', { label: strings.ShowVotesFieldLabel, onText: strings.ToggleOnLabel, offText: strings.ToggleOffLabel })] }] }] };
  }
}
