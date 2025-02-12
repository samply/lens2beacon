<script lang="ts">
	import type { LensDataPasser } from '@samply/lens';
	import type { Provider } from '../Types/types';
	export let options = {
		headerData: [],
		claimedText: ''
	};

	let response: Provider[] = [];
	let expanded: boolean[] = new Array(1).fill(false);
	let dataPasser: LensDataPasser;
	let catalogueLink: string =
		'https://catalogue.eucaim.cancerimage.eu/menu/main/app-molgenis-app-biobank-explorer-eucaim/#/collection/';

	const toggleExpand = (index: string) => {
		expanded[index] = !expanded[index];
		const img: HTMLElement | null = document.getElementById(`expand-button-img-${index}`);
		if (!img) return;
		img.classList.toggle('expand-button-img-rotate');
	};

	window.addEventListener('lens-responses-updated', () => {
		response = Array.from(
			dataPasser?.getResponseAPI().values(),
			(x) => x.data.extension[0] as Provider
		);
	});

	/**
	 * watches the responseStore for changes to update the table
	 */

	/*
	const blacklist = ['id', 'studies_count', 'subjects_count'];
	providers.forEach((provider) => {
		provider.collections.forEach((collection) => {
			var resultArray = Object.keys(collection).map(function (index) {
				console.log(index)
				console.log(collection[index])
				if (!blacklist.includes(index)) return "";
			});
		})
	})*/
</script>

<table cellspacing="0" class="result-table">
	<thead class="table-header">
		<tr class="table-header-row">
			{#each options.headerData as header}
				<th class="table-header-cell table-header-datatype">
					{header.title}
				</th>
			{/each}
			<th class="expand-header"></th>
		</tr>
	</thead>
	<tbody class="table-body">
		{#each response as provider, index1}
			{#each provider.collections as tableRow, index2}
				<tr
					class="table-row"
					class:expanded-row="{expanded[index1.toString() + index2.toString()]}"
				>
					<td class="table-cell table-cell-name" style="width:30%">
						<a href="{catalogueLink}{tableRow.id}" target="_blank">{tableRow.name}</a>
					</td>
					<td class="table-cell" style="width:30%">
						{#if provider.provider_icon}
							<img
								src="data:image/png;base64, {provider.provider_icon}"
								alt=""
								class="provider-icon"
							/>
						{/if}
						{provider.provider}</td
					>
					<td class="table-cell" style="width:18%">{tableRow.studies_count}</td>
					<td class="table-cell" style="width:18%">{tableRow.subjects_count}</td>
					<td class="table-cell" style="width:4%">
						<button
							class="expand-button"
							on:click="{() => toggleExpand(index1.toString() + index2.toString())}"
							><img
								class="expand-button-img expand-button-img-rotate"
								id="expand-button-img-{index1.toString() + index2.toString()}"
								src="right-arrow-svgrepo-com.svg"
								alt="toggle additional information icon"
							/></button
						>
					</td>
				</tr>
				{#if expanded[index1.toString() + index2.toString()]}
					<tr class="table-row">
						<td class="table-cell-hidden" colspan="5">
							<div class="table-cell-hidden-data-wrapper">
								<table class="collection-table">
									<tr class="table-row">
										<td class="collection-name">Age range: </td><td
											class="collection-value"
											>{tableRow.age_range.min} to {tableRow.age_range.max}</td
										>
									</tr>
									<tr class="table-row">
										<td class="collection-name">Gender: </td><td class="collection-value"
											>{tableRow.gender.join(', ')}</td
										>
									</tr>
									<tr class="table-row">
										{#if tableRow.modality}
											<td class="collection-name">Modality: </td><td
												class="collection-value">{tableRow.modality.join(', ')}</td
											>
										{/if}
										{#if tableRow.modalities}
											<td class="collection-name">Modality: </td><td
												class="collection-value">{tableRow.modalities.join(', ')}</td
											>
										{/if}
									</tr>
									<tr class="table-row">
										<td class="collection-name">Body parts: </td><td
											class="collection-value">{tableRow.body_parts.join(', ')}</td
										>
									</tr>
									<tr class="table-row">
										<td class="collection-name">Description: </td><td
											class="collection-value">{tableRow.description}</td
										>
									</tr>
								</table>
							</div>
						</td>
					</tr>
				{/if}
			{/each}
		{/each}
	</tbody>
</table>
<lens-data-passer bind:this="{dataPasser}"></lens-data-passer>

<style>
	.table-cell,
	th {
		text-align: left;
		padding: 0.5em 0 0.5em 10px;
	}
	.table-cell-name a {
		color: var(--orange);
		text-decoration: none;
	}
	.table-cell-name a:hover {
		text-decoration: underline;
	}
	.table-cell-hidden {
		border-bottom: solid var(--gray) 1px;
	}
	.table-cell-hidden-data-wrapper {
		margin: 10px 0 20px 30px;
		padding: 0px 10px;
	}
	.expand-button {
		background-color: transparent;
		border: none;
		cursor: pointer;
	}
	.expand-button-img {
		width: 20px;
		height: 20px;
		rotate: -90deg;
		transition: all 0.3s;
	}
	.expand-button-img-rotate {
		rotate: 90deg;
	}
	.provider-icon {
		width: 16px;
		height: 16px;
	}
	.collection-table > tr > td {
		text-align: left;
		padding-top: 0.5em;
		padding-bottom: 0.5em;
	}
	.collection-name {
		width: 30%;
	}
	.expanded-row {
		font-weight: bold;
	}
</style>
