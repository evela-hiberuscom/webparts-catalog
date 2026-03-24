import {
  DATA_SOURCE_OPTIONS,
  DEFAULT_DATA_SOURCE_TYPE,
  MAX_PROJECT_ITEMS,
  normalizeProjectStatusDataSourceType
} from './projectStatusWebPartConfig';

describe('projectStatusWebPartConfig', () => {
  it('hides Planner from the supported data source options', () => {
    expect(DATA_SOURCE_OPTIONS.some((option) => option.key === 'Planner')).toBe(false);
  });

  it('normalizes Planner to the default supported source', () => {
    expect(normalizeProjectStatusDataSourceType('Planner')).toBe(DEFAULT_DATA_SOURCE_TYPE);
  });

  it('caps max project items at 30', () => {
    expect(MAX_PROJECT_ITEMS).toBe(30);
  });
});
