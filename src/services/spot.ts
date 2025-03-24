/**
 * TODO: document this class
 */

import type { ResponseStore, Site, SiteData, BeamResult } from '@samply/lens';
import type { Group } from '../Types/types';
import { v4 as uuidv4 } from 'uuid';

export class Spot {
	constructor(
		private url: URL,
		private sites: Array<string>,
		private currentTask: string
	) {}

	/**
	 * sends the query to beam and updates the store with the results
	 * @param query the query as base64 encoded string
	 * @param updateResponse the function to update the response store
	 * @param controller the abort controller to cancel the request
	 */
	async send(
		query: string,
		updateResponse: (response: ResponseStore) => void,
		controller: AbortController
	): Promise<void> {
		try {
			this.currentTask = crypto.randomUUID();
			const beamTaskResponse = await fetch(
				`${this.url}beam?sites=${this.sites.toString()}`,
				{
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					},
					credentials: import.meta.env.PROD ? "include" : "omit",
					body: JSON.stringify({
						id: this.currentTask,
						sites: this.sites,
						query: query,
					}),
					signal: controller.signal,
				},
			);
			if (!beamTaskResponse.ok) {
				const error = await beamTaskResponse.text();
				console.debug(
					`Received ${beamTaskResponse.status} with message ${error}`,
				);
				throw new Error(`Unable to create new beam task.`);
			}

			console.info(`Created new Beam Task with id ${this.currentTask}`);

			/**
			 * Listenes to the new_result event from beam and updates the response store
			 */
			const eventSource = new EventSource(
				`${this.url.toString()}beam/${this.currentTask}?wait_count=${this.sites.length}`,
				{
					withCredentials: true,
				},
			);
			eventSource.addEventListener("new_result", (message) => {
				const response: BeamResult = JSON.parse(message.data);
				if (response.task !== this.currentTask) return;
				const site: string = response.from.split(".")[1];
				const status: string = response.status;
				const body: SiteData =
					status === "succeeded"
						? JSON.parse(atob(response.body))
						: null;

				const parsedResponse: ResponseStore = new Map().set(site, {
					status: status,
					data: body,
				});
				updateResponse(parsedResponse);
			});

			// event source in javascript throws an error then the event source is closed by backend
			eventSource.onerror = () => {
				console.info(
					`Querying results from sites for task ${this.currentTask} finished.`,
				);
				eventSource.close();
			};
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				console.log(`Aborting request ${this.currentTask}`);
			} else {
				console.error(err);
				console.log('Mock-Response');

				const populationValueMapStockholm: Map<string, string> = new Map([
					["name", "stockholm"],
					["variants", "5434"],
					["cohorts", "5432"],
					["runs", "2"],
					["analyses", "1"],
					["datasets", "1"],
					["individuals", "2050"],
					["biosamples", "3000"]
				]);
				updateResponse(this.createResponseStore(populationValueMapStockholm));

				const populationValueMapAthens: Map<string, string> = new Map([
					["name", "athens"],
					["variants", "2024"],
					["cohorts", "828"],
					["runs", "2"],
					["analyses", "3"],
					["datasets", "1"],
					["individuals", "255"],
					["biosamples", "4001"]
				]);
				updateResponse(this.createResponseStore(populationValueMapAthens));

				const populationValueMapBucharest: Map<string, string> = new Map([
					["name", "bucharest"],
					["variants", "28"],
					["cohorts", "322"],
					["runs", "1"],
					["analyses", "1"],
					["datasets", "1"],
					["individuals", "30000"],
					["biosamples", "50000"]
				]);
				updateResponse(this.createResponseStore(populationValueMapBucharest));
			}
		}
	}

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
		return transformedResponse;
	}

	addPopulationsToGroupList(populationValueMap: Map<string, string>): Group[] {
		const groupList: Group[] = [];
		populationValueMap.forEach((value, population) => {
			// Don't add "name" to the group list, it's not a population,
			// it's just the name of the site.
			if (population === "name") {
				return;
			}

			const group: Group =
			{
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
}
