import type { AstTopLayer, Site } from '@samply/lens';
import { Beacon } from './beacon';

export const requestBackend = (
	ast: AstTopLayer,
	updateResponse: (response: Map<string, Site>) => void,
	abortController: AbortController
) => {
	const queryId = crypto.randomUUID();
	const backendUrl: string = window.location.origin + ':8080'; // Assume same origin as frontend
	const backend = new Beacon(new URL(backendUrl), queryId);
	const queryString = JSON.stringify(ast)

    backend.send(
		queryString,
        updateResponse,
        abortController,
    );
}
