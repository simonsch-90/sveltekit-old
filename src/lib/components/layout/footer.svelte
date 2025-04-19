<script lang="ts">
	import { CalendarPlusSolid, HomeSolid, ReceiptSolid, SearchSolid } from 'flowbite-svelte-icons';
	import GlassCard from '../card/glassCard.svelte';
	export let classNames = '';
	export let zIndex = 100;
	export let footerMode: 'empty' | 'default' = 'default';
</script>

<div class="mb-4 h-12 w-full flex-shrink-0 justify-center overflow-hidden rounded-sm px-4">
	<GlassCard classNames="h-full w-full">
		<div
			class="absolute grid h-full w-full grid-flow-col grid-cols-4 gap-2 {classNames}"
			style="z-index: {zIndex}"
		>
			{#if footerMode === 'default'}
				<div>
					<a class="flex h-full items-center justify-center" href="/app/home">
						<HomeSolid class="aspect-square h-full outline-none" />
					</a>
				</div>
				<div>
					<a class="flex h-full items-center justify-center" href="/app/search"
						><SearchSolid class="aspect-square h-full outline-none" /></a
					>
				</div>
				<div>
					<a class="flex h-full items-center justify-center" href="/app/recipes"
						><ReceiptSolid class="aspect-square h-full outline-none" /></a
					>
				</div>
				<div>
					<a class="flex h-full items-center justify-center" href="/app/plan"
						><CalendarPlusSolid class="aspect-square h-full outline-none" /></a
					>
				</div>
			{/if}
		</div>
	</GlassCard>
</div>
