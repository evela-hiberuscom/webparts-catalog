jest.mock('FeaturedQuestionWebPartStrings', () => ({
  WebPartTitle: 'Pregunta destacada',
  LoadingMessage: 'Cargando pregunta destacada...',
  EmptyMessage: 'No hay ninguna pregunta destacada activa.',
  ErrorMessage: 'No se ha podido cargar la pregunta destacada.',
  PartialDataMessage: 'La pregunta se ha cargado con datos parciales.',
  QuestionOfTheDayLabel: 'Foco editorial',
  SelectAnswerLabel: 'Selecciona tu respuesta',
  QuestionFromLabel: 'Pregunta de',
  VotesLabel: 'votos',
  ExpiresLabel: 'Válida hasta',
  ErrorBoundaryTitle: 'Se ha producido un error inesperado',
  ErrorBoundaryMessage: 'Este web part ha encontrado un error no esperado.'
}), { virtual: true });

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';
import type { IFeaturedQuestionConfiguration } from '../models/featuredQuestionModels';
import type { FeaturedQuestionService } from '../services/featuredQuestionService';
import FeaturedQuestion from './FeaturedQuestion';

describe('FeaturedQuestion component', () => {
  let container: HTMLDivElement;

  const configuration: IFeaturedQuestionConfiguration = {
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: '',
    showVotes: true,
    allowMultipleVotes: false
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.remove();
  });

  it('renders the question, answer options, and author', async () => {
    const service = {
      loadQuestion: jest.fn(async () => ({
        status: 'ready' as const,
        data: [
          {
            id: 'q-1',
            question: '¿Qué mejora priorizamos este mes?',
            context: 'Selecciona una iniciativa.',
            category: 'Operaciones',
            authorName: 'Equipo PMO',
            authorPhotoUrl: undefined,
            options: [{ text: 'Automatización', votes: 8 }],
            expiresAt: undefined
          }
        ]
      }))
    } as unknown as FeaturedQuestionService;

    await act(async () => {
      ReactDOM.render(<FeaturedQuestion configuration={configuration} service={service} />, container);
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Pregunta destacada');
    expect(container.textContent).toContain('¿Qué mejora priorizamos este mes?');
    expect(container.textContent).toContain('Pregunta de Equipo PMO');
    expect(container.textContent).toContain('Automatización (8 votos)');
  });
});
