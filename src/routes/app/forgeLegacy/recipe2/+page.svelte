<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';

	export let data;
	const { form, errors, constraints, message, enhance } = superForm(data.form);
	onMount(() => {});
</script>

<form method="POST" use:enhance>
	{#each $page.data.initial as formPage, index}
		<section
			class="h-full w-full min-w-full snap-start snap-always {index !== 0 ? 'opacity-30' : ''}"
		>
			<h1>{formPage.title}</h1>
			<div class="w-full p-4">
				<input
					class="w-full rounded border bg-slate-800 focus:border-sky-500"
					type="text"
					placeholder="Give your recipe a title"
				/>
			</div>
			<span class="grid w-full grid-rows-2 items-center p-4">
				<label
					class="label scale-80 z-20 col-span-full col-start-1 row-start-1 cursor-text p-2 text-left opacity-0"
					for="input-31"
				>
					<span class="block">Frequency</span>
				</label>
				<input
					class="focus:gray-900 focus:border-1 z-10 col-span-full col-start-1 row-start-1 w-full rounded border-b-2 border-none bg-slate-800 p-2 focus:border-current focus:ring-0"
					type="text"
					id="input-31"
				/>
			</span>
		</section>
	{/each}
</form>

<style>
</style>
