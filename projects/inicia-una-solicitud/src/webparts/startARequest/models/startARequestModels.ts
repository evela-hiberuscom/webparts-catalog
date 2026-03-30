export type RequestDataSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig';

export type RequestCatalogStatus = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface IStartARequestWebPartProps {
  dataSourceType: RequestDataSourceType;
  listTitleOrUrl: string;
  defaultCategory: string;
  showPrerequisites: boolean;
}

export interface IStartARequestProps extends IStartARequestWebPartProps {
  title: string;
  subtitle: string;
  webUrl: string;
}

export interface IRequestLink {
  href: string;
  external: boolean;
  target?: '_blank';
  rel?: string;
}

export interface IRequestItem {
  id: string;
  title: string;
  category: string;
  audience?: string;
  description?: string;
  prerequisites?: string;
  startUrl?: string;
  featured: boolean;
  order: number;
  actionable: boolean;
  partialData: boolean;
  startLink?: IRequestLink;
}

export interface IRequestCatalogRequest extends IStartARequestWebPartProps {
  webUrl: string;
}

export interface IRequestCatalogResult {
  items: IRequestItem[];
  sourceLabel: string;
  notes: string[];
  hasPartialData: boolean;
}

export interface IStartARequestSnapshot {
  status: RequestCatalogStatus;
  activeCategory: string;
  items: IRequestItem[];
  filteredItems: IRequestItem[];
  categories: string[];
  sourceLabel: string;
  notes: string[];
  hasPartialData: boolean;
  errorMessage?: string;
}

export interface IStartARequestViewModel extends IStartARequestSnapshot {
  setActiveCategory(category: string): void;
  refresh(): Promise<void>;
}

export interface IRequestCatalogRepository {
  loadCatalog(request: IRequestCatalogRequest): Promise<IRequestCatalogResult>;
}

export interface IRequestCatalogService {
  resolve(request: IRequestCatalogRequest): Promise<IStartARequestSnapshot>;
}
