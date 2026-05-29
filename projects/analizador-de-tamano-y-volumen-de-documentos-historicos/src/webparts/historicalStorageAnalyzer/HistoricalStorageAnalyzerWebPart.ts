import * as React from 'react';
import * as ReactDom from 'react-dom';
import { Version } from '@microsoft/sp-core-library';
import {
  type IPropertyPaneConfiguration,
  PropertyPaneChoiceGroup,
  PropertyPaneToggle,
  PropertyPaneTextField
} from '@microsoft/sp-property-pane';
import { BaseClientSideWebPart } from '@microsoft/sp-webpart-base';
import { IReadonlyTheme } from '@microsoft/sp-component-base';

import * as strings from 'HistoricalStorageAnalyzerWebPartStrings';
import HistoricalStorageAnalyzer from './components/HistoricalStorageAnalyzer';
import { IHistoricalStorageAnalyzerProps } from './components/IHistoricalStorageAnalyzerProps';
import { WebPartErrorBoundary } from './components/WebPartErrorBoundary';

export interface IHistoricalStorageAnalyzerWebPartProps {
  description: string;
  defaultLibraryTitleOrUrl?: string;
  defaultScanMode: 'quickScan' | 'deepScan';
  maxVersionConcurrency: string;
  includeHiddenLibraries: boolean;
}

export default class HistoricalStorageAnalyzerWebPart extends BaseClientSideWebPart<IHistoricalStorageAnalyzerWebPartProps> {

  private _isDarkTheme: boolean = false;
  private _environmentMessage: string = '';

  public render(): void {
    const element: React.ReactElement<IHistoricalStorageAnalyzerProps> = React.createElement(
      HistoricalStorageAnalyzer,
      {
        context: this.context,
        description: this.properties.description,
        defaultLibraryTitleOrUrl: this.properties.defaultLibraryTitleOrUrl,
        defaultScanMode: this.properties.defaultScanMode ?? 'deepScan',
        maxVersionConcurrency: this.properties.maxVersionConcurrency ?? '3',
        includeHiddenLibraries: this.properties.includeHiddenLibraries ?? false,
        isDarkTheme: this._isDarkTheme,
        environmentMessage: this._environmentMessage,
        hasTeamsContext: !!this.context.sdks.microsoftTeams,
        userDisplayName: this.context.pageContext.user.displayName
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

  protected onInit(): Promise<void> {
    return this._getEnvironmentMessage().then(message => {
      this._environmentMessage = message;
    });
  }



  private _getEnvironmentMessage(): Promise<string> {
    if (!!this.context.sdks.microsoftTeams) { // running in Teams, office.com or Outlook
      return this.context.sdks.microsoftTeams.teamsJs.app.getContext()
        .then(context => {
          let environmentMessage: string = '';
          switch (context.app.host.name) {
            case 'Office': // running in Office
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOffice : strings.AppOfficeEnvironment;
              break;
            case 'Outlook': // running in Outlook
              environmentMessage = this.context.isServedFromLocalhost ? strings.AppLocalEnvironmentOutlook : strings.AppOutlookEnvironment;
              break;
            case 'Teams': // running in Teams
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

  protected onThemeChanged(currentTheme: IReadonlyTheme | undefined): void {
    if (!currentTheme) {
      return;
    }

    this._isDarkTheme = !!currentTheme.isInverted;
    const {
      semanticColors
    } = currentTheme;

    if (semanticColors) {
      this._setThemeProperty('--bodyText', semanticColors.bodyText);
      this._setThemeProperty('--link', semanticColors.link);
      this._setThemeProperty('--linkHovered', semanticColors.linkHovered);
    }

  }

  private _setThemeProperty(name: string, value: string | undefined): void {
    if (value) {
      this.domElement.style.setProperty(name, value);
      return;
    }

    this.domElement.style.removeProperty(name);
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
                PropertyPaneTextField('description', {
                  label: strings.SubtitleFieldLabel
                }),
                PropertyPaneTextField('defaultLibraryTitleOrUrl', {
                  label: strings.DefaultLibraryFieldLabel
                }),
                PropertyPaneChoiceGroup('defaultScanMode', {
                  label: strings.DefaultScanModeFieldLabel,
                  options: [
                    { key: 'quickScan', text: strings.QuickScanOptionLabel },
                    { key: 'deepScan', text: strings.DeepScanOptionLabel }
                  ]
                }),
                PropertyPaneTextField('maxVersionConcurrency', {
                  label: strings.MaxVersionConcurrencyFieldLabel
                }),
                PropertyPaneToggle('includeHiddenLibraries', {
                  label: strings.IncludeHiddenLibrariesFieldLabel,
                  onText: strings.YesLabel,
                  offText: strings.NoLabel
                })
              ]
            }
          ]
        }
      ]
    };
  }
}
