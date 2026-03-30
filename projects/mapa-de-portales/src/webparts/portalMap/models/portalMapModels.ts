export type PortalMapDataSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig';
export type PortalMapViewMode = 'tree' | 'grouped' | 'cards';
export type PortalNodeType = 'hub' | 'site' | 'area' | 'utility' | 'unknown';
export type PortalMapState = 'loading' | 'ready' | 'partialData' | 'empty' | 'error';

export interface IPortalMapWebPartProps {
  dataSourceType: PortalMapDataSourceType;
  listTitleOrUrl: string;
  viewMode: PortalMapViewMode;
  maxDepth: number;
}

export interface IPortalMapRequest extends IPortalMapWebPartProps {
  webUrl: string;
}

export interface IPortalNode {
  id: string;
  title: string;
  nodeType: PortalNodeType;
  parentId?: string;
  description?: string;
  openUrl?: string;
  featured: boolean;
  sortOrder: number;
  partialData: boolean;
}

export interface IPortalTreeNode extends IPortalNode {
  depth: number;
  children: IPortalTreeNode[];
  isOrphan: boolean;
  hasCycle: boolean;
  isTrimmed: boolean;
}

export interface IPortalNodeGroup {
  nodeType: PortalNodeType;
  items: IPortalNode[];
}

export interface IPortalMapRepositoryResult {
  items: IPortalNode[];
  hasPartialData: boolean;
}

export interface IPortalMapSnapshot {
  state: PortalMapState;
  roots: IPortalTreeNode[];
  flatItems: IPortalNode[];
  groupedItems: IPortalNodeGroup[];
  sourceLabel: string;
  hasPartialData: boolean;
  notes: string[];
  errorMessage?: string;
  resolvedViewMode: PortalMapViewMode;
}

export interface IHierarchyBuildResult {
  roots: IPortalTreeNode[];
  hasOrphans: boolean;
  hasCycles: boolean;
  hasTrimmedNodes: boolean;
}
