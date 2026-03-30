import { ensureUniqueStrings } from '@paquete/spfx-common/utils';
import * as strings from 'PortalMapWebPartStrings';
import type { IPortalMapRequest, IPortalMapSnapshot } from '../models/portalMapModels';
import { PortalMapRepository } from '../repositories/portalMapRepository';
import {
  buildPortalHierarchy,
  flattenPortalTree,
  formatSourceLabel,
  groupPortalNodes
} from '../utils/portalMapUtils';

export class PortalMapService {
  public constructor(private readonly repository: PortalMapRepository = new PortalMapRepository()) {}

  public async resolve(request: IPortalMapRequest): Promise<IPortalMapSnapshot> {
    const repositoryResult = await this.repository.load(request);

    if (repositoryResult.items.length === 0) {
      return {
        state: 'empty',
        roots: [],
        flatItems: [],
        groupedItems: [],
        sourceLabel: formatSourceLabel(
          request.dataSourceType,
          request.listTitleOrUrl,
          strings.SourceLabelStaticConfig,
          strings.SourceLabelJsonUrl,
          strings.SourceLabelSharePointList
        ),
        hasPartialData: false,
        notes: [],
        errorMessage: undefined,
        resolvedViewMode: request.viewMode
      };
    }

    const hierarchy = buildPortalHierarchy(repositoryResult.items, request.maxDepth);
    const flatItems = flattenPortalTree(hierarchy.roots);
    const groupedItems = groupPortalNodes(flatItems);
    const notes: string[] = [];

    if (repositoryResult.items.some((item) => !item.openUrl)) {
      notes.push(strings.PartialNoActionWarning);
    }

    if (repositoryResult.items.some((item) => item.nodeType === 'unknown')) {
      notes.push(strings.PartialUnknownTypeWarning);
    }

    if (hierarchy.hasOrphans) {
      notes.push(strings.PartialOrphanWarning);
    }

    if (hierarchy.hasCycles) {
      notes.push(strings.PartialCycleWarning);
    }

    if (hierarchy.hasTrimmedNodes) {
      notes.push(strings.PartialDepthWarning);
    }

    const hasPartialData = Boolean(repositoryResult.hasPartialData || notes.length > 0);
    const resolvedViewMode =
      request.viewMode === 'tree' && hierarchy.hasCycles ? 'grouped' : request.viewMode;

    return {
      state: hasPartialData ? 'partialData' : 'ready',
      roots: hierarchy.roots,
      flatItems,
      groupedItems,
      sourceLabel: formatSourceLabel(
        request.dataSourceType,
        request.listTitleOrUrl,
        strings.SourceLabelStaticConfig,
        strings.SourceLabelJsonUrl,
        strings.SourceLabelSharePointList
      ),
      hasPartialData,
      notes: ensureUniqueStrings(notes),
      errorMessage: undefined,
      resolvedViewMode
    };
  }
}
