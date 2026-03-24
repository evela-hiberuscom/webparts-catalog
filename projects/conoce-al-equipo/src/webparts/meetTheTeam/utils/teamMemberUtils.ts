import { ensureUniqueStrings } from '@paquete/spfx-common';

import type {
  IMeetTheTeamWebPartProps,
  ITeamMember,
  ITeamMemberInput,
  TeamMembersDataSourceType,
  TeamMembersSortMode
} from '../models/teamMemberModels';

export const DEFAULT_TEAM_MEMBERS_JSON = JSON.stringify(
  [
    {
      id: 'team-member-1',
      displayName: 'Laura Pérez',
      jobTitle: 'Product Manager',
      bio: 'Conecta negocio y equipo para mantener el foco en valor y prioridades.',
      photoUrl: '/sites/demo/SiteAssets/team/laura-perez.jpg',
      profileUrl: '/sites/demo/SitePages/perfil-laura-perez.aspx',
      sortOrder: 1
    },
    {
      id: 'team-member-2',
      displayName: 'Carlos Romero',
      jobTitle: 'Frontend Engineer',
      bio: 'Especialista en UI accesible y componentes reutilizables para SharePoint.',
      photoUrl: '/sites/demo/SiteAssets/team/carlos-romero.jpg',
      profileUrl: '/sites/demo/SitePages/perfil-carlos-romero.aspx',
      sortOrder: 2
    },
    {
      id: 'team-member-3',
      displayName: 'Marta Gil',
      jobTitle: 'UX Designer',
      bio: 'Diseña experiencias claras, coherentes y centradas en tareas reales.',
      photoUrl: '/sites/demo/SiteAssets/team/marta-gil.jpg',
      profileUrl: '/sites/demo/SitePages/perfil-marta-gil.aspx',
      sortOrder: 3
    }
  ],
  null,
  2
);

export function normalizeMeetTheTeamWebPartProps(
  raw: Partial<IMeetTheTeamWebPartProps> | undefined
): IMeetTheTeamWebPartProps {
  return {
    title: typeof raw?.title === 'string' && raw.title.trim() ? raw.title.trim() : 'Conoce al equipo',
    description:
      typeof raw?.description === 'string' && raw.description.trim()
        ? raw.description.trim()
        : 'Presenta a las personas de un equipo con foto, rol, descripción breve y enlaces de contacto o perfil.',
    dataSourceType: normalizeDataSourceType(raw?.dataSourceType),
    dataSourceTypesCsv:
      typeof raw?.dataSourceTypesCsv === 'string' && raw.dataSourceTypesCsv.trim()
        ? raw.dataSourceTypesCsv.trim()
        : 'SharePointList,JsonUrl,Directory,StaticConfig',
    listTitleOrUrl: typeof raw?.listTitleOrUrl === 'string' ? raw.listTitleOrUrl.trim() : '',
    jsonUrl: typeof raw?.jsonUrl === 'string' ? raw.jsonUrl.trim() : '',
    directoryEndpoint: typeof raw?.directoryEndpoint === 'string' ? raw.directoryEndpoint.trim() : '',
    staticMembersJson:
      typeof raw?.staticMembersJson === 'string' && raw.staticMembersJson.trim()
        ? raw.staticMembersJson.trim()
        : DEFAULT_TEAM_MEMBERS_JSON,
    maxItems: normalizeMaxItems(raw?.maxItems),
    sortMode: normalizeSortMode(raw?.sortMode)
  };
}

export function normalizeDataSourceTypes(value: string): TeamMembersDataSourceType[] {
  return ensureUniqueStrings(
    value
      .split(',')
      .map((entry) => normalizeDataSourceType(entry.trim()))
      .filter((entry): entry is TeamMembersDataSourceType => entry.length > 0)
  ) as TeamMembersDataSourceType[];
}

export function normalizeDataSourceType(value: unknown): TeamMembersDataSourceType {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (normalized === 'SharePointList' || normalized === 'Directory' || normalized === 'JsonUrl' || normalized === 'StaticConfig') {
    return normalized;
  }

  return 'StaticConfig';
}

export function normalizeSortMode(value: unknown): TeamMembersSortMode {
  const normalized = typeof value === 'string' ? value.trim() : '';
  if (normalized === 'role' || normalized === 'name') {
    return normalized;
  }

  return 'manual';
}

export function normalizeMaxItems(value: unknown): number {
  const parsed = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : NaN;
  if (!Number.isFinite(parsed)) {
    return 12;
  }

  return Math.min(50, Math.max(1, Math.trunc(parsed)));
}

export function buildTeamMemberInitials(displayName: string): string {
  const words = displayName
    .split(/\s+/)
    .map((word) => word.trim())
    .filter(Boolean);
  if (words.length === 0) {
    return '??';
  }

  return words
    .slice(0, 2)
    .map((word) => word.charAt(0).toUpperCase())
    .join('');
}

export function normalizeTeamMember(input: ITeamMemberInput, fallbackId: string): ITeamMember {
  const displayName = typeof input.displayName === 'string' && input.displayName.trim() ? input.displayName.trim() : `Miembro ${fallbackId}`;
  const jobTitle = typeof input.jobTitle === 'string' && input.jobTitle.trim() ? input.jobTitle.trim() : 'Rol pendiente';
  const bio = typeof input.bio === 'string' && input.bio.trim() ? input.bio.trim() : '';
  const photoUrl = typeof input.photoUrl === 'string' && input.photoUrl.trim() ? input.photoUrl.trim() : undefined;
  const profileUrl = typeof input.profileUrl === 'string' && input.profileUrl.trim() ? input.profileUrl.trim() : undefined;
  const sortOrderValue = typeof input.sortOrder === 'string' ? Number(input.sortOrder) : input.sortOrder;
  const sortOrder = Number.isFinite(Number(sortOrderValue)) ? Number(sortOrderValue) : undefined;
  const initials = typeof input.initials === 'string' && input.initials.trim() ? input.initials.trim().slice(0, 2).toUpperCase() : buildTeamMemberInitials(displayName);
  const partialData = !photoUrl || !bio || !profileUrl || !jobTitle || jobTitle === 'Rol pendiente';

  return {
    id: typeof input.id === 'string' && input.id.trim() ? input.id.trim() : fallbackId,
    displayName,
    jobTitle,
    bio,
    photoUrl,
    profileUrl,
    sortOrder,
    initials,
    partialData
  };
}

export function normalizeTeamMembers(inputs: ITeamMemberInput[]): ITeamMember[] {
  return inputs.map((input, index) => normalizeTeamMember(input, `team-member-${index + 1}`));
}

export function sortTeamMembers(items: ITeamMember[], sortMode: TeamMembersSortMode): ITeamMember[] {
  const sorted = [...items];

  if (sortMode === 'name') {
    return sorted.sort((left, right) => left.displayName.localeCompare(right.displayName, 'es', { sensitivity: 'base' }));
  }

  if (sortMode === 'role') {
    return sorted.sort((left, right) => {
      const roleComparison = left.jobTitle.localeCompare(right.jobTitle, 'es', { sensitivity: 'base' });
      if (roleComparison !== 0) {
        return roleComparison;
      }

      return left.displayName.localeCompare(right.displayName, 'es', { sensitivity: 'base' });
    });
  }

  return sorted.sort((left, right) => {
    const leftOrder = typeof left.sortOrder === 'number' ? left.sortOrder : Number.MAX_SAFE_INTEGER;
    const rightOrder = typeof right.sortOrder === 'number' ? right.sortOrder : Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) {
      return leftOrder - rightOrder;
    }

    return left.displayName.localeCompare(right.displayName, 'es', { sensitivity: 'base' });
  });
}

export function toTeamMemberInputs(payload: unknown): ITeamMemberInput[] {
  if (Array.isArray(payload)) {
    return payload as ITeamMemberInput[];
  }

  if (payload && typeof payload === 'object') {
    const record = payload as { items?: unknown; value?: unknown };
    if (Array.isArray(record.items)) {
      return record.items as ITeamMemberInput[];
    }

    if (Array.isArray(record.value)) {
      return record.value as ITeamMemberInput[];
    }
  }

  return [];
}

export function readFirstString(record: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

export function readFirstNumber(record: Record<string, unknown>, keys: string[]): number | undefined {
  for (const key of keys) {
    const value = record[key];
    const numericValue = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : Number.NaN;
    if (Number.isFinite(numericValue)) {
      return numericValue;
    }
  }

  return undefined;
}

export function normalizeMemberRecord(record: Record<string, unknown>, fallbackId: string): ITeamMemberInput {
  const displayName = readFirstString(record, ['displayName', 'DisplayName', 'Title', 'Name', 'FullName']);

  return {
    id: readFirstString(record, ['id', 'Id', 'ID']),
    displayName,
    jobTitle: readFirstString(record, ['jobTitle', 'JobTitle', 'Role', 'Position']),
    bio: readFirstString(record, ['bio', 'Bio', 'summary', 'Summary', 'description', 'Description']),
    photoUrl: readFirstString(record, ['photoUrl', 'PhotoUrl', 'Photo', 'Picture', 'PictureUrl']),
    profileUrl: readFirstString(record, ['profileUrl', 'ProfileUrl', 'Url', 'Profile', 'Link']),
    sortOrder: readFirstNumber(record, ['sortOrder', 'SortOrder', 'order', 'Order']),
    initials:
      readFirstString(record, ['initials', 'Initials']) ??
      buildTeamMemberInitials(displayName ?? fallbackId)
  };
}
