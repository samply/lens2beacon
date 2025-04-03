/**
 * Deal with queries which should be handled by sites providing the Beacon search API.
 */
import type { ResponseStore } from '@samply/lens';
import type { Group } from '../../Types/types';
import type { Site } from '@samply/lens';
import { v4 as uuidv4 } from 'uuid';
export interface MeasureReport {
	// Define properties as needed
	// [key: string]: any;
	[key: string]: unknown;
}
export interface BeaconResult {
	measureReport: MeasureReport;
	siteName: string;
	siteUrl: string;
}

export class Beacon {
	constructor(
		private url: URL,
		// private sites: Array<string>,
		private currentTask: string
		// public auth: string = ''
	) {}

	/**
	 * sends the query to the lens-beacon-service and updates the store with the results
	 * @param query the query as base64 encoded string
	 * @param updateResponse the function to update the response store
	 * @param controller the abort controller to cancel the request
	 */
	async send(
		query: string,
		updateResponse: (response: ResponseStore) => void
	): Promise<void> {
		try {
			console.log('Sending query to lens-beacon-service');

			// Prepare HTTP headers
			const httpHeaders = this.prepareHttpHeaders();
			const httpOptions: RequestInit = {
				method: 'POST',
				headers: httpHeaders,
				body: query // assuming 'query' is already a JSON string
			};
			const urlString = this.url.toString() + 'query/ast';

			const response = await fetch(urlString, httpOptions);
			console.log('Response received from lens-beacon-service');

			const ok = response.ok;
			if (!ok) {
				const error = await response.text();
				const status = response.status;
				const type = await response.type;
				console.log(
					`Problem with fetch: status ${status} and type ${type} with message ${error}`
				);
				throw new Error(`Unable to query lens-beacon-service.`);
			}

			const jsonParsedResults: BeaconResult[] = await response.json();
			for (const result of jsonParsedResults) {
				const parsedResponse: ResponseStore = new Map().set(result.siteName, {
					status: 'succeeded',
					data: result.measureReport
				});
				console.log('send: parsedResponse: ', parsedResponse);
				updateResponse(parsedResponse);
			}
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				console.log(`Aborting request ${this.currentTask}`);
			} else {
				console.error(err);
				this.loadSyntheticData(updateResponse);
			}
		}
	}

	loadSyntheticData(updateResponse: (response: ResponseStore) => void): void {
		console.log('Mock-Response');
		// Provide a mock response if there is no lens-beacon- service.
		// Test data
		const populationValueMapStockholm: Map<string, string> = new Map([
			['name', 'stockholm'],
			['variants', '5434'],
			['cohorts', '5432'],
			['runs', '2'],
			['analyses', '1'],
			['datasets', '1'],
			['individuals', '2050'],
			['specimen', '3000']
		]);
		updateResponse(this.createResponseStore(populationValueMapStockholm));
		const populationValueMapAthens: Map<string, string> = new Map([
			['name', 'athens'],
			['variants', '2024'],
			['cohorts', '828'],
			['runs', '2'],
			['analyses', '3'],
			['datasets', '1'],
			['individuals', '255'],
			['specimen', '4001']
		]);
		updateResponse(this.createResponseStore(populationValueMapAthens));
		const populationValueMapBucharest: Map<string, string> = new Map([
			['name', 'bucharest'],
			['variants', '28'],
			['cohorts', '322'],
			['runs', '1'],
			['analyses', '1'],
			['datasets', '1'],
			['individuals', '30000'],
			['specimen', '50000']
		]);
		updateResponse(this.createResponseStore(populationValueMapBucharest));
	}

	/**
	 * Creates a synthetic ResponseStore based on the provided population value map.
	 * @param populationValueMap - A map where the key is the population name and the value is the population count as a string.
	 *                             Includes a special key "name" for the site's name.
	 * @returns A ResponseStore object containing transformed site data.
	 */
	createResponseStore(populationValueMap: Map<string, string>): ResponseStore {
		const groupList: Group[] = this.addPopulationsToGroupList(populationValueMap);

		const site: Site = {
			status: 'succeeded',
			data: {
				extension: [],
				group: groupList,
				date: '',
				period: {},
				measure: 'urn:uuid:' + uuidv4(),
				resourceType: '',
				status: 'succeeded',
				type: 'summary'
			}
		};
		const transformedResponse: ResponseStore = new Map();
		if (populationValueMap.has('name')) {
			const name: string = populationValueMap.get('name') as string;
			transformedResponse.set(name, site);
		}
		console.log('createResponseStore: transformedResponse: ', transformedResponse);
		return transformedResponse;
	}

	/**
	 * Converts the supplied population value map into a list of groups.
	 * @param populationValueMap - A map where the key is the population name and the value is the population count as a string.
	 *                             Excludes the key "name" as it is not considered a population.
	 * @returns A list of Group objects representing populations.
	 */
	addPopulationsToGroupList(populationValueMap: Map<string, string>): Group[] {
		const groupList: Group[] = [];
		populationValueMap.forEach((value, population) => {
			// Don't add "name" to the group list, it's not a population,
			// it's just the name of the site.
			if (population === 'name') {
				return;
			}

			const group: Group = {
				code: {
					text: population
				},
				population: [
					{
						count: Number(value),
						code: {
							coding: [
								{
									system: '',
									code: ''
								}
							]
						}
					}
				],
				stratifier: []
			};
			groupList.push(group);
		});

		return groupList;
	}

	/**
	 * Prepares HTTP headers for requests.
	 *
	 * @returns A Headers instance with default configurations and an optional Authorization header.
	 *
	 * @private
	 */
	private prepareHttpHeaders(): Headers {
		const headers = new Headers({
			// 'Access-Control-Allow-Origin': '*',
			// 'Access-Control-Allow-Methods': 'POST, GET, OPTIONS, DELETE, PUT',
			// 'Access-Control-Allow-Headers': 'append,delete,entries,foreach,get,has,keys,set,values,Authorization',
			Accept: '*/*',
			// 'Accept-Encoding': 'gzip, deflate, br',
			// 'Connection': 'keep-alive',
			'Content-Type': 'application/json'
		});

		// if (this.auth !== "") {
		// 	headers.append("Authorization", this.auth);
		// }

		return headers;
	}
}
