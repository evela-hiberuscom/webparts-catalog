import {
  buildListSubmissionBody,
  buildSharePointListEndpoint,
  buildSubmissionPayload,
  normalizeSubmitUrl,
  resolveListRootPath,
  sanitizeIdeaDraft,
  validateIdeaDraft
} from './ideaMailboxUtils';
import type { IIdeaDraft, IIdeasMailboxWebPartProps } from '../models/ideaMailboxModels';

const baseProps: IIdeasMailboxWebPartProps = {
  title: 'Buzón de ideas',
  subtitle: 'Comparte una propuesta sin fricción y con validación clara.',
  sourceType: 'SharePointList',
  listTitleOrUrl: '',
  endpointUrl: '',
  allowAnonymous: false,
  showCategory: true,
  submitLabel: 'Enviar idea',
  categoryLabel: 'Categoría'
};

describe('ideaMailboxUtils', () => {
  it('sanitizes and validates draft content', () => {
    const draft: IIdeaDraft = {
      title: '  Idea\u0007 nueva  ',
      description: 'Línea 1\r\nLínea 2   ',
      category: '  Procesos  '
    };

    expect(sanitizeIdeaDraft(draft)).toEqual({
      title: 'Idea nueva',
      description: 'Línea 1\nLínea 2',
      category: 'Procesos'
    });

    expect(validateIdeaDraft(draft).isValid).toBe(true);
  });

  it('builds same-origin endpoints and submission payloads', () => {
    expect(normalizeSubmitUrl('/api/ideas', 'https://contoso.sharepoint.com/sites/intranet')).toBe(
      'https://contoso.sharepoint.com/api/ideas'
    );
    expect(resolveListRootPath('https://contoso.sharepoint.com/sites/intranet/Lists/Ideas/Forms/AllItems.aspx', 'https://contoso.sharepoint.com'))
      .toBe('/sites/intranet/Lists/Ideas');

    expect(buildSharePointListEndpoint('https://contoso.sharepoint.com', 'Ideas')).toContain(
      "/_api/web/lists/getbytitle('Ideas')/items"
    );

    const payload = buildSubmissionPayload(
      {
        ...baseProps,
        allowAnonymous: true,
        showCategory: false,
        sourceType: 'JsonBridge'
      },
      {
        title: 'Idea',
        description: 'Descripción',
        category: 'Categoría'
      },
      'Ada Lovelace',
      'https://contoso.sharepoint.com/sites/intranet'
    );

    expect(payload).toMatchObject({
      title: 'Idea',
      description: 'Descripción',
      category: undefined,
      submittedBy: undefined,
      sourceType: 'JsonBridge'
    });

    expect(buildListSubmissionBody(payload)).toEqual({
      Title: 'Idea',
      Description: 'Descripción',
      Category: '',
      SubmittedBy: '',
      SubmittedAt: payload.submittedAt,
      SourceType: 'JsonBridge',
      PageUrl: 'https://contoso.sharepoint.com/sites/intranet'
    });
  });
});
