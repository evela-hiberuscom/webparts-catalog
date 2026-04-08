export type RecognitionsDataSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig';

export interface IRecognitionsWebPartProps {
  title: string;
  description: string;
  dataSourceType: RecognitionsDataSourceType;
  listTitleOrUrl: string;
  maxItems: number;
  showPhotos: boolean;
}

export interface IRecognitionsConfiguration extends IRecognitionsWebPartProps {
  webAbsoluteUrl: string;
}

export interface IRawRecognitionItem {
  id?: string;
  targetName?: string;
  message?: string;
  date?: string;
  photoUrl?: string;
  detailUrl?: string;
}

export interface IRecognitionItem {
  id: string;
  targetName: string;
  message?: string;
  date?: string;
  photoUrl?: string;
  detailUrl?: string;
  hasAction: boolean;
  hasPhoto: boolean;
  isPartial: boolean;
}

export type RecognitionsLoadState = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface IRecognitionsViewModel {
  state: RecognitionsLoadState;
  title: string;
  description: string;
  sourceLabel: string;
  items: IRecognitionItem[];
  hasPartialData: boolean;
  warningMessages: string[];
  errorMessage?: string;
}

export interface IRecognitionsService {
  load(config: IRecognitionsConfiguration): Promise<IRecognitionsViewModel>;
}
