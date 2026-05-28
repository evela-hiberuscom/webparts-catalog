import { createSafeExternalLink } from '@paquete/spfx-common/utils';
import type {
  IHierarchyBuildResult,
  IPortalNode,
  IPortalNodeGroup,
  IPortalTreeNode,
  PortalMapDataSourceType,
  PortalNodeType
} from '../models/portalMapModels';
import { escapeODataString as escapeODataListTitle } from '@paquete/spfx-common';

interface IRecordLike {
  [key: string]: unknown;
}

const NODE_TYPE_ORDER: PortalNodeType[] = ['hub', 'site', 'area', 'utility', 'unknown'];

function isRecord(value: unknown): value is IRecordLike {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function normalizeText(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed) {
      return trimmed;
    }
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value);
  }

  return fallback;
}

export function normalizeOptionalText(value: unknown): string | undefined {
  const normalized = normalizeText(value);
  return normalized || undefined;
}

export function parseBoolean(value: unknown): boolean {
  if (typeof value === 'boolean') {
    return value;
  }

  const normalized = normalizeText(value).toLowerCase();
  return normalized === 'true' || normalized === '1' || normalized === 'yes' || normalized === 'si';
}

export function normalizeNumber(value: unknown, fallback: number): number {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
}

export function readField(record: IRecordLike, names: string[]): unknown {
  for (let index = 0; index < names.length; index += 1) {
    const name = names[index];
    if (Object.prototype.hasOwnProperty.call(record, name)) {
      return record[name];
    }
  }

  return undefined;
}

export function normalizeNodeType(value: unknown): { nodeType: PortalNodeType; isPartial: boolean } {
  const normalized = normalizeText(value).toLowerCase();

  if (normalized === 'hub') {
    return { nodeType: 'hub', isPartial: false };
  }

  if (normalized === 'site' || normalized === 'portal') {
    return { nodeType: 'site', isPartial: false };
  }

  if (normalized === 'area' || normalized === 'section') {
    return { nodeType: 'area', isPartial: false };
  }

  if (normalized === 'utility' || normalized === 'tool' || normalized === 'service') {
    return { nodeType: 'utility', isPartial: false };
  }

  return { nodeType: 'unknown', isPartial: true };
}

export function parsePortalNode(raw: unknown, index: number): IPortalNode {
  const record = isRecord(raw) ? raw : {};
  const titleCandidate = readField(record, ['Title', 'title', 'Name', 'name', 'NodeName', 'nodeName']);
  const safeLink = createSafeExternalLink(
    normalizeOptionalText(readField(record, ['OpenUrl', 'openUrl', 'Url', 'url', 'LinkUrl', 'linkUrl', 'Path', 'FileRef']))
  );
  const nodeTypeResult = normalizeNodeType(
    readField(record, ['NodeType', 'nodeType', 'Type', 'type', 'PortalType', 'portalType'])
  );

  return {
    id: normalizeText(readField(record, ['Id', 'ID', 'id', 'Key', 'key']), `node-${index + 1}`),
    title: normalizeText(titleCandidate, `Portal ${index + 1}`),
    nodeType: nodeTypeResult.nodeType,
    parentId: normalizeOptionalText(
      readField(record, ['ParentId', 'parentId', 'ParentID', 'ParentLookupId', 'parentLookupId', 'HubId', 'hubId'])
    ),
    description: normalizeOptionalText(readField(record, ['Description', 'description', 'Summary', 'summary'])),
    openUrl: safeLink ? safeLink.href : undefined,
    featured: parseBoolean(readField(record, ['Featured', 'featured', 'IsFeatured', 'isFeatured'])),
    sortOrder: normalizeNumber(readField(record, ['SortOrder', 'sortOrder', 'Order', 'order']), index + 1),
    partialData: Boolean(nodeTypeResult.isPartial || !safeLink || !normalizeText(titleCandidate))
  };
}

export function parsePortalCollection(payload: unknown): unknown[] {
  if (Array.isArray(payload)) {
    return payload;
  }

  if (isRecord(payload) && Array.isArray(payload.items)) {
    return payload.items;
  }

  if (isRecord(payload) && Array.isArray(payload.value)) {
    return payload.value;
  }

  if (isRecord(payload) && Array.isArray(payload.results)) {
    return payload.results;
  }

  if (isRecord(payload) && isRecord(payload.d) && Array.isArray(payload.d.results)) {
    return payload.d.results;
  }

  throw new Error('Expected an array payload or a payload with items/value/results.');
}

export function resolveSameOriginUrl(rawUrl: string, webUrl: string): string {
  const trimmed = normalizeText(rawUrl);
  if (!trimmed) {
    throw new Error('url is required');
  }

  const resolved = new URL(trimmed, webUrl);
  if (resolved.origin !== new URL(webUrl).origin) {
    throw new Error('JsonUrl must be same-origin or relative');
  }

  return resolved.toString();
}

export function deriveServerRelativeListPath(listTitleOrUrl: string, webUrl: string): string {
  const resolved = new URL(listTitleOrUrl, webUrl);
  if (resolved.origin !== new URL(webUrl).origin) {
    throw new Error('listTitleOrUrl must be same-origin or relative');
  }

  let pathName = decodeURIComponent(resolved.pathname).replace(/\/$/, '');
  const lowerPath = pathName.toLowerCase();

  if (lowerPath.endsWith('/forms/allitems.aspx')) {
    pathName = pathName.slice(0, -'/Forms/AllItems.aspx'.length);
  } else if (lowerPath.endsWith('/allitems.aspx')) {
    pathName = pathName.slice(0, -'/AllItems.aspx'.length);
  } else if (lowerPath.endsWith('/forms')) {
    pathName = pathName.slice(0, -'/Forms'.length);
  }

  return pathName || '/';
}

export function buildPortalMapItemsEndpoint(webUrl: string, listTitleOrUrl: string): string {
  const value = normalizeText(listTitleOrUrl);
  if (!value) {
    throw new Error('listTitleOrUrl is required when sourceType is SharePointList');
  }

  const select =
    '$select=Id,Title,NodeType,ParentId,ParentLookupId,Description,OpenUrl,Featured,SortOrder,FileRef,Url';
  const orderBy = '$orderby=Featured desc,SortOrder asc,Title asc';
  const top = '$top=200';

  if (value.charAt(0) === '/' || value.toLowerCase().indexOf('http') === 0) {
    const serverRelativePath = deriveServerRelativeListPath(value, webUrl);
    return (
      `${webUrl}/_api/web/GetList(@listUrl)/items?${select}&${orderBy}&${top}` +
      `&@listUrl='${encodeURIComponent(serverRelativePath)}'`
    );
  }

  return (
    `${webUrl}/_api/web/lists/getByTitle('${escapeODataListTitle(value)}')/items?` +
    `${select}&${orderBy}&${top}`
  );
}

export function createStaticPortalNodes(): IPortalNode[] {
  const rawItems = [
    {
      Id: 'hub-sales',
      Title: 'Hub Comercial',
      NodeType: 'hub',
      Description: 'Acceso principal a ventas, clientes y operaciones comerciales.',
      OpenUrl: '/sites/sales-hub',
      Featured: true,
      SortOrder: 1
    },
    {
      Id: 'site-customers',
      Title: 'Portal Clientes',
      NodeType: 'site',
      ParentId: 'hub-sales',
      Description: 'Recursos y procesos para atención y éxito de cliente.',
      OpenUrl: '/sites/clientes',
      SortOrder: 2
    },
    {
      Id: 'site-pricing',
      Title: 'Ofertas y pricing',
      NodeType: 'area',
      ParentId: 'hub-sales',
      Description: 'Tarifas, plantillas y políticas comerciales.',
      OpenUrl: '/sites/sales-hub/pricing',
      SortOrder: 3
    },
    {
      Id: 'hub-people',
      Title: 'Hub Personas',
      NodeType: 'hub',
      Description: 'Servicios al empleado, onboarding y cultura.',
      OpenUrl: '/sites/people-hub',
      Featured: true,
      SortOrder: 4
    },
    {
      Id: 'utility-search',
      Title: 'Buscador global',
      NodeType: 'utility',
      ParentId: 'hub-people',
      Description: 'Herramienta transversal para localizar recursos corporativos.',
      SortOrder: 5
    }
  ];

  return rawItems.map((item, index) => parsePortalNode(item, index));
}

function sortNodes(items: IPortalNode[]): IPortalNode[] {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.title.localeCompare(right.title);
  });
}

function sortTreeItems(items: IPortalTreeNode[]): IPortalTreeNode[] {
  return [...items].sort((left, right) => {
    if (left.featured !== right.featured) {
      return left.featured ? -1 : 1;
    }

    if (left.sortOrder !== right.sortOrder) {
      return left.sortOrder - right.sortOrder;
    }

    return left.title.localeCompare(right.title);
  });
}

function nodeCreatesCycle(nodeId: string, parentId: string, lookup: { [key: string]: IPortalNode }): boolean {
  let currentId = parentId;

  while (currentId) {
    if (currentId === nodeId) {
      return true;
    }

    const current = lookup[currentId];
    if (!current || !current.parentId) {
      return false;
    }

    currentId = current.parentId;
  }

  return false;
}

function pushRoot(roots: IPortalTreeNode[], node: IPortalTreeNode): void {
  for (let index = 0; index < roots.length; index += 1) {
    if (roots[index].id === node.id) {
      return;
    }
  }

  roots.push(node);
}

function assignDepthAndTrim(nodes: IPortalTreeNode[], depth: number, maxDepth: number): boolean {
  let trimmed = false;

  for (let index = 0; index < nodes.length; index += 1) {
    const node = nodes[index];
    node.depth = depth;

    if (depth >= maxDepth && node.children.length > 0) {
      node.children = [];
      node.isTrimmed = true;
      trimmed = true;
      continue;
    }

    if (node.children.length > 0 && assignDepthAndTrim(node.children, depth + 1, maxDepth)) {
      trimmed = true;
    }
  }

  return trimmed;
}

export function buildPortalHierarchy(items: IPortalNode[], maxDepth: number): IHierarchyBuildResult {
  const sourceItems = sortNodes(items);
  const nodeLookup: { [key: string]: IPortalNode } = {};
  const treeLookup: { [key: string]: IPortalTreeNode } = {};
  const roots: IPortalTreeNode[] = [];
  let hasOrphans = false;
  let hasCycles = false;

  for (let index = 0; index < sourceItems.length; index += 1) {
    const item = sourceItems[index];
    nodeLookup[item.id] = item;
    treeLookup[item.id] = {
      ...item,
      depth: 0,
      children: [],
      isOrphan: false,
      hasCycle: false,
      isTrimmed: false
    };
  }

  for (let index = 0; index < sourceItems.length; index += 1) {
    const item = sourceItems[index];
    const node = treeLookup[item.id];
    const parentId = normalizeText(item.parentId);

    if (!parentId) {
      pushRoot(roots, node);
      continue;
    }

    const parentNode = treeLookup[parentId];
    if (!parentNode) {
      node.isOrphan = true;
      node.partialData = true;
      hasOrphans = true;
      pushRoot(roots, node);
      continue;
    }

    if (nodeCreatesCycle(item.id, parentId, nodeLookup)) {
      node.hasCycle = true;
      node.partialData = true;
      hasCycles = true;
      pushRoot(roots, node);
      continue;
    }

    parentNode.children.push(node);
  }

  const sortedRoots = sortTreeItems(roots);
  for (let index = 0; index < sortedRoots.length; index += 1) {
    sortedRoots[index].children = sortTreeItems(sortedRoots[index].children);
  }

  const hasTrimmedNodes = assignDepthAndTrim(sortedRoots, 0, Math.max(1, maxDepth));

  return {
    roots: sortedRoots,
    hasOrphans,
    hasCycles,
    hasTrimmedNodes
  };
}

export function flattenPortalTree(roots: IPortalTreeNode[]): IPortalNode[] {
  const items: IPortalNode[] = [];

  const walk = (nodes: IPortalTreeNode[]): void => {
    for (let index = 0; index < nodes.length; index += 1) {
      const node = nodes[index];
      items.push({
        id: node.id,
        title: node.title,
        nodeType: node.nodeType,
        parentId: node.parentId,
        description: node.description,
        openUrl: node.openUrl,
        featured: node.featured,
        sortOrder: node.sortOrder,
        partialData: node.partialData
      });

      if (node.children.length > 0) {
        walk(node.children);
      }
    }
  };

  walk(roots);
  return items;
}

export function groupPortalNodes(items: IPortalNode[]): IPortalNodeGroup[] {
  const groups: IPortalNodeGroup[] = [];

  for (let index = 0; index < NODE_TYPE_ORDER.length; index += 1) {
    const nodeType = NODE_TYPE_ORDER[index];
    const groupItems = items.filter((item) => item.nodeType === nodeType);
    if (groupItems.length > 0) {
      groups.push({
        nodeType,
        items: sortNodes(groupItems)
      });
    }
  }

  return groups;
}

export function formatSourceLabel(
  sourceType: PortalMapDataSourceType,
  listTitleOrUrl: string,
  staticLabel: string,
  jsonLabel: string,
  sharePointLabel: string
): string {
  const reference = normalizeText(listTitleOrUrl);

  if (sourceType === 'StaticConfig') {
    return staticLabel;
  }

  if (sourceType === 'JsonUrl') {
    return reference ? `${jsonLabel}: ${reference}` : jsonLabel;
  }

  return reference ? `${sharePointLabel}: ${reference}` : sharePointLabel;
}
