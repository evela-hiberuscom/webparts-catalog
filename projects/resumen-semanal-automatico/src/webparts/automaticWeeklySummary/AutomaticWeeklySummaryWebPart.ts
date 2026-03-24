import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneDropdown,
  PropertyPaneSlider,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'AutomaticWeeklySummaryWebPartStrings';
import AutomaticWeeklySummary from './components/AutomaticWeeklySummary';
import type { IAutomaticWeeklySummaryProps } from './components/IAutomaticWeeklySummaryProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';
import type { SummaryPeriodMode } from './models/weeklySummaryTypes';
import { StaticSummarySourceRepository } from './repositories/StaticSummarySourceRepository';
import { WeeklySummaryService } from './services/WeeklySummaryService';

export interface IAutomaticWeeklySummaryWebPartProps {
  title: string;
  subtitle: string;
  periodMode: SummaryPeriodMode;
  maxItems: number;
  customRangeStart?: string;
  customRangeEnd?: string;
}

const DEFAULT_TITLE = 'Resumen semanal automatico';
const DEFAULT_SUBTITLE = 'Sintetiza noticias, hitos e incidencias para leer lo importante en menos de un minuto.';

export default class AutomaticWeeklySummaryWebPart extends BaseClientSideWebPart<IAutomaticWeeklySummaryWebPartProps> {
  private readonly _service = new WeeklySummaryService(new StaticSummarySourceRepository());

  protected onInit(): Promise<void> {
    this.properties.title ??= DEFAULT_TITLE;
    this.properties.subtitle ??= DEFAULT_SUBTITLE;
    this.properties.periodMode ??= 'currentWeek';
    this.properties.maxItems ??= 6;

    return Promise.resolve();
  }

  public render(): void {
    const element: React.ReactElement<IAutomaticWeeklySummaryProps> = React.createElement(AutomaticWeeklySummary, {
      title: this.properties.title ?? DEFAULT_TITLE,
      subtitle: this.properties.subtitle ?? DEFAULT_SUBTITLE,
      periodMode: this.properties.periodMode ?? 'currentWeek',
      maxItems: this.properties.maxItems ?? 6,
      customRangeStart: this.properties.customRangeStart,
      customRangeEnd: this.properties.customRangeEnd,
      service: this._service
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

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    const { semanticColors } = currentTheme;

    if (semanticColors) {
      this.domElement.style.setProperty('--bodyText', semanticColors.bodyText || '');
      this.domElement.style.setProperty('--link', semanticColors.link || '');
      this.domElement.style.setProperty('--linkHovered', semanticColors.linkHovered || '');
    }
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
                  multiline: true,
                  rows: 3
                }),
                PropertyPaneDropdown('periodMode', {
                  label: strings.PeriodModeFieldLabel,
                  options: [
                    { key: 'currentWeek', text: strings.CurrentWeekLabel },
                    { key: 'previousWeek', text: strings.PreviousWeekLabel },
                    { key: 'customRange', text: strings.CustomRangeLabel }
                  ],
                  selectedKey: 'currentWeek'
                }),
                PropertyPaneSlider('maxItems', {
                  label: strings.MaxItemsFieldLabel,
                  min: 1,
                  max: 12,
                  step: 1,
                  showValue: true,
                  value: this.properties.maxItems ?? 6
                }),
                PropertyPaneTextField('customRangeStart', {
                  label: strings.CustomRangeStartFieldLabel,
                  description: strings.CustomRangeHelpText
                }),
                PropertyPaneTextField('customRangeEnd', {
                  label: strings.CustomRangeEndFieldLabel,
                  description: strings.CustomRangeHelpText
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
