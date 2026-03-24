import type { SPHttpClient } from '@microsoft/sp-http';

export type TeamMembersDataSourceType = 'SharePointList' | 'Directory' | 'JsonUrl' | 'StaticConfig';
export type TeamMembersSortMode = 'manual' | 'role' | 'name';
export type TeamMembersViewState = 'loading' | 'ready' | 'empty' | 'partialData' | 'error';

export interface IMeetTheTeamWebPartProps {
  title: string;
  description: string;
  dataSourceType: TeamMembersDataSourceType;
  dataSourceTypesCsv: string;
  listTitleOrUrl: string;
  jsonUrl: string;
  directoryEndpoint: string;
  staticMembersJson: string;
  maxItems: number;
  sortMode: TeamMembersSortMode;
}

export interface IMeetTheTeamHostContext {
  spHttpClient: SPHttpClient;
  webUrl: string;
  siteUrl: string;
}

export interface IMeetTheTeamRequest {
  webPartProps: IMeetTheTeamWebPartProps;
  hostContext: IMeetTheTeamHostContext;
}

export interface ITeamMemberInput {
  id?: string;
  displayName?: string;
  jobTitle?: string;
  bio?: string;
  photoUrl?: string;
  profileUrl?: string;
  sortOrder?: number | string;
  initials?: string;
}

export interface ITeamMember {
  id: string;
  displayName: string;
  jobTitle: string;
  bio: string;
  photoUrl?: string;
  profileUrl?: string;
  sortOrder?: number;
  initials: string;
  partialData: boolean;
}

export interface ITeamMembersRepositoryResult {
  items: ITeamMember[];
  sourceLabel: string;
  notes: string[];
  hasPartialData: boolean;
}

export interface ITeamMembersViewModel {
  title: string;
  description: string;
  sourceLabel: string;
  items: ITeamMember[];
  state: TeamMembersViewState;
  hasPartialData: boolean;
  notes: string[];
}
