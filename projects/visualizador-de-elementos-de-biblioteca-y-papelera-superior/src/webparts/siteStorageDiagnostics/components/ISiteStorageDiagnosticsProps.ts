import type { IHttpClient } from '../models/httpClient';
import type { IScanConfiguration } from '../models/scanConfiguration';

export interface ISiteStorageDiagnosticsProps {
  configuration: IScanConfiguration;
  spHttpClient: IHttpClient;
  currentSiteUrl: string;
}
