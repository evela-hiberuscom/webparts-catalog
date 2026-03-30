jest.mock('MicroSurveyWebPartStrings', () => ({
  WebPartEyebrow: 'Participacion ligera',
  WebPartTitle: 'Microencuesta',
  WebPartSubtitle: 'Recoge una senal rapida con una sola pregunta.',
  LoadingLabel: 'Cargando microencuesta',
  SourceLabel: 'Origen',
  OptionsGroupLabel: 'Selecciona una opcion',
  SubmitAction: 'Enviar respuesta',
  SubmittingAction: 'Enviando',
  RefreshAction: 'Actualizar',
  SuccessStateTitle: 'Respuesta registrada',
  SuccessStateMessage: 'Tu respuesta se ha guardado correctamente.',
  SelectedOptionLabel: 'Opcion elegida',
  ErrorStateTitle: 'No se ha podido cargar la microencuesta',
  ErrorStateMessage: 'Revisa la configuracion del origen y vuelve a intentarlo.',
  EmptyStateTitle: 'No hay ninguna pregunta activa',
  EmptyStateMessage: 'Publica una pregunta activa o cambia a un origen con datos.',
  PartialStateTitle: 'Informacion parcial',
  PartialStateMessage: 'La pregunta esta disponible, pero faltan campos opcionales del origen.',
  InteractionErrorTitle: 'No se ha podido completar la accion',
  SelectionRequiredMessage: 'Selecciona una opcion antes de enviar la respuesta.',
  AlreadyAnsweredMessage: 'Ya has respondido esta microencuesta.',
  QuestionUnavailableMessage: 'No hay una pregunta valida disponible para responder.',
  SubmitErrorMessage: 'No se ha podido registrar la respuesta. Intentalo de nuevo.',
  ErrorBoundaryTitle: 'Error',
  ErrorBoundaryMessage: 'Detalle'
}), { virtual: true });

import * as React from 'react';
import * as ReactDom from 'react-dom';
import { act } from 'react-dom/test-utils';
import MicroSurvey from './MicroSurvey';
import * as hookModule from '../hooks/useMicroSurvey';

describe('MicroSurvey', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('renders the question and source label when ready', () => {
    jest.spyOn(hookModule, 'useMicroSurvey').mockReturnValue({
      status: 'ready',
      submitStatus: 'idle',
      question: {
        id: '1',
        question: '¿Te ayuda esta home?',
        options: [
          { id: 'si', label: 'Si' },
          { id: 'no', label: 'No' }
        ],
        source: 'StaticConfig'
      },
      sourceLabel: 'StaticConfig',
      hasPartialData: false,
      notes: [],
      selectedOption: undefined,
      refresh: jest.fn().mockResolvedValue(undefined),
      selectOption: jest.fn(),
      submit: jest.fn().mockResolvedValue(undefined)
    });

    const container = document.createElement('div');
    document.body.appendChild(container);

    try {
      act(() => {
        ReactDom.render(
          <MicroSurvey
            configuration={{
              description: 'Pulse',
              dataSourceType: 'StaticConfig',
              listTitleOrUrl: '',
              responsesListTitleOrUrl: '',
              apiEndpointUrl: '',
              questionText: '¿Te ayuda esta home?',
              optionsCsv: 'Si;No',
              oneResponsePerUser: true
            }}
            service={{} as never}
          />,
          container
        );
      });

      expect(container.textContent).toContain('¿Te ayuda esta home?');
      expect(container.textContent).toContain('StaticConfig');
      expect(container.textContent).toContain('Enviar respuesta');
    } finally {
      ReactDom.unmountComponentAtNode(container);
      container.remove();
    }
  });

  it('renders success state when already answered', () => {
    jest.spyOn(hookModule, 'useMicroSurvey').mockReturnValue({
      status: 'ready',
      submitStatus: 'success',
      question: {
        id: '1',
        question: '¿Te ayuda esta home?',
        options: [
          { id: 'si', label: 'Si' },
          { id: 'no', label: 'No' }
        ],
        source: 'StaticConfig'
      },
      sourceLabel: 'StaticConfig',
      hasPartialData: false,
      notes: [],
      selectedOption: 'Si',
      existingSubmission: {
        selectedOption: 'Si'
      },
      confirmationMessage: 'Respuesta registrada.',
      refresh: jest.fn().mockResolvedValue(undefined),
      selectOption: jest.fn(),
      submit: jest.fn().mockResolvedValue(undefined)
    });

    const container = document.createElement('div');
    document.body.appendChild(container);

    try {
      act(() => {
        ReactDom.render(
          <MicroSurvey
            configuration={{
              description: 'Pulse',
              dataSourceType: 'StaticConfig',
              listTitleOrUrl: '',
              responsesListTitleOrUrl: '',
              apiEndpointUrl: '',
              questionText: '¿Te ayuda esta home?',
              optionsCsv: 'Si;No',
              oneResponsePerUser: true
            }}
            service={{} as never}
          />,
          container
        );
      });

      expect(container.textContent).toContain('Respuesta registrada');
      expect(container.textContent).toContain('Opcion elegida');
    } finally {
      ReactDom.unmountComponentAtNode(container);
      container.remove();
    }
  });
});
