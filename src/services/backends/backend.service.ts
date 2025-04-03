import type { AstTopLayer, Site } from '@samply/lens';
import { Beacon } from './beacon';

export const requestBackend = (
	ast: AstTopLayer,
	updateResponse: (response: Map<string, Site>) => void
) => {
	const queryId = crypto.randomUUID();
	// const backendUrl: string = window.location.origin + ':8080'; // Assume same origin as frontend
	const currentUrl = new URL(window.location.origin);
	currentUrl.port = '8080'; // Replace the port with the backend port
	const backendUrl: string = currentUrl.origin;
	const backend = new Beacon(new URL(backendUrl), queryId);
	const queryString = JSON.stringify(ast);

	backend.send(queryString, updateResponse);
};
