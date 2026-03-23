export type FavoriteDataSourceType = 'SharePointList' | 'StaticConfig';

export interface IRawFavoriteItem {
  id?: string;
  title?: string;
  description?: string;
  url?: string;
  openUrl?: string;
  icon?: string;
  type?: string;
  category?: string;
  featured?: boolean | string;
  sortOrder?: number | string;
}

export interface IFavoriteItem {
  id: string;
  title: string;
  description?: string;
  openUrl?: string;
  icon: string;
  type: string;
  category?: string;
  featured: boolean;
  sortOrder?: number;
  hasAction: boolean;
}

export interface IPersonalFavoritesWebPartProps {
  title: string;
  description: string;
  dataSourceType: FavoriteDataSourceType;
  listTitleOrUrl: string;
  maxItems: number;
  showMetadata: boolean;
  favoritesJson: string;
}

export interface IFavoriteLoadConfig {
  title: string;
  description: string;
  dataSourceType: FavoriteDataSourceType;
  listTitleOrUrl: string;
  maxItems: number;
  showMetadata: boolean;
  favoritesJson: string;
  userDisplayName: string;
  webAbsoluteUrl: string;
  currentUserId: number;
}

export type FavoritesLoadState = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface IFavoritesViewModel {
  state: FavoritesLoadState;
  title: string;
  description: string;
  sourceLabel: string;
  items: IFavoriteItem[];
  warnings: string[];
  hasPartialData: boolean;
  userDisplayName: string;
  errorMessage?: string;
}
