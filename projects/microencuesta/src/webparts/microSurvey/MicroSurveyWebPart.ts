import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  PropertyPaneDropdown,
  type IPropertyPaneConfiguration,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { type IReadonlyTheme } from '@microsoft/sp-component-base';
import { SPHttpClient } from '@microsoft/sp-http';

import * as strings from 'MicroSurveyWebPartStrings';
import MicroSurvey from './components/MicroSurvey';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type {
  FetchLike,
  IMicroSurveyConfiguration,
  IMicroSurveyUserContext,
  IKeyValueStorageLike
} from './models/pollModels';
import { PollRepository } from './repositories/pollRepository';
import { MicroSurveyService } from './services/microSurveyService';

export interface IMicroSurveyWebPartProps extends IMicroSurveyConfiguration {}

export default class MicroSurveyWebPart extends BaseClientSideWebPart<IMicroSurveyWebPartProps> {
  private _storage: IKeyValueStorageLike = {
    getItem: (_key: string) => undefined,
    setItem: (_key: string, _value: string) => undefined
  };

  public async onInit(): Promise<void> {
    await super.onInit();
    if (typeof window !== 'undefined' && window.localStorage) {
      this._storage = {
        getItem: (key: string) => {
          const storedValue = window.localStorage.getItem(key);
          return storedValue === null ? undefined : storedValue;
        },
        setItem: (key: string, value: string) => {
          window.localStorage.setItem(key, value);
        }
      };
    }
  }

  public render(): void {
    const repository = new PollRepository({
      fetchClient: window.fetch.bind(window) as FetchLike,
      spHttpClient: this.context.spHttpClient,
      spHttpClientConfiguration: SPHttpClient.configurations.v1,
      storage: this._storage,
      webAbsoluteUrl: this.context.pageContext.web.absoluteUrl
    });
    const service = new MicroSurveyService(repository, this.createUserContext());
    const element: React.ReactElement = React.createElement(
      WebPartErrorBoundary,
      {
        title: strings.ErrorBoundaryTitle,
        message: strings.ErrorBoundaryMessage
      },
      React.createElement(MicroSurvey, {
        configuration: this.properties,
        service
      })
    );

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme || !currentTheme.semanticColors) {
      return;
    }

    this.domElement.style.setProperty(
      '--bodyText',
      currentTheme.semanticColors.bodyText || '#111111'
    );
    this.domElement.style.setProperty(
      '--link',
      currentTheme.semanticColors.link || '#1032cf'
    );
    this.domElement.style.setProperty(
      '--linkHovered',
      currentTheme.semanticColors.linkHovered || '#19255a'
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
              groupName: strings.PropertyPaneGeneralGroupName,
              groupFields: [
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel,
                  multiline: true
                }),
                PropertyPaneDropdown('dataSourceType', {
                  label: strings.DataSourceFieldLabel,
                  options: [
                    { key: 'SharePointList', text: strings.DataSourceSharePointListLabel },
                    { key: 'ApiEndpoint', text: strings.DataSourceApiEndpointLabel },
                    { key: 'StaticConfig', text: strings.DataSourceStaticConfigLabel }
                  ]
                }),
                PropertyPaneToggle('oneResponsePerUser', {
                  label: strings.OneResponsePerUserFieldLabel,
                  onText: strings.ToggleOnLabel,
                  offText: strings.ToggleOffLabel
                })
              ]
            },
            {
              groupName: strings.PropertyPaneSharePointGroupName,
              groupFields: [
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneTextField('responsesListTitleOrUrl', {
                  label: strings.ResponsesListTitleOrUrlFieldLabel
                })
              ]
            },
            {
              groupName: strings.PropertyPaneApiGroupName,
              groupFields: [
                PropertyPaneTextField('apiEndpointUrl', {
                  label: strings.ApiEndpointUrlFieldLabel
                })
              ]
            },
            {
              groupName: strings.PropertyPaneStaticGroupName,
              groupFields: [
                PropertyPaneTextField('questionText', {
                  label: strings.QuestionTextFieldLabel,
                  multiline: true
                }),
                PropertyPaneTextField('optionsCsv', {
                  label: strings.OptionsCsvFieldLabel,
                  multiline: true
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private createUserContext(): IMicroSurveyUserContext {
    return {
      displayName: this.context.pageContext.user.displayName || '',
      email: this.context.pageContext.user.email || '',
      loginName: this.context.pageContext.user.loginName || ''
    };
  }
}
