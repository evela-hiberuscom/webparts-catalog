import { SPHttpClient } from '@microsoft/sp-http';
import type { WebPartContext } from '@microsoft/sp-webpart-base';
import { normalizePerson, normalizeSearchText } from '../utils/expressDirectoryUtils';
import type { IExpressDirectorySourceRequest, IExpressDirectorySourceResult } from '../models/expressDirectoryModels';
import type { IExpressDirectorySourceRepository } from './IExpressDirectorySourceRepository';

interface ISearchCell {
  Key?: string;
  Value?: string;
}

interface ISearchRow {
  Cells?: {
    results?: ISearchCell[];
  };
}

interface ISearchQueryResponse {
  PrimaryQueryResult?: {
    RelevantResults?: {
      Table?: {
        Rows?: {
          results?: ISearchRow[];
        };
      };
    };
  };
}

function readCell(row: ISearchRow, key: string): string {
  const cells = row.Cells?.results ?? [];
  const match = cells.find((cell) => normalizeSearchText(cell.Key) === normalizeSearchText(key));
  return match?.Value?.trim() ?? '';
}

export class DirectoryRepository implements IExpressDirectorySourceRepository {
  public constructor(private readonly context: WebPartContext) {}

  public async load(request: IExpressDirectorySourceRequest): Promise<IExpressDirectorySourceResult> {
    const endpoint = `search/query?querytext='contentclass:STS_User'&selectproperties='PreferredName,JobTitle,Department,Email,Path,PictureURL'&rowlimit=50&trimduplicates=false`;
    const response = await this.context.spHttpClient.get(this.buildApiUrl(endpoint), SPHttpClient.configurations.v1);

    if (!response.ok) {
      throw new Error(`Directory query failed (${response.status})`);
    }

    const body = (await response.json()) as ISearchQueryResponse;
    const rows = body.PrimaryQueryResult?.RelevantResults?.Table?.Rows?.results ?? [];
    const query = normalizeSearchText(request.query);
    const selectedArea = normalizeSearchText(request.selectedArea);

    const items = rows
      .map((row, index) =>
        normalizePerson({
          id: `${index + 1}`,
          displayName: readCell(row, 'PreferredName') || readCell(row, 'Title'),
          jobTitle: readCell(row, 'JobTitle'),
          area: readCell(row, 'Department'),
          email: readCell(row, 'Email'),
          profileUrl: readCell(row, 'Path'),
          photoUrl: readCell(row, 'PictureURL')
        })
      )
      .filter((item) => {
        const matchesArea = !selectedArea || normalizeSearchText(item.area) === selectedArea;
        const matchesQuery =
          !query ||
          [item.displayName, item.jobTitle, item.area, item.email]
            .map((value) => normalizeSearchText(value))
            .some((value) => value.includes(query));
        return matchesArea && matchesQuery;
      });

    return {
      sourceType: 'Directory',
      sourceLabel: 'Directory API',
      items,
      warnings: items.some((item) => !item.profileUrl || !item.photoUrl || !item.area || !item.jobTitle)
        ? ['directory-partial']
        : []
    };
  }

  private buildApiUrl(relativeOrAbsoluteUrl: string): string {
    if (/^https?:\/\//i.test(relativeOrAbsoluteUrl)) {
      return relativeOrAbsoluteUrl;
    }

    return `${this.context.pageContext.web.absoluteUrl}/_api/${relativeOrAbsoluteUrl.replace(/^\/+/, '')}`;
  }
}
