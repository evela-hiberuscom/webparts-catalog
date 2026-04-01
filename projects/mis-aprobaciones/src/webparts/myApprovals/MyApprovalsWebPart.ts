import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneChoiceGroup,
  PropertyPaneToggle,
  PropertyPaneSlider,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';
import { SPHttpClient } from '@microsoft/sp-http';

import * as strings from 'MyApprovalsWebPartStrings';
import { MyApprovals } from './components/MyApprovals';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import { MyApprovalsProvider } from './contexts/MyApprovalsContext';
import { ApprovalOrderingService } from './services/approvalOrderingService';
import { ApprovalsAggregationService } from './services/approvalsAggregationService';
import { ApprovalsRepository } from './repositories/approvalsRepository';
import { ApprovalDataSourceType, ApprovalSortKey } from './models/myApprovalsModels';

export interface IMyApprovalsWebPartProps {
  title: string;
  description?: string;
  dataSourceType: ApprovalDataSourceType;
  sourceUrl?: string;
  listTitleOrUrl?: string;
  showCompleted: boolean;
  maxItems: number;
  defaultSort: ApprovalSortKey;
}

const defaultProperties: IMyApprovalsWebPartProps = {
  title: 'Mis aprobaciones',
  description: 'Centraliza las aprobaciones pendientes del usuario actual y prioriza las que bloquean el avance de procesos.',
  dataSourceType: 'Approvals',
  sourceUrl: '',
  listTitleOrUrl: '',
  showCompleted: false,
  maxItems: 10,
  defaultSort: 'dueDate'
};

export default class MyApprovalsWebPart extends BaseClientSideWebPart<IMyApprovalsWebPartProps> {
  private _isDarkTheme = false;
  private _environmentMessage = '';
  private _service?: ApprovalsAggregationService;

  public onInit(): Promise<void> {
    Object.assign(this.properties, defaultProperties, this.properties);
    this._service = new ApprovalsAggregationService(
      new ApprovalsRepository(this.context.spHttpClient as SPHttpClient, this.context.pageContext.web.absoluteUrl),
      new ApprovalOrderingService()
    );

    return this._getEnvironmentMessage().then((message) => {
      this._environmentMessage = message;
    });
  }

  public render(): void {
    const element = React.createElement(
      WebPartErrorBoundary,
      {
        title: strings.ErrorBoundaryTitle,
        message: strings.ErrorBoundaryMessage
      },
      React.createElement(
        MyApprovalsProvider,
        { service: this._service },
        React.createElement(MyApprovals, {
          title: this.properties.title || defaultProperties.title,
          description: this.properties.description || this._environmentMessage,
          config: {
            title: this.properties.title || defaultProperties.title,
            dataSourceType: this.properties.dataSourceType || defaultProperties.dataSourceType,
            sourceUrl: this.properties.sourceUrl,
            listTitleOrUrl: this.properties.listTitleOrUrl,
            showCompleted: this.properties.showCompleted ?? defaultProperties.showCompleted,
            maxItems: this.properties.maxItems || defaultProperties.maxItems,
            defaultSort: this.properties.defaultSort || defaultProperties.defaultSort
          },
          service: this._service
        })
      )
    );

    ReactDom.render(element, this.domElement);
  }

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || '');
      this.domElement.style.setProperty('--link', semanticColors.link || '');
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || '');
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
                PropertyPaneChoiceGroup('dataSourceType', {
                  label: strings.DataSourceTypeLabel,
                  options: [
                    { key: 'Approvals', text: strings.DataSourceTypeApprovals },
                    { key: 'SharePointList', text: strings.DataSourceTypeSharePointList },
                    { key: 'JsonUrl', text: strings.DataSourceTypeJsonUrl }
                  ]
                }),
                PropertyPaneTextField('sourceUrl', {
                  label: strings.SourceUrlFieldLabel
                }),
                PropertyPaneTextField('listTitleOrUrl', {
                  label: strings.ListTitleOrUrlFieldLabel
                }),
                PropertyPaneToggle('showCompleted', {
                  label: strings.ShowCompletedFieldLabel
                }),
                PropertyPaneChoiceGroup('defaultSort', {
                  label: strings.DefaultSortFieldLabel,
                  options: [
                    { key: 'dueDate', text: strings.DefaultSortDueDate },
                    { key: 'createdDate', text: strings.DefaultSortCreatedDate },
                    { key: 'source', text: strings.DefaultSortSource }
                  ]
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 20,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneTextField('description', {
                  label: strings.DescriptionFieldLabel,
                  multiline: true,
                  rows: 3
                })
              ]
            }
          ]
        }
      ]
    };
  }

  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) {
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then((context) => {
          let environmentMessage = '';
          switch (context.app.host.name) {
            case 'Office':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams':
            case 'TeamsModern':
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentTeams : strings.AppTeamsTabEnvironment;
              break;
            default:
              environmentMessage = strings.UnknownEnvironment;
          }

          return environmentMessage;
        });
    }

    return Promise.resolve(this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentSharePoint : strings.AppSharePointEnvironment);
  }
}
