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
import { SPHttpClient } from '@microsoft/sp-http';

import * as strings from 'SiteStorageDiagnosticsWebPartStrings';
import { SiteStorageDiagnostics } from './components/SiteStorageDiagnostics';
import type { ISiteStorageDiagnosticsProps } from './components/ISiteStorageDiagnosticsProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';

export interface ISiteStorageDiagnosticsWebPartProps {
  reportListUrl: string;
  batchSize: number;
  maxRequestsPerSecond: number;
  scope: 'all' | 'manual';
  manualSiteUrls: string;
}

export default class SiteStorageDiagnosticsWebPart extends BaseClientSideWebPart<ISiteStorageDiagnosticsWebPartProps> {
  public render(): void {
    const element: React.ReactElement<ISiteStorageDiagnosticsProps> = React.createElement(
      SiteStorageDiagnostics,
      {
        configuration: {
          reportListUrl: this.properties.reportListUrl || '',
          batchSize: this.properties.batchSize ?? 10,
          maxRequestsPerSecond: this.properties.maxRequestsPerSecond ?? 4,
          scope: this.properties.scope ?? 'all',
          manualSiteUrls: this.properties.manualSiteUrls
            ? this.properties.manualSiteUrls.split('\n').map((u) => u.trim()).filter(Boolean)
            : []
        },
        spHttpClient: {
          get: (url: string, _configuration: unknown, options?: { headers?: Record<string, string> }) =>
            this.context.spHttpClient.get(url, SPHttpClient.configurations.v1, options).then((r) => ({
              ok: r.ok,
              status: r.status,
              headers: { get: (name: string) => r.headers.get(name) ?? undefined },
              json: () => r.json()
            })),
          post: (url: string, _configuration: unknown, options: { headers?: Record<string, string>; body: string }) =>
            this.context.spHttpClient.post(url, SPHttpClient.configurations.v1, options).then((r) => ({
              ok: r.ok,
              status: r.status,
              headers: { get: (name: string) => r.headers.get(name) ?? undefined },
              json: () => r.json()
            }))
        },
        currentSiteUrl: this.context.pageContext.web.absoluteUrl
      }
    );

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
          header: { description: strings.PropertyPaneDescription },
          groups: [
            {
              groupName: strings.BasicGroupName,
              groupFields: [
                PropertyPaneTextField('reportListUrl', {
                  label: strings.ReportListUrlFieldLabel,
                  description: 'URL completa de la lista SP donde se guardarán los informes.'
                }),
                PropertyPaneSlider('batchSize', {
                  label: strings.BatchSizeFieldLabel,
                  min: 1,
                  max: 50,
                  step: 1
                }),
                PropertyPaneSlider('maxRequestsPerSecond', {
                  label: strings.MaxRequestsPerSecondFieldLabel,
                  min: 1,
                  max: 10,
                  step: 1
                }),
                PropertyPaneDropdown('scope', {
                  label: strings.ScopeFieldLabel,
                  options: [
                    { key: 'all', text: 'Todas las colecciones de sitios accesibles' },
                    { key: 'manual', text: 'URLs manuales' }
                  ]
                }),
                PropertyPaneTextField('manualSiteUrls', {
                  label: strings.ManualSiteUrlsFieldLabel,
                  multiline: true,
                  rows: 5
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
