import { SPHttpClient, ISPHttpClientConfiguration } from '@microsoft/sp-http';
import type { FetchLike, IFeaturedQuestion, IFeaturedQuestionConfiguration } from '../models/featuredQuestionModels';

export interface IFeaturedQuestionRepositoryOptions {
  fetchClient: FetchLike;
  spHttpClient: SPHttpClient;
  spHttpClientConfiguration: ISPHttpClientConfiguration;
  webAbsoluteUrl: string;
}

interface ISPListItem {
  Id: number;
  Question?: string;
  Context?: string;
  Category?: string;
  AuthorName?: string;
  AuthorPhotoUrl?: string;
  OptionsJson?: string;
  ExpiresAt?: string;
}

function normalizeListUrl(listTitleOrUrl: string, webAbsoluteUrl: string): string {
  if (!listTitleOrUrl) return listTitleOrUrl;
  const trimmed = listTitleOrUrl.trim();
  if (trimmed.startsWith('http')) {
    try {
      const url = new URL(trimmed);
      if (url.origin === new URL(webAbsoluteUrl).origin) {
        let path = url.pathname;
        if (path.toLowerCase().includes('/forms/')) path = path.split('/forms/')[0];
        else if (path.toLowerCase().includes('/allitems.aspx')) path = path.split('/AllItems.aspx')[0];
        return path;
      }
    } catch { return trimmed; }
  }
  return trimmed;
}

export class FeaturedQuestionRepository {
  private _fetchClient: FetchLike;
  private _spHttpClient: SPHttpClient;
  private _webAbsoluteUrl: string;

  constructor(options: IFeaturedQuestionRepositoryOptions) {
    this._fetchClient = options.fetchClient;
    this._spHttpClient = options.spHttpClient;
    this._webAbsoluteUrl = options.webAbsoluteUrl;
  }

  async getQuestion(config: IFeaturedQuestionConfiguration): Promise<IFeaturedQuestion[]> {
    if (config.dataSourceType === 'StaticConfig') return this.getStaticQuestions();
    if (config.dataSourceType === 'JsonUrl') return this.getQuestionsFromJsonUrl(config.listTitleOrUrl);
    return this.getQuestionsFromSharePointList(config.listTitleOrUrl);
  }

  private async getQuestionsFromSharePointList(listTitleOrUrl: string): Promise<IFeaturedQuestion[]> {
    const normalizedUrl = normalizeListUrl(listTitleOrUrl, this._webAbsoluteUrl);
    const isUrl = normalizedUrl.startsWith('/');
    const listUrl = isUrl 
      ? `${this._webAbsoluteUrl}/_api/web/GetList(@listUrl)?@listUrl='${encodeURIComponent(normalizedUrl)}'`
      : `${this._webAbsoluteUrl}/_api/web/lists/getByTitle('${encodeURIComponent(normalizedUrl)}')`;
    
    const itemsUrl = `${listUrl}/items?$top=1&$orderby=Created desc`;
    const response = await this._spHttpClient.get(itemsUrl, SPHttpClient.configurations.v1);
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data = await response.json();
    return (data.value || []).map((item: ISPListItem) => this.mapToQuestion(item));
  }

  private mapToQuestion(item: ISPListItem): IFeaturedQuestion {
    let options: { text: string; votes: number }[] = [];
    try {
      if (item.OptionsJson) options = JSON.parse(item.OptionsJson);
    } catch { options = []; }
    return {
      id: String(item.Id),
      question: item.Question || '¿Cuál es la pregunta del día?',
      context: item.Context || undefined,
      category: item.Category || undefined,
      authorName: item.AuthorName || undefined,
      authorPhotoUrl: item.AuthorPhotoUrl || undefined,
      options,
      expiresAt: item.ExpiresAt || undefined
    };
  }

  private async getQuestionsFromJsonUrl(jsonUrl: string): Promise<IFeaturedQuestion[]> {
    if (!jsonUrl?.trim()) throw new Error('JSON URL required');
    const response = await this._fetchClient(jsonUrl, { method: 'GET', headers: { 'Content-Type': 'application/json' } });
    if (!response.ok) throw new Error(`Failed: ${response.status}`);
    const data = await response.json();
    return (data.items || [data]).slice(0, 1);
  }

  private getStaticQuestions(): IFeaturedQuestion[] {
    return [{
      id: 'static-1',
      question: '¿Qué tema te gustaría aprender en el próximo taller?',
      context: 'Tu opinión nos ayuda a diseñar formación útil para todos.',
      category: 'Formación',
      authorName: 'Equipo de Learning',
      authorPhotoUrl: undefined,
      options: [
        { text: 'Herramientas de IA para productividad', votes: 24 },
        { text: 'Gestión del tiempo', votes: 18 },
        { text: 'Comunicación efectiva', votes: 12 }
      ],
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
    }];
  }
}