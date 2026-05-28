import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneSlider,
  PropertyPaneTextField,
  PropertyPaneToggle
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';

import * as strings from 'InactiveSitesValidationWebPartStrings';
import { InactiveSitesValidationDashboard } from './components/InactiveSitesValidationDashboard';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import { GovernanceDashboardService } from './services/governanceDashboardService';
import type { IGovernanceDashboardLabels } from './models/governanceModels';

export interface IInactiveSitesValidationWebPartProps {
  title: string;
  subtitle: string;
  maxItems: number;
  showDetails: boolean;
}

const defaultMaxItems = 5;

export default class InactiveSitesValidationWebPart extends BaseClientSideWebPart<IInactiveSitesValidationWebPartProps> {
  private readonly dashboardService: GovernanceDashboardService = new GovernanceDashboardService();

  public async onInit(): Promise<void> {
    this.properties.title = this.properties.title || strings.WebPartTitle;
    this.properties.subtitle = this.properties.subtitle || strings.WebPartDescription;
    this.properties.maxItems = this.properties.maxItems || defaultMaxItems;
    this.properties.showDetails = this.properties.showDetails !== false;
  }

  public render(): void {
    const labels: IGovernanceDashboardLabels = {
      loadingLabel: strings.LoadingLabel,
      emptyTitle: strings.EmptyTitle,
      emptyMessage: strings.EmptyMessage,
      errorTitle: strings.ErrorTitle,
      errorMessage: strings.ErrorMessage,
      retryButtonLabel: strings.RetryButtonLabel,
      sourceLabel: strings.SourceLabel,
      mockModeLabel: strings.MockModeLabel,
      backendRequiredLabel: strings.BackendRequiredLabel,
      riskLabel: strings.RiskLabel,
      recommendationsLabel: strings.RecommendationsLabel,
      evidenceLabel: strings.EvidenceLabel,
      statusLabel: strings.StatusLabel,
      severityLabel: strings.SeverityLabel,
      confidenceLabel: strings.ConfidenceLabel,
      lastUpdatedLabel: strings.LastUpdatedLabel,
      limitationsLabel: strings.LimitationsLabel
    };

    const element = React.createElement(InactiveSitesValidationDashboard, {
      title: this.properties.title,
      subtitle: this.properties.subtitle,
      maxItems: this.properties.maxItems,
      showDetails: this.properties.showDetails,
      labels,
      service: this.dashboardService
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
                PropertyPaneTextField('subtitle', {
                  label: strings.SubtitleFieldLabel
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 10,
                  step: 1,
                  showValue: true
                }),
                PropertyPaneToggle('showDetails', {
                  label: strings.ShowDetailsFieldLabel,
                  checked: this.properties.showDetails
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
