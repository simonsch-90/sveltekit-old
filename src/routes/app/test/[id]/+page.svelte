<script lang="ts">
	import { page } from '$app/stores';

	export let data;

	$: recipe = [...data.popularRecipes, ...data.recentRecipes, ...data.upcomingRecipes].find(
		(recipe) => recipe.id === $page.params.id
	);
</script>

{#if recipe}
	<div class="block h-full">
		<h1 class="title" data-flip-id="title-{recipe.id}">Recipe: {recipe.name}</h1>
		<pre>{JSON.stringify(recipe, null, 2)}</pre>
	</div>
{/if}
