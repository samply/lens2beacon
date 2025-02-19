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

	window.addEventListener('lens-responses-updated', () => {
		console.warn(
			'addEventListener: lens-responses-updated, getResponseAPI may not be a known function'
		);
		response = Array.from(
			dataPasser?.getResponseAPI().values(),
			(x) => x.data.extension[0] as Provider
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
<!--
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
-->
	<tbody class="table-body">
	{#each response as provider, index1}
		<tr
				class="table-row"
				class:expanded-row="{expanded[index1.toString()]}"
		>
			<td class="table-cell" style="width:30%">{provider.name}</td>
			<td class="table-cell" style="width:18%">{provider.studies_count}</td>
			<td class="table-cell" style="width:18%">{provider.subjects_count}</td>
		</tr>
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
	.expanded-row {
		font-weight: bold;
	}
</style>
