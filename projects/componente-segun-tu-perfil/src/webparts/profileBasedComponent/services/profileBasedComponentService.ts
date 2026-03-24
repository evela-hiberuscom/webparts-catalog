import type {
  IProfileBasedComponentService,
  IProfileBasedComponentViewModel,
  IProfileContextSnapshot,
  IProfileVariantRepository,
  IProfileVariantRequest
} from '../models/profileBasedComponentModels';
import { buildCurrentProfileTokens } from '../utils/profileTokens';
import { resolveProfileVariant } from '../utils/profileVariantMatching';

function describeSource(type: IProfileVariantRequest['dataSourceType']): string {
  switch (type) {
    case 'SharePointList':
      return 'SharePoint list';
    case 'JsonUrl':
      return 'Same-origin JSON';
    case 'StaticConfig':
      return 'Static config';
    default:
      return 'Unknown source';
  }
}

function buildErrorViewModel(
  title: string,
  description: string,
  contextTokens: string[],
  errorMessage: string
): IProfileBasedComponentViewModel {
  return {
    state: 'error',
    title,
    description,
    sourceLabel: 'Unavailable',
    currentTokens: contextTokens,
    matchedTokens: [],
    fallbackApplied: false,
    variants: [],
    message: description,
    errorMessage
  };
}

class ProfileBasedComponentService implements IProfileBasedComponentService {
  public constructor(private readonly repository: IProfileVariantRepository) {}

  public async resolve(
    request: IProfileVariantRequest,
    context: IProfileContextSnapshot
  ): Promise<IProfileBasedComponentViewModel> {
    const currentTokens = buildCurrentProfileTokens(context, request.audienceMode);

    try {
      const variants = await this.repository.loadVariants(request);
      const limitedVariants = variants.slice(0, request.maxItems > 0 ? request.maxItems : variants.length);
      const selection = resolveProfileVariant(limitedVariants, currentTokens, request.fallbackMode);
      const selectedVariant = selection.variant;

      if (!selectedVariant) {
        return {
          state: 'empty',
          title: request.title,
          description: request.description,
          sourceLabel: describeSource(request.dataSourceType),
          currentTokens,
          matchedTokens: selection.matchedTokens,
          fallbackApplied: selection.fallbackApplied,
          variants: limitedVariants,
          message: 'No hay contenido específico para tu perfil.'
        };
      }

      return {
        state: selection.state,
        title: request.title,
        description: request.description,
        sourceLabel: describeSource(request.dataSourceType),
        currentTokens,
        matchedTokens: selection.matchedTokens,
        fallbackApplied: selection.fallbackApplied,
        variant: selectedVariant,
        variants: limitedVariants,
        message: selection.state === 'partialData'
          ? 'Se ha aplicado una variante parcial o genérica.'
          : 'Variante personalizada resuelta.'
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'No se ha podido resolver el contenido personalizado.';
      return buildErrorViewModel(request.title, request.description, currentTokens, message);
    }
  }
}

export function createProfileBasedComponentService(repository: IProfileVariantRepository): IProfileBasedComponentService {
  return new ProfileBasedComponentService(repository);
}
