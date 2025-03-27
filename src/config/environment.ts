// VITE_TARGET_ENVIRONMENT should be set by the ci pipeline

import type { MeasureGroup } from '@samply/lens';

/**
 * Array of measure groups for different backends
 */
export const measures: MeasureGroup[] = [
	{
		name: 'DKTK',
		measures: []
	}
];

export const backendMeasures = `DKTK_STRAT_DEF_IN_INITIAL_POPULATION`;
