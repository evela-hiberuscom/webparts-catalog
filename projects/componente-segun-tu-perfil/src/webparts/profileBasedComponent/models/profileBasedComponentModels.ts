export type ProfileDataSourceType = 'SharePointList' | 'JsonUrl' | 'StaticConfig';

export type ProfileAudienceMode = 'department' | 'country' | 'role' | 'group' | 'hybrid';

export type ProfileFallbackMode = 'generic' | 'empty';

export type ProfileVariantContentType = 'card' | 'message' | 'links';

export interface IProfileVariantLink {
  label: string;
  url: string;
}

export interface IProfileVariant {
  id: string;
  title: string;
  summary: string;
  body?: string;
  iconName?: string;
  accentLabel?: string;
  ctaLabel?: string;
  ctaUrl?: string;
  audienceTokens: string[];
  isGeneric: boolean;
  contentType: ProfileVariantContentType;
  priority?: number;
  tags: string[];
  payload: Record<string, unknown>;
}

export interface IProfileContextSnapshot {
  siteUrl: string;
  displayName: string;
  email?: string;
  loginName?: string;
  profileTokens?: string;
}

export interface IProfileBasedComponentWebPartConfiguration {
  title: string;
  description: string;
  dataSourceType: ProfileDataSourceType;
  listTitleOrUrl: string;
  jsonUrl: string;
  staticConfigJson: string;
  audienceMode: ProfileAudienceMode;
  fallbackMode: ProfileFallbackMode;
  maxItems: number;
}

export interface IProfileVariantSourceConfig {
  dataSourceType: ProfileDataSourceType;
  listTitleOrUrl: string;
  jsonUrl: string;
  staticConfigJson: string;
}

export interface IProfileVariantRequest extends IProfileVariantSourceConfig {
  siteUrl: string;
  title: string;
  description: string;
  audienceMode: ProfileAudienceMode;
  fallbackMode: ProfileFallbackMode;
  maxItems: number;
}

export interface IProfileBasedComponentViewModel {
  state: 'loading' | 'ready' | 'empty' | 'partialData' | 'error';
  title: string;
  description: string;
  sourceLabel: string;
  currentTokens: string[];
  matchedTokens: string[];
  fallbackApplied: boolean;
  variant?: IProfileVariant;
  variants: IProfileVariant[];
  message: string;
  errorMessage?: string;
}

export interface IProfileVariantRepository {
  loadVariants(request: IProfileVariantRequest): Promise<IProfileVariant[]>;
}

export interface IProfileBasedComponentService {
  resolve(
    request: IProfileVariantRequest,
    context: IProfileContextSnapshot
  ): Promise<IProfileBasedComponentViewModel>;
}
