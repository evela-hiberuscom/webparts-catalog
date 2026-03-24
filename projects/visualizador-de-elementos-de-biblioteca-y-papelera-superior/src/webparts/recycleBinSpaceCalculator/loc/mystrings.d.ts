declare interface IRecycleBinSpaceCalculatorWebPartStrings {
  PropertyPaneDescription: string;
  BasicGroupName: string;
  DescriptionFieldLabel: string;
  ShowStageBreakdownFieldLabel: string;
  RefreshIntervalFieldLabel: string;
  WarningThresholdItemsFieldLabel: string;
  WarningThresholdSizeMbFieldLabel: string;
  ErrorBoundaryTitle: string;
  ErrorBoundaryMessage: string;
}

declare module 'RecycleBinSpaceCalculatorWebPartStrings' {
  const strings: IRecycleBinSpaceCalculatorWebPartStrings;
  export = strings;
}
