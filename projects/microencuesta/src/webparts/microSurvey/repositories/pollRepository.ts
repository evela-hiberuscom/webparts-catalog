import type {
  FetchLike,
  IKeyValueStorageLike,
  IMicroSurveyConfiguration,
  IMicroSurveyUserContext,
  IPollAnswerSubmission,
  IPollExistingSubmission,
  IPollLoadResponse,
  IPollQuestion,
  IPollSubmissionResponse,
  ISharePointHttpClientLike
} from '../models/pollModels';
import {
  createStorageKey,
  escapeODataValue,
  normalizeListReference,
  parsePollOptions,
  resolveSameOriginUrl,
  trimToUndefined
} from '../utils/pollUtils';

interface IPollRepositoryDependencies {
  fetchClient: FetchLike;
  spHttpClient: ISharePointHttpClientLike;
  spHttpClientConfiguration: unknown;
  storage: IKeyValueStorageLike;
  webAbsoluteUrl: string;
}

interface ISharePointListItem {
  Id?: number;
  Title?: string;
  PollOptions?: string | string[];
  Description?: string;
  PollDescription?: string;
  ClosingMessage?: string;
  ThankYouMessage?: string;
  SelectedOption?: string;
  SubmittedAt?: string;
  SubmittedByEmail?: string;
  SubmittedByDisplayName?: string;
}

export class PollRepository {
  private readonly fetchClient: FetchLike;
  private readonly spHttpClient: ISharePointHttpClientLike;
  private readonly spHttpClientConfiguration: unknown;
  private readonly storage: IKeyValueStorageLike;
  private readonly webAbsoluteUrl: string;

  public constructor(dependencies: IPollRepositoryDependencies) {
    this.fetchClient = dependencies.fetchClient;
    this.spHttpClient = dependencies.spHttpClient;
    this.spHttpClientConfiguration = dependencies.spHttpClientConfiguration;
    this.storage = dependencies.storage;
    this.webAbsoluteUrl = dependencies.webAbsoluteUrl;
  }

  public async load(
    configuration: IMicroSurveyConfiguration,
    user: IMicroSurveyUserContext
  ): Promise<IPollLoadResponse> {
    switch (configuration.dataSourceType) {
      case 'ApiEndpoint':
        return this.loadFromApiEndpoint(configuration);
      case 'StaticConfig':
        return this.loadFromStaticConfig(configuration, user);
      case 'SharePointList':
      default:
        return this.loadFromSharePointList(configuration, user);
    }
  }

  public async submit(
    configuration: IMicroSurveyConfiguration,
    user: IMicroSurveyUserContext,
    question: IPollQuestion,
    submission: IPollAnswerSubmission
  ): Promise<IPollSubmissionResponse> {
    switch (configuration.dataSourceType) {
      case 'ApiEndpoint':
        return this.submitToApiEndpoint(configuration, user, question, submission);
      case 'StaticConfig':
        return this.submitToStaticConfig(user, question, submission);
      case 'SharePointList':
      default:
        return this.submitToSharePointList(configuration, user, question, submission);
    }
  }

  private async loadFromSharePointList(
    configuration: IMicroSurveyConfiguration,
    user: IMicroSurveyUserContext
  ): Promise<IPollLoadResponse> {
    const questionReference = normalizeListReference(
      configuration.listTitleOrUrl,
      this.webAbsoluteUrl
    );
    const questionEndpoint = `${this.createItemsEndpoint(
      questionReference
    )}?$select=Id,Title,PollOptions,Description,PollDescription,ClosingMessage,ThankYouMessage&$filter=IsActive eq 1&$orderby=Modified desc&$top=1`;

    const questionPayload = await this.getJson(questionEndpoint);
    const questionItems = this.readCollection(questionPayload);
    if (questionItems.length === 0) {
      return {
        sourceLabel:
          questionReference.kind === 'title'
            ? questionReference.title
            : questionReference.serverRelativeUrl,
        hasPartialData: false,
        notes: []
      };
    }

    const question = this.mapQuestionFromListItem(
      questionItems[0] as ISharePointListItem,
      'SharePointList'
    );
    if (!question) {
      return {
        sourceLabel:
          questionReference.kind === 'title'
            ? questionReference.title
            : questionReference.serverRelativeUrl,
        hasPartialData: true,
        notes: ['invalid-question-schema']
      };
    }

    const existingSubmission = configuration.oneResponsePerUser
      ? await this.findExistingSharePointSubmission(configuration, user, question.id)
      : undefined;

    return {
      question,
      sourceLabel:
        questionReference.kind === 'title'
          ? questionReference.title
          : questionReference.serverRelativeUrl,
      hasPartialData: false,
      notes: [],
      existingSubmission
    };
  }

  private async submitToSharePointList(
    configuration: IMicroSurveyConfiguration,
    user: IMicroSurveyUserContext,
    question: IPollQuestion,
    submission: IPollAnswerSubmission
  ): Promise<IPollSubmissionResponse> {
    const responseReference = this.resolveResponsesReference(configuration);
    const listEntityTypeName = await this.getListEntityTypeName(responseReference);
    const responseEndpoint = this.createItemsEndpoint(responseReference);
    const payload = {
      __metadata: {
        type: listEntityTypeName
      },
      Title: `${question.question} | ${submission.selectedOption}`,
      PollQuestionId: question.id,
      QuestionLabel: question.question,
      SelectedOption: submission.selectedOption,
      SubmittedByEmail: trimToUndefined(user.email) || '',
      SubmittedByDisplayName: trimToUndefined(user.displayName) || '',
      SubmittedByLoginName: trimToUndefined(user.loginName) || ''
    };

    await this.postJson(responseEndpoint, payload);

    return {
      confirmationMessage:
        trimToUndefined(question.thankYouMessage) || 'Respuesta registrada.',
      submittedAt: new Date().toISOString(),
      selectedOption: submission.selectedOption
    };
  }

  private async loadFromApiEndpoint(
    configuration: IMicroSurveyConfiguration
  ): Promise<IPollLoadResponse> {
    const apiUrl = resolveSameOriginUrl(
      configuration.apiEndpointUrl,
      this.webAbsoluteUrl
    );
    const payload = await this.fetchJson(apiUrl.toString(), 'GET');
    const normalizedPayload = this.normalizeApiPayload(payload);

    return {
      question: normalizedPayload.question,
      sourceLabel: apiUrl.pathname,
      hasPartialData: normalizedPayload.hasPartialData,
      notes: normalizedPayload.notes,
      existingSubmission: normalizedPayload.existingSubmission
    };
  }

  private async submitToApiEndpoint(
    configuration: IMicroSurveyConfiguration,
    user: IMicroSurveyUserContext,
    question: IPollQuestion,
    submission: IPollAnswerSubmission
  ): Promise<IPollSubmissionResponse> {
    const apiUrl = resolveSameOriginUrl(
      configuration.apiEndpointUrl,
      this.webAbsoluteUrl
    );
    const payload = await this.fetchJson(apiUrl.toString(), 'POST', {
      questionId: question.id,
      selectedOption: submission.selectedOption,
      submittedBy: trimToUndefined(user.email) || trimToUndefined(user.loginName) || '',
      submittedByDisplayName: trimToUndefined(user.displayName) || ''
    });

    const responsePayload = payload as {
      confirmationMessage?: string;
      submittedAt?: string;
      selectedOption?: string;
    };

    return {
      confirmationMessage:
        trimToUndefined(responsePayload.confirmationMessage) ||
        trimToUndefined(question.thankYouMessage) ||
        'Respuesta registrada.',
      submittedAt:
        trimToUndefined(responsePayload.submittedAt) || new Date().toISOString(),
      selectedOption:
        trimToUndefined(responsePayload.selectedOption) || submission.selectedOption
    };
  }

  private async loadFromStaticConfig(
    configuration: IMicroSurveyConfiguration,
    user: IMicroSurveyUserContext
  ): Promise<IPollLoadResponse> {
    const questionText = trimToUndefined(configuration.questionText);
    const options = parsePollOptions(configuration.optionsCsv);
    if (!questionText || options.length < 2) {
      return {
        sourceLabel: 'StaticConfig',
        hasPartialData: false,
        notes: []
      };
    }

    const question: IPollQuestion = {
      id: 'static-microencuesta',
      question: questionText,
      options,
      source: 'StaticConfig'
    };
    const storedAnswer = this.storage.getItem(createStorageKey(question.id, user));
    let existingSubmission: IPollExistingSubmission | undefined;

    if (storedAnswer) {
      try {
        const parsedAnswer = JSON.parse(storedAnswer) as IPollExistingSubmission;
        existingSubmission = {
          selectedOption: parsedAnswer.selectedOption,
          submittedAt: parsedAnswer.submittedAt,
          submittedBy: parsedAnswer.submittedBy
        };
      } catch {
        existingSubmission = undefined;
      }
    }

    return {
      question,
      sourceLabel: 'StaticConfig',
      hasPartialData: false,
      notes: [],
      existingSubmission
    };
  }

  private async submitToStaticConfig(
    user: IMicroSurveyUserContext,
    question: IPollQuestion,
    submission: IPollAnswerSubmission
  ): Promise<IPollSubmissionResponse> {
    const submittedAt = new Date().toISOString();
    const response: IPollExistingSubmission = {
      selectedOption: submission.selectedOption,
      submittedAt,
      submittedBy: trimToUndefined(user.displayName) || trimToUndefined(user.email)
    };

    this.storage.setItem(
      createStorageKey(question.id, user),
      JSON.stringify(response)
    );

    return {
      confirmationMessage:
        trimToUndefined(question.thankYouMessage) || 'Respuesta registrada.',
      submittedAt,
      selectedOption: submission.selectedOption
    };
  }

  private async findExistingSharePointSubmission(
    configuration: IMicroSurveyConfiguration,
    user: IMicroSurveyUserContext,
    questionId: string
  ): Promise<IPollExistingSubmission | undefined> {
    const userIdentifier =
      trimToUndefined(user.email) || trimToUndefined(user.loginName);
    if (!userIdentifier) {
      return undefined;
    }

    const responseReference = this.resolveResponsesReference(configuration);
    const responseEndpoint = `${this.createItemsEndpoint(
      responseReference
    )}?$select=SelectedOption,SubmittedAt,SubmittedByEmail,SubmittedByDisplayName&$filter=PollQuestionId eq '${escapeODataValue(
      questionId
    )}' and SubmittedByEmail eq '${escapeODataValue(
      userIdentifier
    )}'&$orderby=Created desc&$top=1`;
    const payload = await this.getJson(responseEndpoint);
    const items = this.readCollection(payload);
    if (items.length === 0) {
      return undefined;
    }

    const firstMatch = items[0] as ISharePointListItem;
    const selectedOption = trimToUndefined(firstMatch.SelectedOption);
    if (!selectedOption) {
      return undefined;
    }

    return {
      selectedOption,
      submittedAt: trimToUndefined(firstMatch.SubmittedAt),
      submittedBy:
        trimToUndefined(firstMatch.SubmittedByDisplayName) ||
        trimToUndefined(firstMatch.SubmittedByEmail)
    };
  }

  private resolveResponsesReference(
    configuration: IMicroSurveyConfiguration
  ): ReturnType<typeof normalizeListReference> {
    const explicitValue = trimToUndefined(configuration.responsesListTitleOrUrl);
    if (explicitValue) {
      return normalizeListReference(explicitValue, this.webAbsoluteUrl);
    }

    const questionReference = normalizeListReference(
      configuration.listTitleOrUrl,
      this.webAbsoluteUrl
    );

    if (questionReference.kind === 'title') {
      return normalizeListReference(
        `${questionReference.title} Responses`,
        this.webAbsoluteUrl
      );
    }

    throw new Error(
      'responsesListTitleOrUrl is required when listTitleOrUrl is configured as a list URL.'
    );
  }

  private mapQuestionFromListItem(
    item: ISharePointListItem,
    source: IPollQuestion['source']
  ): IPollQuestion | undefined {
    const questionText = trimToUndefined(item.Title);
    const optionSource = item.PollOptions || '';
    const options = parsePollOptions(optionSource);
    if (!questionText || options.length < 2 || typeof item.Id !== 'number') {
      return undefined;
    }

    return {
      id: String(item.Id),
      question: questionText,
      description:
        trimToUndefined(item.PollDescription) || trimToUndefined(item.Description),
      options,
      source,
      thankYouMessage:
        trimToUndefined(item.ThankYouMessage) ||
        trimToUndefined(item.ClosingMessage)
    };
  }

  private normalizeApiPayload(payload: unknown): IPollLoadResponse {
    const typedPayload = payload as {
      question?: {
        id?: string;
        question?: string;
        description?: string;
        options?: string[] | string;
        thankYouMessage?: string;
      };
      existingSubmission?: IPollExistingSubmission;
      alreadySubmitted?: boolean;
      selectedOption?: string;
      submittedAt?: string;
    };

    const questionData = typedPayload.question;
    let question: IPollQuestion | undefined;
    if (questionData) {
      const questionText = trimToUndefined(questionData.question);
      const options = parsePollOptions(questionData.options || []);
      if (questionText && options.length >= 2) {
        question = {
          id: trimToUndefined(questionData.id) || 'api-microencuesta',
          question: questionText,
          description: trimToUndefined(questionData.description),
          options,
          source: 'ApiEndpoint',
          thankYouMessage: trimToUndefined(questionData.thankYouMessage)
        };
      }
    }

    const alreadySubmitted = !!typedPayload.alreadySubmitted;
    const existingSelection =
      trimToUndefined(typedPayload.selectedOption) ||
      trimToUndefined(typedPayload.existingSubmission?.selectedOption);

    return {
      question,
      sourceLabel: 'ApiEndpoint',
      hasPartialData: false,
      notes: [],
      existingSubmission:
        alreadySubmitted && existingSelection
          ? {
              selectedOption: existingSelection,
              submittedAt:
                trimToUndefined(typedPayload.submittedAt) ||
                trimToUndefined(typedPayload.existingSubmission?.submittedAt),
              submittedBy: trimToUndefined(typedPayload.existingSubmission?.submittedBy)
            }
          : undefined
    };
  }

  private createItemsEndpoint(reference: ReturnType<typeof normalizeListReference>): string {
    if (reference.kind === 'title') {
      return `${this.webAbsoluteUrl}/_api/web/lists/getByTitle('${escapeODataValue(
        reference.title
      )}')/items`;
    }

    return `${this.webAbsoluteUrl}/_api/web/GetList(@listUrl)/items?@listUrl='${encodeURIComponent(
      reference.serverRelativeUrl
    )}'`;
  }

  private createListMetadataEndpoint(
    reference: ReturnType<typeof normalizeListReference>
  ): string {
    if (reference.kind === 'title') {
      return `${this.webAbsoluteUrl}/_api/web/lists/getByTitle('${escapeODataValue(
        reference.title
      )}')?$select=ListItemEntityTypeFullName`;
    }

    return `${this.webAbsoluteUrl}/_api/web/GetList(@listUrl)?@listUrl='${encodeURIComponent(
      reference.serverRelativeUrl
    )}'&$select=ListItemEntityTypeFullName`;
  }

  private async getListEntityTypeName(
    reference: ReturnType<typeof normalizeListReference>
  ): Promise<string> {
    const payload = await this.getJson(this.createListMetadataEndpoint(reference));
    const entityTypeName = trimToUndefined(
      (payload as { ListItemEntityTypeFullName?: string })
        .ListItemEntityTypeFullName
    );

    if (!entityTypeName) {
      throw new Error('Unable to resolve response list entity type.');
    }

    return entityTypeName;
  }

  private async getJson(url: string): Promise<unknown> {
    const response = await this.spHttpClient.get(url, this.spHttpClientConfiguration, {
      headers: {
        Accept: 'application/json;odata=nometadata'
      }
    });

    if (!response.ok) {
      throw new Error(`SharePoint request failed with status ${response.status}.`);
    }

    return response.json();
  }

  private async postJson(url: string, body: unknown): Promise<void> {
    const response = await this.spHttpClient.post(url, this.spHttpClientConfiguration, {
      headers: {
        Accept: 'application/json;odata=nometadata',
        'Content-Type': 'application/json;odata=verbose',
        'odata-version': ''
      },
      body: JSON.stringify(body)
    });

    if (!response.ok) {
      throw new Error(`SharePoint submit failed with status ${response.status}.`);
    }
  }

  private async fetchJson(
    url: string,
    method: 'GET' | 'POST',
    body?: unknown
  ): Promise<unknown> {
    const response = await this.fetchClient(url, {
      method,
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json'
      },
      body: body ? JSON.stringify(body) : undefined
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}.`);
    }

    return response.json();
  }

  private readCollection(payload: unknown): unknown[] {
    if (!payload || typeof payload !== 'object') {
      return [];
    }

    const typedPayload = payload as { value?: unknown[] };
    return Array.isArray(typedPayload.value) ? typedPayload.value : [];
  }
}
