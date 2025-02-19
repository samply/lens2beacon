/**
 * TODO: document this class
 */

import type { ResponseStore, Site, Status, BeamResult } from '@samply/lens';
import type { Provider } from '../Types/types';

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
			const beamTaskResponse = await fetch(
				`${this.url}beam?sites=${this.sites.toString()}`,
				{
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					credentials: 'include',
					body: JSON.stringify({
						id: this.currentTask,
						sites: this.sites,
						query: query
					}),
					signal: controller.signal
				}
			);
			if (!beamTaskResponse.ok) {
				const error = await beamTaskResponse.text();
				console.debug(`Received ${beamTaskResponse.status} with message ${error}`);
				throw new Error(`Unable to create new beam task.`);
			}

			console.info(`Created new Beam Task with id ${this.currentTask}`);

			const eventSource = new EventSource(
				`${this.url.toString()}beam/${this.currentTask}?wait_count=${this.sites.length}`,
				{
					withCredentials: true
				}
			);

			/**
			 * Listenes to the new_result event from beam and updates the response store
			 */
			eventSource.addEventListener('new_result', (message) => {
				const response: BeamResult = JSON.parse(message.data);
				if (response.task !== this.currentTask) return;
				const site: string = response.from.split('.')[1];
				const status: Status = response.status;
				//const body: SiteData = status === 'succeeded' ? JSON.parse(atob(response.body)) : null;
				const body: Provider =
					status === 'succeeded' ? JSON.parse(atob(response.body)) : null;

				//const parsedResponse: ResponseStore = new Map().set(site, {
				//	status: status,
				//	data: body
				//});
				const parsedResponse: ResponseStore = this.transformResponse(site, status, body);
				updateResponse(parsedResponse);
			});

			// read error events from beam
			eventSource.addEventListener('error', (message) => {
				console.error(`Beam returned error`, message);
				eventSource.close();
			});

			// event source in javascript throws an error then the event source is closed by backend
			eventSource.onerror = () => {
				console.info(
					`Querying results from sites for task ${this.currentTask} finished.`
				);
				eventSource.close();
			};
		} catch (err) {
			if (err instanceof Error && err.name === 'AbortError') {
				console.log(`Aborting request ${this.currentTask}`);
			} else {
				console.error(err);
				console.log('Mock-Response');
				const response: Provider[] = [
					{
						provider: 'ProCancerI',
						collections: [
							{
								name: 'ProCAncer-I Use Case 2',
								subjects_count: 5432,
								studies_count: 5434
							}
						]
					},
					{
						provider: 'Testprovider',
						collections: [
							{
								name: 'Test 2',
								subjects_count: 5432,
								studies_count: 5434
							}
						]
					}
				];

				const parsedResponse: ResponseStore = this.transformResponse(
					'site1',
					'succeeded',
					response[0]
				);
				const parsedResponse2: ResponseStore = this.transformResponse(
					'site2',
					'succeeded',
					response[1]
				);
				updateResponse(parsedResponse);
				updateResponse(parsedResponse2);
			}
		}
	}

	/*
	transformResponse(site: string, status: Status, provider: Provider): ResponseStore {
		const transformedResponse: ResponseStore = new Map();

		const providerData: Site = {
			status: 'succeeded',
			data: {
				extension: [provider],
				group: [
					{
						code: {
							text: 'Studies'
						},
						population: [
							{
								count: provider.collections.reduce(
									(acc, curr) => acc + curr.studies_count,
									0
								),
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
						stratifier: [
							{
								code: [{ text: 'Studies' }],
								stratum: provider.collections.map((collection) => ({
									value: { text: collection.name },
									population: [
										{
											count: collection.studies_count,
											code: {
												coding: [
													{
														system: '',
														code: ''
													}
												]
											}
										}
									]
								}))
							}
						]
					},
					{
						code: {
							text: 'Subjects'
						},
						population: [
							{
								count: provider.collections.reduce(
									(acc, curr) => acc + curr.subjects_count,
									0
								),
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
					}
				],
				date: '',
				period: {},
				measure: '',
				resourceType: '',
				status: '',
				type: ''
			}
		};

		transformedResponse.set(site, providerData);
		return transformedResponse;
	}
*/
	/**
	 * Transforms provider data into a structured response format.
	 *
	 * This function processes a given site and provider information,
	 * calculating total study and subject counts while structuring the data accordingly.
	 *
	 * @param {string} site - The name or identifier of the site.
	 * @param {Status} status - The status of the response.
	 * @param {Site} provider - The provider data containing collections of studies and subjects.
	 * @returns {ResponseStore} - A Map containing the transformed response data for the site.
	 */
	transformResponse(site: string, status: Status, provider: Provider): ResponseStore {
		const transformedResponse: ResponseStore = new Map();

		let totalStudiesCount = 0;
		let totalSubjectsCount = 0;

		for (const collection of provider.collections) {
			totalStudiesCount += collection.studies_count;
		}

		for (const collection of provider.collections) {
			totalSubjectsCount += collection.subjects_count;
		}

		// Creating stratifier
		// const stratifierStudies: any[] = [];
		const stratifierStudies = [];
		for (const collection of provider.collections) {
			stratifierStudies.push({
				value: { text: collection.name },
				population: [
					{
						count: collection.studies_count,
						code: {
							coding: [
								{
									system: '',
									code: ''
								}
							]
						}
					}
				]
			});
		}

		const providerData: Site = {
			status: 'succeeded',
			data: {
				extension: [provider],
				group: [
					{
						code: { text: 'Studies' },
						population: [
							{
								count: totalStudiesCount,
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
						stratifier: [
							{
								code: [{ text: 'Studies' }],
								stratum: stratifierStudies
							}
						]
					},
					{
						code: { text: 'Subjects' },
						population: [
							{
								count: totalSubjectsCount,
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
					}
				],
				date: '',
				period: {},
				measure: '',
				resourceType: '',
				status: '',
				type: ''
			}
		};

		transformedResponse.set(site, providerData);
		return transformedResponse;
	}
}
