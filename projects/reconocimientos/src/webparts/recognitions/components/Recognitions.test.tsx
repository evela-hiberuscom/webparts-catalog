jest.mock('RecognitionsWebPartStrings', () => ({
  KickerLabel: 'Cultura en movimiento',
  RecognitionsCountLabel: 'reconocimientos',
  LoadingStateLabel: 'Cargando reconocimientos',
  EmptyStateMessage: 'No hay reconocimientos recientes.',
  PartialStateMessage: 'Datos parciales.',
  ErrorStateMessage: 'No se han podido cargar los reconocimientos.',
  PartialBadgeLabel: 'Parcial',
  MissingMessageFallback: 'Sin mensaje',
  OpenDetailButtonLabel: 'Abrir detalle',
  DateUnavailableLabel: 'Fecha no disponible'
}), { virtual: true });

import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { act } from 'react-dom/test-utils';

import type {
  IRecognitionsConfiguration,
  IRecognitionsService
} from '../models/recognitionsModels';
import Recognitions from './Recognitions';

describe('Recognitions', () => {
  let container: HTMLDivElement;

  const configuration: IRecognitionsConfiguration = {
    title: 'Reconocimientos',
    description: 'Agradecimientos recientes del equipo.',
    dataSourceType: 'StaticConfig',
    listTitleOrUrl: 'RecognitionsList',
    maxItems: 5,
    showPhotos: true,
    webAbsoluteUrl: 'https://contoso.sharepoint.com/sites/demo'
  };

  beforeEach(() => {
    container = document.createElement('div');
    document.body.appendChild(container);
  });

  afterEach(() => {
    ReactDOM.unmountComponentAtNode(container);
    container.innerHTML = '';
    container.remove();
  });

  it('renders the header and loaded recognition cards', async () => {
    const service: IRecognitionsService = {
      load: async () => ({
        state: 'ready',
        title: 'Reconocimientos',
        description: 'Agradecimientos recientes del equipo.',
        sourceLabel: 'Static config',
        items: [
          {
            id: '1',
            targetName: 'Equipo Soporte',
            message: 'Gracias por el despliegue.',
            date: '2026-03-20T12:00:00.000Z',
            photoUrl: '/photo.png',
            detailUrl: '/detail',
            hasAction: true,
            hasPhoto: true,
            isPartial: false
          }
        ],
        hasPartialData: false,
        warningMessages: []
      })
    };

    await act(async () => {
      ReactDOM.render(
        <Recognitions configuration={configuration} service={service} localeName="es-ES" />,
        container
      );
      await Promise.resolve();
    });

    expect(container.textContent).toContain('Reconocimientos');
    expect(container.textContent).toContain('Equipo Soporte');
    expect(container.textContent).toContain('Abrir detalle');
  });
});
