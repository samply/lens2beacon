<script lang="ts">
	import './app.css';
	import { browser } from '$app/environment';

	// conditional import for SSR
	if (browser) import('@samply/lens');

	import { measures } from './config/environment';
	import options from './config/options.json';
	import type { LensDataPasser, QueryEvent } from '@samply/lens';
	import { catalogueText, fetchData } from './services/catalogue.service';
	import ResultTable from './components/ResultTable.svelte';
	import { requestBackend } from './services/backend.service';

	let catalogueopen = false;
	let catalogueCollapsable = true;

	const catalogueUrl = 'catalogues/catalogue-eucaim.json';
	const optionsFilePath = 'config/options.json';

	const jsonPromises: Promise<{
		catalogueJSON: string;
		optionsJSON: string;
	}> = fetchData(catalogueUrl, optionsFilePath);

	let dataPasser: LensDataPasser;

	if (window.innerWidth >= 1024) {
		catalogueCollapsable = false;
	}

	/**
	 * This event listener is triggered when the user clicks the search button
	 */

	window.addEventListener('emit-lens-query', (e) => {
		const event = e as QueryEvent;
		const { ast, updateResponse, abortController } = event.detail;
		requestBackend(ast, updateResponse, abortController);
	});
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
			<lens-search-bar-multiple noMatchesFoundMessage="{'No collections found'}"
			></lens-search-bar-multiple>
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
			<div class="chart-wrapper result-summary">
				<lens-result-summary></lens-result-summary>
			</div>

			<div class="chart-wrapper">
				<lens-chart
					title="Studies per Collection"
					catalogueGroupCode="Studies"
					chartType="pie"
					displayLegends="{true}"
				></lens-chart>
			</div>

			<div class="chart-wrapper result-table">
				<ResultTable options="{options.tableOptions}" />
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
