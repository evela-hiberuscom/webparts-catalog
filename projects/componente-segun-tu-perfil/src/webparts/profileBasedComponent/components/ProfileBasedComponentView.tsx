import * as React from 'react';
import { DefaultButton, Icon, MessageBar, MessageBarType, PrimaryButton, Spinner, SpinnerSize, Text } from '@fluentui/react';
import { createSafeExternalLink } from '@paquete/spfx-common/utils';
import styles from './ProfileBasedComponent.module.scss';
import type { IProfileBasedComponentProps } from './IProfileBasedComponentProps';
import type { IProfileBasedComponentViewModel } from '../models/profileBasedComponentModels';
import { normalizeToken } from '../utils/profileTokens';

interface IProfileBasedComponentViewProps {
  props: IProfileBasedComponentProps;
  viewModel: IProfileBasedComponentViewModel;
  onRetry: () => void;
}

function renderTag(text: string): React.ReactElement {
  return (
    <span className={styles.tag} key={text}>
      {text}
    </span>
  );
}

function renderToken(token: string): React.ReactElement {
  return (
    <span className={styles.token} key={token}>
      {token}
    </span>
  );
}

export default function ProfileBasedComponentView({ props, viewModel, onRetry }: IProfileBasedComponentViewProps): JSX.Element {
  const variant = viewModel.variant;
  const tags = variant ? variant.tags : [];
  const profileTokens = viewModel.currentTokens.map((token) => normalizeToken(token)).filter(Boolean);

  if (viewModel.state === 'loading') {
    return (
      <section className={styles.root}>
        <Spinner size={SpinnerSize.large} label="Resolviendo perfil..." />
      </section>
    );
  }

  if (viewModel.state === 'error') {
    return (
      <section className={styles.root}>
        <MessageBar messageBarType={MessageBarType.error}>
          {viewModel.errorMessage ?? viewModel.message}
        </MessageBar>
        <div className={styles.emptyActions}>
          <DefaultButton text="Reintentar" onClick={onRetry} />
        </div>
      </section>
    );
  }

  if (viewModel.state === 'empty' && !variant) {
    return (
      <section className={styles.root}>
        <div className={styles.hero}>
          <span className={styles.accentLine} />
          <Text variant="xLarge" className={styles.kicker}>{props.title}</Text>
          <Text variant="large" className={styles.title}>{props.description}</Text>
        </div>
        <MessageBar messageBarType={MessageBarType.info}>
          {viewModel.message}
        </MessageBar>
        <div className={styles.emptyState}>
          <Icon iconName="People" className={styles.emptyIcon} />
          <Text variant="large">Configura una lista, una URL JSON same-origin o una variante estática para activar el bloque.</Text>
        </div>
        <div className={styles.metaGrid}>
          <div className={styles.metaCard}>
            <Text variant="small" className={styles.metaLabel}>Origen</Text>
            <Text variant="mediumPlus">{viewModel.sourceLabel}</Text>
          </div>
          <div className={styles.metaCard}>
            <Text variant="small" className={styles.metaLabel}>Audiencia</Text>
            <Text variant="mediumPlus">{props.audienceMode}</Text>
          </div>
          <div className={styles.metaCard}>
            <Text variant="small" className={styles.metaLabel}>Fallback</Text>
            <Text variant="mediumPlus">{props.fallbackMode}</Text>
          </div>
        </div>
      </section>
    );
  }

  if (!variant) {
    return (
      <section className={styles.root}>
        <MessageBar messageBarType={MessageBarType.warning}>
          No se ha podido seleccionar una variante.
        </MessageBar>
      </section>
    );
  }

  const links = Array.isArray(variant.payload.links) ? (variant.payload.links as Array<{ label: string; url: string }>) : [];
  const metrics = Array.isArray(variant.payload.metrics) ? (variant.payload.metrics as Array<{ label: string; value: string }>) : [];
  const safeLinks = links
    .map((link) => {
      const safeLink = createSafeExternalLink(link.url);
      if (!safeLink) {
        return undefined;
      }

      return {
        label: link.label,
        ...safeLink
      };
    })
    .filter((link): link is { label: string; href: string; rel: string; target: string } => Boolean(link));
  const safeCtaLink = createSafeExternalLink(variant.ctaUrl);

  return (
    <section className={styles.root}>
      <div className={styles.hero}>
        <span className={styles.accentLine} />
        <div className={styles.heroHeader}>
          <div>
            <Text variant="xLarge" className={styles.kicker}>{props.title}</Text>
            <Text variant="large" className={styles.title}>{props.description}</Text>
          </div>
          <span className={styles.sourcePill}>{viewModel.sourceLabel}</span>
        </div>
      </div>

      {viewModel.state === 'partialData' ? (
        <MessageBar messageBarType={MessageBarType.warning}>
          {viewModel.message}
        </MessageBar>
      ) : null}

      <div className={styles.layout}>
        <article className={styles.contextCard}>
          <Text variant="small" className={styles.metaLabel}>Perfil activo</Text>
          <div className={styles.tokenList}>
            {profileTokens.length > 0 ? profileTokens.map(renderToken) : <span className={styles.muted}>Sin tokens explícitos</span>}
          </div>
          <div className={styles.metaGridCompact}>
            <div>
              <Text variant="small" className={styles.metaLabel}>Coincidencias</Text>
              <Text variant="mediumPlus">{viewModel.matchedTokens.length > 0 ? viewModel.matchedTokens.join(', ') : 'Fallback aplicado'}</Text>
            </div>
            <div>
              <Text variant="small" className={styles.metaLabel}>Modo</Text>
              <Text variant="mediumPlus">{props.audienceMode}</Text>
            </div>
            <div>
              <Text variant="small" className={styles.metaLabel}>Fallback</Text>
              <Text variant="mediumPlus">{viewModel.fallbackApplied ? 'Genérico' : props.fallbackMode}</Text>
            </div>
          </div>
        </article>

        <article className={styles.variantCard}>
          <div className={styles.variantHeader}>
            <div>
              {variant.iconName ? <Icon iconName={variant.iconName} className={styles.variantIcon} /> : null}
              <Text variant="xxLarge" className={styles.variantTitle}>{variant.title}</Text>
              {variant.accentLabel ? <span className={styles.accentTag}>{variant.accentLabel}</span> : null}
            </div>
            {variant.isGeneric ? <span className={styles.genericPill}>Genérico</span> : <span className={styles.matchPill}>Personalizado</span>}
          </div>

          <Text variant="large" className={styles.variantSummary}>{variant.summary}</Text>
          {variant.body ? <Text className={styles.variantBody}>{variant.body}</Text> : null}

          {metrics.length > 0 ? (
            <div className={styles.metricsGrid}>
              {metrics.map((metric) => (
                <div className={styles.metricCard} key={metric.label}>
                  <Text variant="small" className={styles.metaLabel}>{metric.label}</Text>
                  <Text variant="xLarge">{metric.value}</Text>
                </div>
              ))}
            </div>
          ) : null}

          {tags.length > 0 ? (
            <div className={styles.tagList}>
              {tags.map(renderTag)}
            </div>
          ) : null}

          {variant.contentType === 'links' && safeLinks.length > 0 ? (
            <div className={styles.linkList}>
              {safeLinks.map((link) => (
                <a key={link.href} className={styles.linkItem} href={link.href} rel={link.rel} target={link.target}>
                  {link.label}
                </a>
              ))}
            </div>
          ) : null}

          {safeCtaLink ? (
            <div className={styles.actions}>
              <PrimaryButton
                text={variant.ctaLabel ?? 'Abrir'}
                href={safeCtaLink.href}
                target={safeCtaLink.target}
                rel={safeCtaLink.rel}
              />
              <DefaultButton text="Reintentar" onClick={onRetry} />
            </div>
          ) : (
            <div className={styles.actions}>
              <DefaultButton text="Reintentar" onClick={onRetry} />
            </div>
          )}
        </article>
      </div>
    </section>
  );
}
