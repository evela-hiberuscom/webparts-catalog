import {
  buildTeamMemberInitials,
  normalizeDataSourceTypes,
  normalizeMaxItems,
  normalizeMeetTheTeamWebPartProps,
  normalizeTeamMember,
  sortTeamMembers
} from './teamMemberUtils';

describe('teamMemberUtils', () => {
  it('normalizes web part props with safe defaults', () => {
    const result = normalizeMeetTheTeamWebPartProps({
      title: '  ',
      description: '',
      dataSourceType: 'Unknown' as never,
      dataSourceTypesCsv: 'StaticConfig, SharePointList,StaticConfig',
      listTitleOrUrl: ' /sites/demo/Lists/TeamMembers ',
      jsonUrl: '',
      directoryEndpoint: '',
      staticMembersJson: '',
      maxItems: 100,
      sortMode: 'invalid' as never
    });

    expect(result.title).toBe('Conoce al equipo');
    expect(result.description).toContain('foto, rol');
    expect(result.dataSourceType).toBe('StaticConfig');
    expect(result.dataSourceTypesCsv).toContain('SharePointList');
    expect(result.maxItems).toBe(50);
    expect(result.sortMode).toBe('manual');
  });

  it('sorts by manual order, role and name', () => {
    const items = [
      normalizeTeamMember({ id: 'b', displayName: 'Zoe', jobTitle: 'Developer', sortOrder: 2, bio: 'x', photoUrl: '/img.jpg', profileUrl: '/p' }, 'b'),
      normalizeTeamMember({ id: 'a', displayName: 'Ana', jobTitle: 'Manager', sortOrder: 1, bio: 'x', photoUrl: '/img.jpg', profileUrl: '/p' }, 'a'),
      normalizeTeamMember({ id: 'c', displayName: 'Bea', jobTitle: 'Analyst', sortOrder: 3, bio: 'x', photoUrl: '/img.jpg', profileUrl: '/p' }, 'c')
    ];

    expect(sortTeamMembers(items, 'manual').map((item) => item.id)).toEqual(['a', 'b', 'c']);
    expect(sortTeamMembers(items, 'role').map((item) => item.jobTitle)).toEqual(['Analyst', 'Developer', 'Manager']);
    expect(sortTeamMembers(items, 'name').map((item) => item.displayName)).toEqual(['Ana', 'Bea', 'Zoe']);
  });

  it('builds initials and partial data markers', () => {
    const member = normalizeTeamMember(
      {
        displayName: 'Marta Gil',
        jobTitle: 'UX Designer',
        bio: 'Bio',
        photoUrl: '/img.jpg',
        profileUrl: '/p'
      },
      'fallback'
    );
    expect(buildTeamMemberInitials('Marta Gil')).toBe('MG');
    expect(member.partialData).toBe(false);
  });

  it('parses source type lists without duplicates', () => {
    expect(normalizeDataSourceTypes('StaticConfig, SharePointList, StaticConfig, JsonUrl')).toEqual([
      'StaticConfig',
      'SharePointList',
      'JsonUrl'
    ]);
    expect(normalizeMaxItems('8')).toBe(8);
  });
});
