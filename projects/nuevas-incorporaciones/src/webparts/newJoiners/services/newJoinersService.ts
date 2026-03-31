import { IJoiner, INewJoinersConfiguration, AsyncState } from '../models/joinerModels';
import { NewJoinersRepository } from '../repositories/newJoinersRepository';

export class NewJoinersService {
  private _repository: NewJoinersRepository;

  constructor(repository: NewJoinersRepository) {
    this._repository = repository;
  }

  async loadJoiners(config: INewJoinersConfiguration): Promise<AsyncState<IJoiner[]>> {
    try {
      const joiners = await this._repository.getJoiners(config);

      if (!joiners || joiners.length === 0) {
        return { status: 'empty' };
      }

      const hasPartialData = joiners.some(
        (joiner) => !joiner.jobTitle || !joiner.department || !joiner.photoUrl
      );

      if (hasPartialData) {
        return { status: 'partialData', data: joiners, hasPartialData: true };
      }

      return { status: 'ready', data: joiners };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al cargar incorporaciones';
      return { status: 'error', message };
    }
  }
}