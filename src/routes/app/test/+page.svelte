<script lang="ts">
	import type { PageData } from './$types';
	export let data: PageData;
</script>

<div class="block h-full">
	<h1>HOME</h1>
	{#if data.upcomingRecipes}
		{#each data.upcomingRecipes as upcomingRecipe}
			<a href="/home/{upcomingRecipe.id}" class="w-full px-4 py-2 text-left text-sm font-medium">
				<h3 class="title" data-flip-id="title-{upcomingRecipe.id}">{upcomingRecipe.name}</h3></a
			>
		{/each}
		<br />
	{/if}

	{#if data.recentRecipes}
		{#each data.recentRecipes as recentRecipe}
			<a href="/home/{recentRecipe.id}" class="w-full px-4 py-2 text-left text-sm font-medium"
				><h3>{recentRecipe.name}</h3></a
			>
		{/each}
		<br />
	{/if}

	{#if data.popularRecipes}
		{#each data.popularRecipes as popularRecipe}
			<a href="/home/{popularRecipe.id}" class="w-full px-4 py-2 text-left text-sm font-medium"
				><h3>{popularRecipe.name}</h3></a
			>
		{/each}
	{/if}
</div>
