<script lang="ts">
	import {
		barChartBackgroundColors,
		genderHeaders,
		measures
	} from './config/environment';
	import type { LensDataPasser } from '@samply/lens';
	import { catalogueText, fetchData } from './services/catalogue.service';

	let catalogueopen = false;
	const catalogueUrl = 'catalogues/catalogue-example.json';
	const optionsFilePath = 'config/options.json';


	const jsonPromises: Promise<{
		catalogueJSON: string;
		optionsJSON: string;
	}> = fetchData(catalogueUrl, optionsFilePath);

	let dataPasser: LensDataPasser;

	/**
	 * The following functions are the API to the library stores (state)
	 * here you get information to use in your application
	 * or manipulate the stores
	 * use if needed and import types from @samply/lens
	 */

	// const getQuery = (): void => {
	// 	console.log('getQuery()', dataPasser.getQueryAPI());
	// };

	// const getResponse = (): void => {
	// 	console.log('getResponse()', dataPasser.getResponseAPI());
	// };

	// const getAST = (): void => {
	// 	console.log('getAst()', dataPasser.getAstAPI());
	// };

	// const removeItem = (queryObject: QueryItem): void => {
	// 	console.log('removeItem()', queryObject);
	// 	dataPasser.removeItemFromQuyeryAPI({ queryObject });
	// 	getQuery();
	// };

	// const removeValue = (queryItem: QueryItem, value: QueryValue): void => {
	// 	console.log('removeValue()', queryItem, value);
	// 	dataPasser.removeValueFromQueryAPI({ queryItem, value });
	// 	getQuery();
	// };
</script>

<header>
	<div>
		<!-- Add logo here -->
	</div>
	<h1>Lens2 Example (Title Here)</h1>
	<div>
		<!-- Add logo here -->
	</div>
</header>

<main>
	<div class="search">
		<div class="search-wrapper">
			<lens-search-bar-multiple noMatchesFoundMessage="{'keine Ergebnisse gefunden'}"
			></lens-search-bar-multiple>
			<lens-info-button
				noQueryMessage="Leere Suchanfrage: Sucht nach allen Ergebnissen."
				showQuery="{true}"
			></lens-info-button>
			<lens-search-button title="Suchen"></lens-search-button>
		</div>
	</div>
	<div class="grid">
		<div class="catalogue-wrapper">
			<div class="catalogue">
				<h2>Suchkriterien</h2>
				<lens-info-button
					message="{[
						`Bei Patienten mit mehreren onkologischen Diagnosen, können sich ausgewählte Suchkriterien nicht nur auf eine Erkrankung beziehen, sondern auch auf Weitere.`,
						`Innerhalb einer Kategorie werden verschiedene Ausprägungen mit einer „Oder-Verknüpfung“ gesucht; bei der Suche über mehrere Kategorien mit einer „Und-Verknüpfung“.`
					]}"
				></lens-info-button>
				<lens-catalogue
					toggleIconUrl="right-arrow-svgrepo-com.svg"
					addIconUrl="long-right-arrow-svgrepo-com.svg"
					infoIconUrl="info-circle-svgrepo-com.svg"
					texts="{catalogueText}"
					toggle="{{ collapsable: false, open: catalogueopen }}"
				></lens-catalogue>
			</div>
		</div>
		<div class="charts">
			<div class="chart-wrapper result-summary">
				<lens-result-summary></lens-result-summary>
				<lens-search-modified-display
					>Diagramme repräsentieren nicht mehr die aktuelle Suche!</lens-search-modified-display
				>
			</div>
			<div class="chart-wrapper chart-diagnosis">
				<lens-chart
					title="Diagnose"
					catalogueGroupCode="diagnosis"
					chartType="bar"
					indexAxis="y"
					groupingDivider="."
					groupingLabel=".%"
					filterRegex="^[CD].*"
					xAxisTitle="Anzahl der Diagnosen"
					yAxisTitle="ICD-10-Codes"
					backgroundColor="{JSON.stringify(barChartBackgroundColors)}"
				></lens-chart>
			</div>

			<div class="chart-wrapper result-table">
				<lens-result-table pageSize="10">
					<div slot="above-pagination" class="result-table-hint-text">
						* Umfasst Gewebe- und flüssige Proben. Die Anzahl der FFPE-Proben (Schätzung)
						entspricht der Zahl der Diagnosen.
					</div>
				</lens-result-table>
			</div>
			<div class="chart-wrapper">
				<lens-chart
					title="Geschlecht"
					catalogueGroupCode="gender"
					chartType="pie"
					displayLegends="{true}"
					headers="{genderHeaders}"
				></lens-chart>
			</div>
			<div class="chart-wrapper chart-age-distribution">
				<lens-chart
					title="Alter bei Erstdiagnose"
					catalogueGroupCode="age_at_diagnosis"
					chartType="bar"
					groupRange="{10}"
					filterRegex="^(1*[12]*[0-9])"
					xAxisTitle="Alter"
					yAxisTitle="Anzahl der Primärdiagnosen"
					backgroundColor="{JSON.stringify(barChartBackgroundColors)}"
				></lens-chart>
			</div>
			<div class="chart-wrapper">
				<lens-chart
					title="Proben"
					catalogueGroupCode="sample_kind"
					chartType="bar"
					xAxisTitle="Probentypen"
					yAxisTitle="Probenanzahl"
					filterRegex="^(?!(tissue-other|buffy-coat|peripheral-blood-cells|dried-whole-blood|swab|ascites|stool-faeces|saliva|liquid-other|derivative-other))"
					backgroundColor="{JSON.stringify(barChartBackgroundColors)}"
				>
				</lens-chart>
			</div>
		</div>
	</div>
</main>

<footer>
	<div class="made_with">
		Made with ♥ and <a href="https://github.com/samply/lens">samply/lens-core</a>
	</div>
	<div class="logo">
		<img src="../Deutsches_Krebsforschungszentrum_Logo.svg" alt="Logo des DKFZ" />
	</div>
</footer>

<!-- here it waits on all promises to resolve and fills in the parameters -->
{#await jsonPromises}
	Loading data...
{:then { optionsJSON, catalogueJSON }}
	<lens-options {catalogueJSON} {optionsJSON} {measures}></lens-options>
{:catch someError}
	System error: {someError.message}
{/await}

<lens-data-passer bind:this="{dataPasser}"></lens-data-passer>
