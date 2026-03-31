import { IUsefulDocument, IUsefulDocumentsConfiguration, AsyncState } from '../models/usefulDocumentModels';
import { UsefulDocumentsRepository } from '../repositories/usefulDocumentsRepository';

export class UsefulDocumentsService {
  private _repository: UsefulDocumentsRepository;

  constructor(repository: UsefulDocumentsRepository) {
    this._repository = repository;
  }

  async loadDocuments(config: IUsefulDocumentsConfiguration): Promise<AsyncState<IUsefulDocument[]>> {
    try {
      const documents = await this._repository.getDocuments(config);

      if (!documents || documents.length === 0) {
        return { status: 'empty' };
      }

      const hasPartialData = documents.some(
        (doc) => !doc.openUrl || !doc.category || !doc.owner
      );

      if (hasPartialData) {
        return { status: 'partialData', data: documents, hasPartialData: true };
      }

      return { status: 'ready', data: documents };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al cargar documentos';
      return { status: 'error', message };
    }
  }
}