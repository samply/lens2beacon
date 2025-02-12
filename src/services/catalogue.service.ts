// This file includes a function to the the catalogue

// Use this function to get the catalogue from this project
export async function getStaticCatalogue<T>(path: string): Promise<T> {
	const response = await fetch(path);
	const data = await response.json();
	return data;
}
export const fetchData = async (
	catalogueUrl: string,
	optionsUrl: string
): Promise<{ catalogueJSON: string; optionsJSON: string }> => {
	const cataloguePromise: string = await fetch(catalogueUrl).then((response) =>
		response.text()
	);

	const optionsPromise: string = await fetch(optionsUrl).then((response) =>
		response.text()
	);

	return Promise.all([cataloguePromise, optionsPromise]).then(
		([catalogueJSON, optionsJSON]) => {
			return { catalogueJSON, optionsJSON };
		}
	);
};

export const catalogueText = {
	group: 'Group',
	collapseButtonTitle: 'Collapse Tree',
	expandButtonTitle: 'Expand Tree',
	numberInput: {
		labelFrom: 'von',
		labelTo: 'bis'
	}
};
