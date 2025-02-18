<script lang="ts">
	import type { LensDataPasser } from '@samply/lens';
	import type { Site } from '../Types/types';
	export let options = {
		headerData: [],
		claimedText: ''
	};

	let response: Site[] = [];
	let expanded: boolean[] = new Array(1).fill(false);
	let dataPasser: LensDataPasser;

	const toggleExpand = (index: string) => {
		expanded[index] = !expanded[index];
		const img: HTMLElement | null = document.getElementById(`expand-button-img-${index}`);
		if (!img) return;
		img.classList.toggle('expand-button-img-rotate');
	};

	window.addEventListener('lens-responses-updated', () => {
		console.warn("addEventListener: lens-responses-updated, getResponseAPI may not be a known function");
		response = Array.from(
			dataPasser?.getResponseAPI().values(),
			(x) => x.data.extension[0] as Site
		);
	});
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
					<td class="table-cell" style="width:30%">{tableRow.name}</td>
					<td class="table-cell" style="width:30%">{provider.provider}</td>
					<td class="table-cell" style="width:18%">{tableRow.studies_count}</td>
					<td class="table-cell" style="width:18%">{tableRow.subjects_count}</td>
				</tr>
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
	.collection-table > tr > td {
		text-align: left;
		padding-top: 0.5em;
		padding-bottom: 0.5em;
	}
	.expanded-row {
		font-weight: bold;
	}
</style>
