export type Provider = {
	provider: string;
	provider_icon?: string;
	collections: CollectionItem[];
};

type CollectionItem = {
	name: string;
	id: string;
	provider_icon?: string;
	provider?: string;
	studies_count: number;
	subjects_count: number;
	age_range: {
		min: number;
		max: number;
	};
	gender: string[];
	modality?: string[];
	modalities?: string[];
	body_parts: string[];
	description: string;
};
