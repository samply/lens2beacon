<script lang="ts">
	import './app.css';
	import { browser } from '$app/environment';

	// conditional import for SSR
	if (browser) import('@samply/lens');

	import { measures } from './config/environment';
	import type { LensDataPasser } from '@samply/lens';
	import { catalogueText, fetchData } from './services/catalogue.service';
	import { requestBackend } from './services/backends/backend.service';

	let catalogueopen = false;
	let catalogueCollapsable = true;

	const catalogueUrl = 'catalogues/catalogue-beacon.json';
	const optionsFilePath = 'config/options.json';

	const jsonPromises: Promise<{
		catalogueJSON: string;
		optionsJSON: string;
	}> = fetchData(catalogueUrl, optionsFilePath);

	let dataPasser: LensDataPasser;

	/**
	 * This event listener is triggered when the user clicks the search button
	 */
	if (browser) {
		window.addEventListener('emit-lens-query', (e) => {
			if (!dataPasser) return;

			const event = e as CustomEvent;
			const { ast, updateResponse, abortController } = event.detail;
			requestBackend(ast, updateResponse, abortController);
		});
	}
</script>

<header>
	<div class="header-panel">
		<img class="header-panel-image" src="../assets/images/Beacon.PNG" alt="Beacon" />
		<p class="header-panel-text">Beacon search</p>
	</div>
</header>

<main>
	<div class="search">
		<div class="search-wrapper">
			<lens-search-bar noMatchesFoundMessage="{'No information found'}"></lens-search-bar>
			<lens-info-button
				noQueryMessage="Query with no criteria selected: Searches for all collections."
				showQuery="{true}"
			></lens-info-button>
			<lens-search-button title="Search"></lens-search-button>
		</div>
	</div>
	<div class="grid">
		<div class="catalogue-wrapper">
			<div class="catalogue">
				<lens-catalogue
					toggleIconUrl="right-arrow-svgrepo-com.svg"
					addIconUrl="long-right-arrow-svgrepo-com.svg"
					infoIconUrl="info-circle-svgrepo-com.svg"
					texts="{catalogueText}"
					toggle="{{ collapsable: catalogueCollapsable, open: catalogueopen }}"
				></lens-catalogue>
			</div>
		</div>
		<div class="charts">
			<!-- Each chart requires an entry in static/config/options.json -->
			<!-- in the catalogueKeyToResponseKeyMap, providing mappings from the code for -->
			<!-- the stratifier to the catalogueGroupCode for the chart. You need to do this -->
			<!-- even if code and catalogueGroupCode are the same. -->
			<div class="chart-wrapper result-table">
				<lens-result-table pageSize="10"> </lens-result-table>
			</div>

			<div class="chart-wrapper">
				<lens-chart
					title="Gender Distribution"
					catalogueGroupCode="Gender"
					chartType="pie"
					displayLegends="{true}"
					xAxisTitle="Gender signifier"
					yAxisTitle="Number of patients"
				></lens-chart>
			</div>
			<div class="chart-wrapper">
				<lens-chart
					title="Ethnicity Distribution"
					catalogueGroupCode="Ethnicity"
					chartType="pie"
					displayLegends="{true}"
					xAxisTitle="Ethnicity signifier"
					yAxisTitle="Number of patients"
				></lens-chart>
			</div>
			<div class="chart-wrapper">
				<lens-chart
					title="Variant types"
					catalogueGroupCode="variant_name"
					chartType="bar"
					displayLegends="{true}"
					xAxisTitle="Variant name"
					yAxisTitle="Number of entities"
				></lens-chart>
			</div>
			<div class="chart-wrapper">
				<lens-chart
					title="Samples"
					catalogueGroupCode="sample_kind"
					chartType="bar"
					displayLegends="{true}"
					xAxisTitle="Sample types"
					yAxisTitle="Sample count"
				></lens-chart>
			</div>
		</div>
	</div>

	<div class="credits">
		<p>
			This federated search was made with the open source <a
				href="https://github.com/samply/">Samply tools</a
			>
			(<a href="https://github.com/samply/lens/">Lens</a>,
			<a href="https://github.com/samply/beam/">Beam</a>), created by the
			<a href="https://www.dkfz.de/en/verbis/">German Cancer Research Center (DKFZ)</a>.
		</p>
	</div>
</main>

<!-- here it waits on all promises to resolve and fills in the parameters -->
{#await jsonPromises}
	Loading data...
{:then { optionsJSON, catalogueJSON }}
	<lens-options {catalogueJSON} {optionsJSON} {measures}></lens-options>
{:catch someError}
	System error: {someError.message}
{/await}

<lens-data-passer bind:this="{dataPasser}"></lens-data-passer>
