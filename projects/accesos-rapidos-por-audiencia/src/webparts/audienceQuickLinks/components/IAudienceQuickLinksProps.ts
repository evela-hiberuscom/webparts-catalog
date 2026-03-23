import type {
  IAudienceQuickLinksHostContext,
  IAudienceQuickLinksWebPartProps
} from '../models/audienceLinkModels';

export interface IAudienceQuickLinksProps {
  webPartProps: IAudienceQuickLinksWebPartProps;
  hostContext: IAudienceQuickLinksHostContext;
  isDarkTheme: boolean;
  environmentMessage: string;
  hasTeamsContext: boolean;
  userDisplayName: string;
}
