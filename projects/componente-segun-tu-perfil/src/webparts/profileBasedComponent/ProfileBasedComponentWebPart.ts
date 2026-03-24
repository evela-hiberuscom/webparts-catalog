import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'ProfileBasedComponentWebPartStrings';
import ProfileBasedComponent from './components/ProfileBasedComponent';
import type { IProfileBasedComponentProps } from './components/IProfileBasedComponentProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type {
  IProfileBasedComponentWebPartConfiguration,
  ProfileAudienceMode,
  ProfileDataSourceType,
  ProfileFallbackMode
} from './models/profileBasedComponentModels';

export interface IProfileBasedComponentWebPartProps extends IProfileBasedComponentWebPartConfiguration {
  profileTokens: string;
}

const DATA_SOURCE_OPTIONS: Array<{ key: ProfileDataSourceType; text: string }> = [
  { key: 'SharePointList', text: 'SharePoint list' },
  { key: 'JsonUrl', text: 'Same-origin JSON' },
  { key: 'StaticConfig', text: 'Static config' }
];

const AUDIENCE_OPTIONS: Array<{ key: ProfileAudienceMode; text: string }> = [
  { key: 'department', text: 'Department' },
  { key: 'country', text: 'Country' },
  { key: 'role', text: 'Role' },
  { key: 'group', text: 'Group' },
  { key: 'hybrid', text: 'Hybrid' }
];

const FALLBACK_OPTIONS: Array<{ key: ProfileFallbackMode; text: string }> = [
  { key: 'generic', text: 'Generic' },
  { key: 'empty', text: 'Empty' }
];

export default class ProfileBasedComponentWebPart extends BaseClientSideWebPart<IProfileBasedComponentWebPartProps> {
  protected async onInit(): Promise<void> {
    this.properties.title = this.properties.title ?? 'Componente según tu perfil';
    this.properties.description = this.properties.description ?? 'Personaliza el contenido según la audiencia del usuario.';
    this.properties.dataSourceType = this.properties.dataSourceType ?? 'SharePointList';
    this.properties.listTitleOrUrl = this.properties.listTitleOrUrl ?? 'ProfileVariants';
    this.properties.jsonUrl = this.properties.jsonUrl ?? '';
    this.properties.staticConfigJson = this.properties.staticConfigJson ?? '';
    this.properties.audienceMode = this.properties.audienceMode ?? 'hybrid';
    this.properties.fallbackMode = this.properties.fallbackMode ?? 'generic';
    this.properties.maxItems = this.properties.maxItems ?? 3;
    this.properties.profileTokens = this.properties.profileTokens ?? '';
    return Promise.resolve();
  }

  public render(): void {
    const element: React.ReactElement<IProfileBasedComponentProps> = React.createElement(ProfileBasedComponent, {
      title: this.properties.title,
      description: this.properties.description,
      dataSourceType: this.properties.dataSourceType,
      listTitleOrUrl: this.properties.listTitleOrUrl,
      jsonUrl: this.properties.jsonUrl,
      staticConfigJson: this.properties.staticConfigJson,
      audienceMode: this.properties.audienceMode,
      fallbackMode: this.properties.fallbackMode,
      maxItems: Number(this.properties.maxItems ?? 3) || 3,
      profileTokens: this.properties.profileTokens,
      siteUrl: this.context.pageContext.web.absoluteUrl,
      displayName: this.context.pageContext.user.displayName,
      email: this.context.pageContext.user.email,
      loginName: this.context.pageContext.user.loginName,
      isDarkTheme: false,
      hasTeamsContext: !!this.context.sdks.microsoftTeams
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
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('title', {
                  label: strings.TitleFieldLabel
                }),
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel,
                  multiline: true,
                  rows: 3
                }),
                PropertyPaneDropdown('dataSourceType', {
                  label: strings.DataSourceTypeFieldLabel,
                  options: DATA_SOURCE_OPTIONS.map((option) => ({ key: option.key, text: option.text }))
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneTextField('jsonUrl', {
                  label: strings.JsonUrlFieldLabel
                }),
                PropertyPaneTextField('staticConfigJson', {
                  label: strings.StaticConfigJsonFieldLabel,
                  multiline: true,
                  rows: 5
                }),
                PropertyPaneDropdown('audienceMode', {
                  label: strings.AudienceModeFieldLabel,
                  options: AUDIENCE_OPTIONS.map((option) => ({ key: option.key, text: option.text }))
                }),
                PropertyPaneDropdown('fallbackMode', {
                  label: strings.FallbackModeFieldLabel,
                  options: FALLBACK_OPTIONS.map((option) => ({ key: option.key, text: option.text }))
                }),
                PropertyPaneTextField('profileTokens', {
                  label: strings.ProfileTokensFieldLabel
                }),
                PropertyPaneTextField('maxItems', {
                  label: strings.MaxItemsFieldLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
