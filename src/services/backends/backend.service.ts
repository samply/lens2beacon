import type { AstTopLayer, Site } from '@samply/lens';
import { Spot } from './spot';

export const requestBackend = (
	ast: AstTopLayer,
	updateResponse: (response: Map<string, Site>) => void,
	abortController: AbortController
) => {
	const queryId = crypto.randomUUID();
	const query = {
		lang: 'ast',
		payload: btoa(
			decodeURI(
				JSON.stringify({ ast: ast, id: queryId.concat('__search__').concat(queryId) })
			)
		)
	};

	let backendUrl: string = '';
	const siteList: string[] = ['uppsala-test', 'eric-test', 'prague-uhkt-test'];

	if (import.meta.env.VITE_TARGET_ENVIRONMENT === 'production') {
		backendUrl = 'https://locator.bbmri-eric.eu/backend/';
	} else {
		backendUrl = 'http://localhost:8055';
	}

	const backend = new Spot(new URL(backendUrl), siteList, queryId);

	backend.send(btoa(decodeURI(JSON.stringify(query))), updateResponse, abortController);
};
