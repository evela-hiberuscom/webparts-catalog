import { classifyAsyncState, createSafeExternalLink, ensureUniqueStrings } from '@paquete/spfx-common';
import type {
  IOrgLoadResult,
  IOrgPerson,
  IOrgTreeNode,
  IOrgViewModel,
  MiniOrgChartDataSourceType,
  MiniOrgChartState,
  MiniOrgChartViewMode
} from '../models/miniOrgChartModels';

const allowedSources: MiniOrgChartDataSourceType[] = ['Directory', 'SharePointList', 'JsonUrl', 'StaticConfig'];

export function normalizeDataSourceTypes(raw?: string): MiniOrgChartDataSourceType[] {
  if (!raw) {
    return ['Directory', 'SharePointList'];
  }

  const values = raw.split(',').map((value) => value.trim()).filter((value): value is MiniOrgChartDataSourceType => {
    return allowedSources.indexOf(value as MiniOrgChartDataSourceType) >= 0;
  });

  return ensureUniqueStrings(values) as MiniOrgChartDataSourceType[];
}

export function sanitizeMaxDepth(value?: number, fallback = 2): number {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : value;
  if (!Number.isFinite(parsed)) {
    return fallback;
  }

  return Math.min(4, Math.max(1, Math.floor(Number(parsed))));
}

export function normalizeText(value?: string): string {
  return (value ?? '').trim();
}

export function normalizeSearchText(value?: string): string {
  return normalizeText(value).toLocaleLowerCase('es-ES');
}

export function normalizeListRootPath(listTitleOrUrl?: string, webAbsoluteUrl?: string): string | undefined {
  const rawValue = normalizeText(listTitleOrUrl);
  if (!rawValue) {
    return undefined;
  }

  if (!rawValue.includes('/') && !rawValue.startsWith('http')) {
    return rawValue;
  }

  const resolvedUrl = new URL(rawValue, webAbsoluteUrl ?? window.location.origin);
  if (webAbsoluteUrl && resolvedUrl.origin !== new URL(webAbsoluteUrl).origin) {
    throw new Error('List URL must be same-origin.');
  }

  return resolvedUrl.pathname
    .replace(/\/Forms\/AllItems\.aspx$/i, '')
    .replace(/\/AllItems\.aspx$/i, '')
    .replace(/\/$/, '');
}

export function buildSharePointListEndpoint(listTitleOrUrl?: string, webAbsoluteUrl?: string): string | undefined {
  const normalized = normalizeListRootPath(listTitleOrUrl, webAbsoluteUrl);
  if (!normalized) {
    return undefined;
  }

  if (!normalized.startsWith('/')) {
    const escapedTitle = normalized.replace(/'/g, "''");
    return `/_api/web/lists/getByTitle('${escapedTitle}')/items?$select=Id,Title,JobTitle,PhotoUrl,ProfileUrl,ManagerId,ReportIds,Department,EMail&$top=500`;
  }

  const encodedPath = encodeURIComponent(normalized);
  return `/_api/web/GetList(@listUrl)/items?@listUrl='${encodedPath}'&$select=Id,Title,JobTitle,PhotoUrl,ProfileUrl,ManagerId,ReportIds,Department,EMail&$top=500`;
}

function splitValues(value?: string | string[] | number[] | null): string[] {
  if (!value) {
    return [];
  }

  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }

  return String(value).split(/[;,|]/).map((item) => item.trim()).filter(Boolean);
}

function firstText(...values: Array<string | null | undefined>): string | undefined {
  for (const value of values) {
    const normalized = normalizeText(value ?? undefined);
    if (normalized) {
      return normalized;
    }
  }

  return undefined;
}

export function normalizeOrgPerson(raw: Record<string, unknown>, sourceLabel: MiniOrgChartDataSourceType | 'Unknown'): IOrgPerson | null {
  const displayName = firstText(
    typeof raw.displayName === 'string' ? raw.displayName : undefined,
    typeof raw.DisplayName === 'string' ? raw.DisplayName : undefined,
    typeof raw.Title === 'string' ? raw.Title : undefined,
    typeof raw.Name === 'string' ? raw.Name : undefined
  );

  if (!displayName) {
    return null;
  }

  const profileUrl = firstText(
    typeof raw.profileUrl === 'string' ? raw.profileUrl : undefined,
    typeof raw.ProfileUrl === 'string' ? raw.ProfileUrl : undefined,
    typeof raw.Url === 'string' ? raw.Url : undefined,
    typeof raw.PersonalUrl === 'string' ? raw.PersonalUrl : undefined
  );
  const photoUrl = firstText(
    typeof raw.photoUrl === 'string' ? raw.photoUrl : undefined,
    typeof raw.PhotoUrl === 'string' ? raw.PhotoUrl : undefined,
    typeof raw.PictureUrl === 'string' ? raw.PictureUrl : undefined
  );
  const jobTitle = firstText(
    typeof raw.jobTitle === 'string' ? raw.jobTitle : undefined,
    typeof raw.JobTitle === 'string' ? raw.JobTitle : undefined,
    typeof raw.Position === 'string' ? raw.Position : undefined
  );
  const managerId = firstText(
    typeof raw.managerId === 'string' ? raw.managerId : undefined,
    typeof raw.ManagerId === 'string' ? raw.ManagerId : undefined,
    typeof raw.Manager === 'string' ? raw.Manager : undefined
  );
  const department = firstText(
    typeof raw.department === 'string' ? raw.department : undefined,
    typeof raw.Department === 'string' ? raw.Department : undefined
  );
  const email = firstText(
    typeof raw.email === 'string' ? raw.email : undefined,
    typeof raw.EMail === 'string' ? raw.EMail : undefined,
    typeof raw.Mail === 'string' ? raw.Mail : undefined
  );
  const id = firstText(
    typeof raw.id === 'string' ? raw.id : undefined,
    typeof raw.ID === 'string' ? raw.ID : undefined,
    typeof raw.Id === 'string' ? raw.Id : undefined,
    profileUrl,
    email,
    displayName
  ) ?? displayName;

  return {
    id,
    displayName,
    jobTitle,
    photoUrl,
    profileUrl,
    managerId,
    reportIds: splitValues(
      typeof raw.reportIds === 'string' || Array.isArray(raw.reportIds)
        ? (raw.reportIds as string | string[])
        : typeof raw.ReportIds === 'string' || Array.isArray(raw.ReportIds)
          ? (raw.ReportIds as string | string[])
          : undefined
    ),
    department,
    email,
    sourceLabel,
    isPartial: !photoUrl || !profileUrl || !managerId
  };
}

export function extractArray(payload: unknown): Record<string, unknown>[] {
  if (Array.isArray(payload)) {
    return payload.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
  }

  if (payload && typeof payload === 'object') {
    const value = payload as Record<string, unknown>;
    if (Array.isArray(value.items)) {
      return value.items.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
    }
    if (Array.isArray(value.value)) {
      return value.value.filter((item): item is Record<string, unknown> => !!item && typeof item === 'object');
    }
  }

  return [];
}

export function mapToOrgPeople(payload: unknown, sourceLabel: MiniOrgChartDataSourceType | 'Unknown'): IOrgPerson[] {
  return extractArray(payload)
    .map((item) => normalizeOrgPerson(item, sourceLabel))
    .filter((item): item is IOrgPerson => !!item);
}

export function sortPeople(left: IOrgPerson, right: IOrgPerson): number {
  const leftScore = [left.jobTitle ? 2 : 0, left.profileUrl ? 2 : 0, left.photoUrl ? 1 : 0, left.reportIds.length ? 1 : 0, left.managerId ? 0 : 1].reduce((sum, value) => sum + value, 0);
  const rightScore = [right.jobTitle ? 2 : 0, right.profileUrl ? 2 : 0, right.photoUrl ? 1 : 0, right.reportIds.length ? 1 : 0, right.managerId ? 0 : 1].reduce((sum, value) => sum + value, 0);

  if (leftScore !== rightScore) {
    return rightScore - leftScore;
  }

  return left.displayName.localeCompare(right.displayName, 'es-ES');
}

export function mergePeople(people: IOrgPerson[]): IOrgPerson[] {
  const byId = new Map<string, IOrgPerson>();

  for (const person of people) {
    const key = person.id.trim().toLocaleLowerCase('es-ES');
    const existing = byId.get(key);
    if (!existing) {
      byId.set(key, person);
      continue;
    }

    byId.set(key, {
      ...existing,
      ...person,
      reportIds: ensureUniqueStrings([...existing.reportIds, ...person.reportIds]),
      isPartial: existing.isPartial || person.isPartial
    });
  }

  return Array.from(byId.values()).sort(sortPeople);
}

export function pickRootPerson(people: IOrgPerson[], rootPersonId?: string): IOrgPerson | undefined {
  if (!people.length) {
    return undefined;
  }

  if (rootPersonId) {
    const explicit = people.find((person) => person.id.toLocaleLowerCase('es-ES') === rootPersonId.trim().toLocaleLowerCase('es-ES'));
    if (explicit) {
      return explicit;
    }
  }

  const topManagers = people.filter((person) => !person.managerId);
  return (topManagers.length ? topManagers : people).sort(sortPeople)[0];
}

function sortChildPeople(left: IOrgPerson, right: IOrgPerson): number {
  if (left.id === right.id) {
    return 0;
  }
  if (left.id === right.managerId) {
    return -1;
  }
  if (right.id === left.managerId) {
    return 1;
  }
  return sortPeople(left, right);
}

export function buildOrgTree(people: IOrgPerson[], rootPersonId?: string, maxDepth = 2): IOrgTreeNode | null {
  const root = pickRootPerson(people, rootPersonId);
  if (!root) {
    return null;
  }

  const buildNode = (person: IOrgPerson, depth: number): IOrgTreeNode => ({
    person,
    depth,
    children: depth >= maxDepth
      ? []
      : people.filter((candidate) => candidate.managerId?.toLocaleLowerCase('es-ES') === person.id.toLocaleLowerCase('es-ES'))
        .sort(sortChildPeople)
        .map((candidate) => buildNode(candidate, depth + 1))
  });

  return buildNode(root, 1);
}

export function flattenTree(node: IOrgTreeNode | null): IOrgPerson[] {
  if (!node) {
    return [];
  }

  return node.children.reduce<IOrgPerson[]>(
    (accumulator, child) => accumulator.concat(flattenTree(child)),
    [node.person]
  );
}

export function filterTree(node: IOrgTreeNode | null, query: string): IOrgTreeNode | null {
  const normalizedQuery = normalizeSearchText(query);
  if (!normalizedQuery) {
    return node;
  }

  if (!node) {
    return null;
  }

  const matches = [node.person.displayName, node.person.jobTitle, node.person.department, node.person.email]
    .filter(Boolean)
    .some((value) => normalizeSearchText(value ?? '').includes(normalizedQuery));
  const children = node.children.map((child) => filterTree(child, normalizedQuery)).filter((child): child is IOrgTreeNode => !!child);

  if (!matches && !children.length) {
    return null;
  }

  return { ...node, children };
}

export function createProfileLink(person: IOrgPerson): { href: string; rel: string; target: string } | undefined {
  return createSafeExternalLink(person.profileUrl ?? '');
}

export function buildViewState(loadResult: IOrgLoadResult, tree: IOrgTreeNode | null): MiniOrgChartState {
  return classifyAsyncState({
    hasData: !!tree,
    hasError: loadResult.errors.length > 0 && !loadResult.people.length,
    isLoading: false,
    isPartial: loadResult.warnings.length > 0 || loadResult.people.some((person) => person.isPartial)
  });
}

export function buildViewModel(loadResult: IOrgLoadResult, tree: IOrgTreeNode | null, query: string): IOrgViewModel {
  const filteredTree = filterTree(tree, query);
  const flatPeople = flattenTree(filteredTree);

  return {
    state: buildViewState(loadResult, filteredTree),
    root: filteredTree,
    flatPeople,
    partialReasons: [
      ...loadResult.warnings,
      ...loadResult.people.filter((person) => person.isPartial).map((person) => `${person.displayName} arrived with partial data`)
    ],
    filteredCount: flatPeople.length,
    totalCount: loadResult.people.length
  };
}

export function resolveViewMode(value?: MiniOrgChartViewMode): MiniOrgChartViewMode {
  return value === 'chain' || value === 'smallTree' ? value : 'managerWithReports';
}
