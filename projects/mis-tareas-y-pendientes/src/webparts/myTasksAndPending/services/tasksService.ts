import { ITaskItem, ITasksConfiguration, AsyncState } from '../models/taskModels';
import { TasksRepository } from '../repositories/tasksRepository';

export class TasksService {
  private _repository: TasksRepository;

  constructor(repository: TasksRepository) {
    this._repository = repository;
  }

  async loadTasks(config: ITasksConfiguration): Promise<AsyncState<ITaskItem[]>> {
    try {
      const tasks = await this._repository.getTasks(config);

      if (!tasks || tasks.length === 0) {
        return { status: 'empty' };
      }

      const hasPartialData = tasks.some(
        (task) => !task.dueDate || !task.priority || !task.openUrl
      );

      if (hasPartialData) {
        return { status: 'partialData', data: tasks, hasPartialData: true };
      }

      return { status: 'ready', data: tasks };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error desconocido al cargar tareas';
      return { status: 'error', message };
    }
  }

  calculateCounts(tasks: ITaskItem[]): { overdue: number; today: number; soon: number; noDate: number } {
    return {
      overdue: tasks.filter((t) => t.group === 'overdue').length,
      today: tasks.filter((t) => t.group === 'today').length,
      soon: tasks.filter((t) => t.group === 'soon').length,
      noDate: tasks.filter((t) => t.group === 'noDate').length
    };
  }
}