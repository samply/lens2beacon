import type { AstTopLayer, Site } from '@samply/lens';
import { Spot } from './spot';

// studies per collection = aggregated values of studies_count -> getAggregatedPopulationForStratumCode()

export const requestBackend = (
	ast: AstTopLayer,
	updateResponse: (response: Map<string, Site>) => void,
	abortController: AbortController
) => {
	console.log('entered backendCall');
	//console.log('response', response);
	console.log(abortController);

	const queryId = crypto.randomUUID();
	const query = {
		lang: 'ast',
		query: btoa(
			decodeURI(
				JSON.stringify({ ast: ast, id: queryId.concat('__search__').concat(queryId) })
			)
		)
	};

	let backendUrl: string = '';

	if (import.meta.env.VITE_TARGET_ENVIRONMENT === "production") {
	    backendUrl = "https://explorer.eucaim.cancerimage.eu/backend/";
	} else if (import.meta.env.VITE_TARGET_ENVIRONMENT === "staging") {
		// TODO: Change back to test instance after merge to main
		backendUrl = 'https://explorer-eucaim.grycap.i3m.upv.es/backend/';
	} else {
		backendUrl = 'http://localhost:8055';
	}

	const backend = new Spot(
		new URL(backendUrl),
		['procanceri', 'chaimeleon', 'incisive', 'upv-node'],
		queryId
	);

	backend.send(btoa(decodeURI(JSON.stringify(query))), updateResponse, abortController);

	/***************************************************************************************************************/

	// try {
	//     const response = await fetch('/api', {
	//         method: 'POST',
	//         headers: {
	//             'Content-Type': 'application/json',
	//         },
	//         body: JSON.stringify(ast),
	//         signal: abortController.signal
	//     });
	//     if (response.ok) {
	//         const data = await response.text();
	//         console.log(data);
	//         // updateResponse(data);
	//     } else {
	//         console.error('Server response was not ok.');
	//     }
	// } catch (error) {
	//     console.error('Error:', error);
	// }
};
