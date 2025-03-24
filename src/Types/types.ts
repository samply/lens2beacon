/**
The group part of a measure report
*/
export type Group = {
	code: {
		text: string;
	};
	population: {
		count: number;
		code: {
			coding: {
				system: string;
				code: string;
			}[];
		};
	}[];
	stratifier: {
		code: {
			text: string;
		}[];
		stratum?: {
			population?: {
				count: number;
				code: {
					coding: {
						code: string;
						system: string;
					}[];
				};
			}[];
			value: {
				text: string;
			};
		}[];
	}[];
};
