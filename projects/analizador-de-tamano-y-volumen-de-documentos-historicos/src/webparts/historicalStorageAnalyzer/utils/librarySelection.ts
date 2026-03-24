import { ensureUniqueStrings } from '@paquete/spfx-common';
import type { IHistoricalStorageLibraryOption } from '../models/historicalStorageAnalyzer.types';

function normalize(value?: string): string {
  return value?.trim().toLowerCase() ?? '';
}

export function pickDefaultLibrary(
  libraries: IHistoricalStorageLibraryOption[],
  hint?: string
): IHistoricalStorageLibraryOption | undefined {
  const normalizedHint = normalize(hint);
  const candidates = ensureUniqueStrings([
    normalizedHint,
    normalizedHint.replace(/\/_layouts\/15\/.*$/, ''),
    normalizedHint.replace(/\/$/, '')
  ]);

  const exactMatch = libraries.find((library) =>
    candidates.some(
      (candidate) =>
        candidate !== '' &&
        [library.id, library.title, library.serverRelativeUrl, library.webUrl]
          .map((value) => normalize(value))
          .some((value) => value === candidate || value.includes(candidate))
    )
  );

  if (exactMatch) {
    return exactMatch;
  }

  const visibleLibrary = libraries.find((library) => !library.hidden && !library.isSystemLibrary);
  return visibleLibrary ?? libraries[0];
}

export function toLibraryComboBoxOption(
  library: IHistoricalStorageLibraryOption,
  itemCountSuffix: string = ' ({0} elementos)'
): {
  key: string;
  text: string;
  data: IHistoricalStorageLibraryOption;
} {
  const suffix = library.itemCount > 0 ? itemCountSuffix.replace('{0}', String(library.itemCount)) : '';
  return {
    key: library.id,
    text: `${library.title}${suffix}`,
    data: library
  };
}

export function getSelectableLibraryTitle(
  library: IHistoricalStorageLibraryOption | undefined,
  noSelectionLabel: string = 'Ninguna biblioteca seleccionada'
): string {
  if (!library) {
    return noSelectionLabel;
  }

  return `${library.title} (${library.serverRelativeUrl})`;
}
