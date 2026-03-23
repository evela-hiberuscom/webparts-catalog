import * as React from 'react';
import {
  DefaultButton,
  Dropdown,
  Icon,
  MessageBar,
  MessageBarType,
  PrimaryButton,
  Shimmer,
  ShimmerElementType,
  Spinner,
  SpinnerSize,
  Stack,
  Text
} from '@fluentui/react';
import type { IQuickBookingProps } from './IQuickBookingProps';
import { useQuickBooking } from '../hooks/useQuickBooking';
import type { IBookingResource } from '../models/quickBookingModels';
import { createSafeExternalLink } from '@paquete/spfx-common/utils';
import styles from './QuickBooking.module.scss';

function availabilityLabel(value: string | undefined): string {
  if (value === 'available') {
    return 'Disponible';
  }

  if (value === 'busy') {
    return 'Ocupado';
  }

  if (value === 'unknown') {
    return 'Disponibilidad no confirmada';
  }

  return 'Sin estado';
}

function renderLoadingState(props: IQuickBookingProps): React.ReactElement {
  return (
    <section className={`${styles.quickBooking} ${props.hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.shell}>
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <Text variant="small" className={styles.kicker}>
              Reserva rapida
            </Text>
            <Text variant="xLargePlus" className={styles.title} block>
              Cargando recursos de reserva
            </Text>
            <Text variant="mediumPlus" className={styles.subtitle} block>
              {props.environmentMessage}
            </Text>
            <Text variant="medium" className={styles.description} block>
              Estamos leyendo la fuente configurada para mostrar salas, puestos, parking o equipamiento.
            </Text>
          </div>

          <div className={styles.statePanel}>
            <Spinner label="Cargando recursos de reserva" size={SpinnerSize.medium} />
            <Shimmer
              className={styles.loadingShimmer}
              shimmerElements={[
                { type: ShimmerElementType.line, height: 16, width: '100%' },
                { type: ShimmerElementType.gap, width: '100%' },
                { type: ShimmerElementType.line, height: 16, width: '70%' }
              ]}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

function renderResourceCard(
  resource: Pick<IBookingResource, 'id' | 'name' | 'category' | 'site' | 'bookingUrl' | 'availability' | 'rules'>,
  openInNewTab: boolean,
  showAvailability: boolean
): React.ReactElement {
  const safeLink = resource.bookingUrl ? createSafeExternalLink(resource.bookingUrl) : undefined;

  return (
    <article key={resource.id} className={`${styles.card} ${!safeLink ? styles.cardMuted : ''}`}>
      <div className={styles.cardTop}>
        <div>
          <Text variant="large" className={styles.cardTitle} block>
            {resource.name}
          </Text>
          <Text variant="small" className={styles.cardMeta} block>
            {resource.category ?? 'Sin categoria'}
            {resource.site ? ` · ${resource.site}` : ''}
          </Text>
        </div>
        {showAvailability ? (
          <span className={`${styles.badge} ${styles[`badge${resource.availability ?? 'unknown'}`]}`}>
            {availabilityLabel(resource.availability)}
          </span>
        ) : (
          <span className={`${styles.badge} ${styles.badgeunknown}`}>Launcher</span>
        )}
      </div>

      <Text variant="small" className={styles.cardRules} block>
        {resource.rules ?? 'Sin reglas adicionales.'}
      </Text>

      {safeLink ? (
        <div className={styles.cardActions}>
          <a
            href={safeLink.href}
            rel={openInNewTab ? safeLink.rel : undefined}
            target={openInNewTab ? safeLink.target : undefined}
            className={styles.linkButton}
          >
            Reservar ahora
          </a>
        </div>
      ) : (
        <Text variant="small" className={styles.linkHint} block>
          Sin enlace de reserva seguro.
        </Text>
      )}
    </article>
  );
}

export default function QuickBooking(props: IQuickBookingProps): React.ReactElement {
  const { model, setSelectedCategory, setSelectedSite, reload } = useQuickBooking(
    {
      webUrl: props.webUrl
    },
    props
  );

  if (model.status === 'loading') {
    return renderLoadingState(props);
  }

  if (model.status === 'error') {
    return (
      <section className={`${styles.quickBooking} ${props.hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.shell}>
          <div className={styles.hero}>
            <div className={styles.heroCopy}>
              <Text variant="small" className={styles.kicker}>
                Reserva rapida
              </Text>
              <Text variant="xLargePlus" className={styles.title} block>
                No se han podido cargar los recursos
              </Text>
              <Text variant="mediumPlus" className={styles.subtitle} block>
                {props.environmentMessage}
              </Text>
              <Text variant="medium" className={styles.description} block>
                Revisa la configuracion de la fuente y vuelve a intentarlo.
              </Text>
            </div>

            <div className={styles.statePanel}>
              <MessageBar messageBarType={MessageBarType.error} isMultiline={false}>
                {model.errorMessage ?? 'No se han podido cargar los recursos de reserva.'}
              </MessageBar>
              <Text variant="small" className={styles.statusCopy} block>
                {model.errorMessage ?? 'No se han podido cargar los recursos de reserva.'}
              </Text>
              <DefaultButton text="Reintentar" onClick={reload} />
            </div>
          </div>
        </div>
      </section>
    );
  }

  const filters = (
    <div className={styles.toolbar}>
      <div className={styles.filtersRow}>
        <Dropdown
          selectedKey={model.selectedCategory}
          options={model.categories.map((category) => ({
            key: category,
            text: category
          }))}
          onChange={(_, option) => {
            if (option) {
              setSelectedCategory(String(option.key));
            }
          }}
          className={styles.categoryPicker}
          label="Categoria"
        />
        <Dropdown
          selectedKey={model.selectedSite}
          options={model.sites.map((site) => ({
            key: site,
            text: site
          }))}
          onChange={(_, option) => {
            if (option) {
              setSelectedSite(String(option.key));
            }
          }}
          className={styles.sitePicker}
          label="Sede"
        />
      </div>
      {model.status === 'partialData' ? (
        <>
          <MessageBar messageBarType={MessageBarType.warning} isMultiline={false}>
            Hay recursos con datos parciales. Los elementos sin enlace o sin disponibilidad se muestran degradados.
          </MessageBar>
          <div className={styles.statusCopy}>Hay recursos con datos parciales.</div>
        </>
      ) : model.status === 'empty' ? (
        <div className={styles.statusCopy}>No hay coincidencias con la combinacion de filtros actual.</div>
      ) : (
        <div className={styles.statusCopy}>Datos listos para reservar.</div>
      )}
    </div>
  );

  if (model.status === 'empty') {
    return (
      <section className={`${styles.quickBooking} ${props.hasTeamsContext ? styles.teams : ''}`}>
        <div className={styles.shell}>
          <div className={styles.hero}>
            <div className={styles.heroCopy}>
              <Text variant="small" className={styles.kicker}>
                Reserva rapida
              </Text>
              <Text variant="xLargePlus" className={styles.title} block>
                No hay recursos para esta vista
              </Text>
              <Text variant="mediumPlus" className={styles.subtitle} block>
                {props.environmentMessage}
              </Text>
              <Text variant="medium" className={styles.description} block>
                Ajusta la categoria o la sede para ver coincidencias.
              </Text>
            </div>

            <div className={styles.statePanel}>
              <Icon iconName="Calendar" className={styles.emptyIcon} />
              <Text variant="large" className={styles.emptyTitle} block>
                No hay recursos configurados para esta combinacion de filtros.
              </Text>
              <Text variant="medium" className={styles.emptyText} block>
                Cambia los filtros o vuelve a cargar la fuente.
              </Text>
              <DefaultButton
                text="Restablecer filtros"
                onClick={() => {
                  setSelectedCategory('Todos');
                  setSelectedSite('Todos');
                }}
              />
            </div>
          </div>

          {filters}
        </div>
      </section>
    );
  }

  return (
    <section className={`${styles.quickBooking} ${props.hasTeamsContext ? styles.teams : ''}`}>
      <div className={styles.shell}>
        <div className={styles.hero}>
          <div className={styles.heroCopy}>
            <Text variant="small" className={styles.kicker}>
              Reserva rapida
            </Text>
            <Text variant="xLargePlus" className={styles.title} block>
              Reserva recursos frecuentes sin salir de SharePoint
            </Text>
            <Text variant="mediumPlus" className={styles.subtitle} block>
              {props.environmentMessage}
            </Text>
            <Text variant="medium" className={styles.description} block>
              Hola, {props.userDisplayName}. Accede a salas, puestos, parking o equipamiento con una experiencia clara,
              filtrable y preparada para datos parciales.
            </Text>
            <Stack horizontal tokens={{ childrenGap: 12 }} className={styles.actions}>
              <PrimaryButton text="Explorar recursos" onClick={reload} />
              <DefaultButton text="Ver configuracion" onClick={reload} />
            </Stack>
          </div>

          <div className={styles.heroMetrics} aria-label="Resumen de estado">
            <div className={styles.metric}>
              <span className={styles.metricValue}>{model.resources.length}</span>
              <span className={styles.metricLabel}>recursos</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricValue}>{Math.max(model.categories.length - 1, 0)}</span>
              <span className={styles.metricLabel}>categorias</span>
            </div>
            <div className={styles.metric}>
              <span className={styles.metricValue}>{model.hasPartialData ? '1+' : '0'}</span>
              <span className={styles.metricLabel}>parciales</span>
            </div>
          </div>
        </div>

        {filters}

        <div className={styles.grid} aria-live="polite">
          {model.visibleResources.map((resource) => renderResourceCard(resource, props.openInNewTab, props.showAvailability))}
        </div>
      </div>
    </section>
  );
}
