<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import FormPage from '$lib/components/forge/recipe/formPage.svelte';
	import { page } from '$app/stores';
	import type { ActionData } from './$types';
	import { enhance } from '$app/forms';
	import type { SubmitFunction } from '@sveltejs/kit';
	import { Secondary } from 'flowbite-svelte';
	if (typeof window !== 'undefined') {
		gsap.registerPlugin(ScrollTrigger);
	}

	ScrollTrigger.defaults({
		toggleActions: 'restart pause resume pause',
		scroller: '.container',
	});

	let container: HTMLElement;
	let progress: HTMLElement;

	let activeElement: number;
	let rafId: number;

	export let form: ActionData;

	function getActiveElement() {
		const elements = container.children;
		const containerRect = container.getBoundingClientRect();
		const containerCenter = containerRect.top + containerRect.height / 2;

		let closestElement = 0;
		let minDistance = Infinity;

		for (let i = 0; i < elements.length; i++) {
			const elementRect = elements[i].getBoundingClientRect();
			const elementCenter = elementRect.top + elementRect.height / 2;

			const distance = Math.abs(containerCenter - elementCenter);

			if (distance < minDistance) {
				minDistance = distance;
				closestElement = i;
			}
		}

		return closestElement;
	}
	function handleScroll() {
		cancelAnimationFrame(rafId);
		rafId = requestAnimationFrame(() => {
			// Update the activeElement store
			const newActiveElement = getActiveElement();

			if (newActiveElement && activeElement) {
				// Check if newActiveElement is greater than activeElement
				if (newActiveElement > activeElement) {
					// Animate the progress bar to fill in from the left with white color
					const element = progress.children[newActiveElement - 1];
					element.classList.add('bg-white');
					gsap.to(element, {
						width: '100%',
						duration: 0.5,
					});
				} else if (newActiveElement < activeElement) {
					// Revert the animation for the last item of the progress bar
					const element = progress.children[activeElement - 1];
					gsap
						.to(element, {
							width: '0%',
							duration: 0.5,
						})
						.eventCallback('onComplete', () => element.classList.remove('bg-white'));
				}
				if (newActiveElement !== activeElement) {
					// Animate the opacity using GSAP
					const oldActiveElement = container.children[activeElement];
					const oldNewActiveElement = container.children[newActiveElement];

					gsap.to(oldActiveElement, { opacity: 0.3, duration: 0.5 });
					gsap.to(oldNewActiveElement, { opacity: 1, duration: 0.5 });
					activeElement = newActiveElement;
				}
			}
		});
	}

	onMount(() => {
		container.addEventListener('scroll', handleScroll);
		activeElement = getActiveElement();

		return () => {
			container.removeEventListener('scroll', handleScroll);
			cancelAnimationFrame(rafId);
		};
	});
	/**
	 * onMount(() => {
  const ctx = gsap.context(() => {
    ScrollTrigger.create({
      trigger: '.content',
      start: 'top top',
      end: '+=100%',
      pin: true,
      markers: true
    });
  });

  return () => ctx.revert();
})
	*/
	let loading = false;
	const createRecipe: SubmitFunction = () => {
		// Do something before form submit
		loading = true;
		return async ({ update }) => {
			// Do something after form submit
			loading = false;
			await update();
		};
	};
</script>

<pre>
	{JSON.stringify(form, null, 2)}
</pre>

<div class="flex h-full flex-col">
	<div bind:this={progress} class="grid h-1 grid-cols-{$page.data.form.length} gap-1">
		{#each $page.data.form as formPage, index}
			<div class="col-start-{index + 1} {index === 0 ? 'bg-white' : 'w-0'}"></div>
		{/each}
	</div>
	<h1 class="w-full p-8">Add your new recipe</h1>
	<!-- Carousel wrapper -->
	<form method="POST" action="?/createRecipe" use:enhance={createRecipe}>
		<div
			bind:this={container}
			class="container flex h-full w-full snap-y snap-mandatory flex-col overflow-y-scroll"
		>
			<!-- Item 0 -->
			<div class="h-1/3 w-full shrink-0"></div>
			{#each $page.data.form as data, index}
				<FormPage {data} class="{index !== 0 ? 'opacity-30' : ''} " />
			{/each}

			<!-- Item 6 -->
			<div class="h-1/3 w-full shrink-0">
				Loading
				<button aria-busy={loading} class:secondary={loading} type="submit">Submit</button>
			</div>
		</div>
	</form>
</div>

<!--
<h1>Create your own recipe</h1>

<h2>Title:</h2>
<h2>Description:</h2>
<div class="divide-white-200 h-12 w-full divide-y-4 divide-dashed"></div>

<h2>Complexity:</h2>
<h2>External links:</h2>
<h2>Add cusine:</h2>
<h2>Add categories:</h2>
<h2>Add a thumbnail:</h2>

<h1>Add the ingredients needed for this dish:</h1>

<h1>Add the tools needed (optional):</h1>

<h1>Describe all the steps:</h1>
<h2>Time</h2>


		<div class="bg-green-700"></div>
	<div class="h-16 self-end bg-red-600"></div>
	
	<div
		class="flex h-full w-full grow flex-col content-normal items-stretch justify-between bg-slate-500"
	>
		<div class="block h-12 w-full bg-slate-900"></div>
		<div class="block w-full grow bg-red-300"></div>
	</div>
	<div class="block h-12 w-full bg-slate-900"></div>
-->

<style>
</style>
