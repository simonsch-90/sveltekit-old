<script lang="ts">
	import { recipeListAnchor } from '$lib/stores/recipeListAnchor';
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { browser } from '$app/environment';

	export let data;

	$: recipesCol1 = data.recipes?.filter((r: { id: string }) => parseInt(r.id) % 2 === 0);
	$: recipesCol2 = data.recipes?.filter((r: { id: string }) => parseInt(r.id) % 2 === 1);
	$: scrollIntoView($recipeListAnchor);

	console.log($page.url.searchParams.get('filter'));

	const scrollIntoView = (recipeId: string) => {
		if (browser) {
			const el = document.querySelector(`[data-recipe-id="${recipeId}"]`);
			if (!el) return;
			el.scrollIntoView();
		}
	};

	const openFeed = (event: any) => {
		recipeListAnchor.udpate(event.target.getAttribute('data-recipe-id'));
		goto(`/recipes/feed`);
	};

	onMount(() => {
		scrollIntoView($recipeListAnchor);
	});
</script>

<div class="grid w-full items-center">
	<div class="columns relative grid w-full grid-flow-col items-center gap-2 p-2">
		{#if data.recipes}
			<div class="column relative grid w-full gap-2">
				{#each recipesCol1 as recipeCol1}
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<figure
						data-recipe-id={recipeCol1.id}
						class="column-item relative aspect-[9/16] h-auto w-full overflow-hidden rounded-lg bg-white"
						on:click={openFeed}
					>
						<div class="column-image-imgwrap relative">
							<div class="column-image bg-black"></div>
						</div>
					</figure>
				{/each}
			</div>
			<!-- /column -->
			<div class="column relative grid w-full gap-2">
				{#each recipesCol2 as recipeCol2}
					<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
					<!-- svelte-ignore a11y-click-events-have-key-events -->
					<figure
						data-recipe-id={recipeCol2.id}
						class="column-item relative aspect-[9/16] h-auto w-full overflow-hidden rounded-lg bg-white"
						on:click={openFeed}
					>
						<div class="column-image-imgwrap relative">
							<div class="column-image bg-black"></div>
						</div>
					</figure>
				{/each}
			</div>
			<!-- /column -->
		{/if}
	</div>
</div>

<style>
</style>
