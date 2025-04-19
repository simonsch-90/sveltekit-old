<script lang="ts">
	import { scale } from 'svelte/transition';
	import DropdownItem from './dropdownItem.svelte';
	export let items: { name: string; href: string }[];
	export let visible: boolean = true;
</script>

{#if visible}
	<div
		transition:scale={{ delay: 250, duration: 300 }}
		role="tooltip"
		tabindex="-1"
		class="divide-y divide-gray-600 rounded-lg border-gray-600 bg-gray-700 shadow-md"
	>
		<div class="overflow-hidden py-1">
			<slot name="header" />
		</div>
		<ul class="py-1">
			{#each items as item}
				<DropdownItem name={item.name} href={item.href}></DropdownItem>
			{/each}
		</ul>
		<div class="overflow-hidden py-1">
			<slot name="footer" />
		</div>
	</div>
{/if}
