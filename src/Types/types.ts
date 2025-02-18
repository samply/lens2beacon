export type Site = {
	provider: string;
	collections: CollectionItem[];
};

type CollectionItem = {
	name: string;
	provider?: string;
	studies_count: number;
	subjects_count: number;
};
