<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import gsap from 'gsap';
	import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
	import type { ActionData } from './$types';

	if (typeof window !== 'undefined') {
		gsap.registerPlugin(ScrollTrigger);
	}

	ScrollTrigger.defaults({
		toggleActions: 'restart pause resume pause',
		scroller: '.container',
	});

	let sliderContainer: HTMLElement;
	let sliderProgressContainer: HTMLElement;

	let visibleChildIndex: number = 0;
	let frameId: number;

	/**
	 * Gets the index of the html visible of a list of child html elements
	 */
	const getVisibleChildIndex = () => {
		const sliderChildren = sliderContainer.children;
		const sliderBoundingBox = sliderContainer.getBoundingClientRect();
		const sliderCenter = sliderBoundingBox.left + sliderBoundingBox.width / 2;
		let visibleChildIndex = 0;
		let minDistance = Infinity;

		for (let i = 0; i < sliderChildren.length; i++) {
			const sliderChildBoundingBox = sliderChildren[i].getBoundingClientRect();
			const sliderChildCenter = sliderChildBoundingBox.left + sliderChildBoundingBox.width / 2;
			const distanceChildToCenter = Math.abs(sliderCenter - sliderChildCenter);
			if (distanceChildToCenter < minDistance) {
				minDistance = distanceChildToCenter;
				visibleChildIndex = i;
			}
		}
		return visibleChildIndex;
	};

	const handleScroll = () => {
		cancelAnimationFrame(frameId);
		frameId = requestAnimationFrame(() => {
			// Update the visibleChildIndex
			const prevVisibleChildIndex = visibleChildIndex;
			visibleChildIndex = getVisibleChildIndex();

			// Check if newActiveElement is greater than activeElement
			if (visibleChildIndex > prevVisibleChildIndex) {
				const currentSliderProgressBar = sliderProgressContainer.children[visibleChildIndex];
				currentSliderProgressBar.classList.add('bg-white');
				gsap.to(currentSliderProgressBar, {
					width: '100%',
					duration: 0.5,
				});
			} else if (visibleChildIndex < prevVisibleChildIndex) {
				// Revert the animation for the last item of the progress bar
				const currentSliderProgressBar = sliderProgressContainer.children[prevVisibleChildIndex];
				gsap
					.to(currentSliderProgressBar, {
						width: '0%',
						duration: 0.5,
					})
					.eventCallback('onComplete', () => currentSliderProgressBar.classList.remove('bg-white'));
			}
			if (visibleChildIndex !== prevVisibleChildIndex) {
				// Animate the opacity using GSAP
				const prevVisibleSliderChild = sliderContainer.children[prevVisibleChildIndex];
				const visibleSliderChild = sliderContainer.children[visibleChildIndex];
				gsap.to(prevVisibleSliderChild, { opacity: 0.3, duration: 0.5 });
				gsap.to(visibleSliderChild, { opacity: 1, duration: 0.5 });
			}
		});
	};

	onMount(() => {
		sliderContainer.addEventListener('scroll', handleScroll);
		visibleChildIndex = getVisibleChildIndex();
		return () => {
			sliderContainer.removeEventListener('scroll', handleScroll);
			cancelAnimationFrame(frameId);
		};
	});
</script>

<div class="flex h-full flex-col">
	<div
		bind:this={sliderProgressContainer}
		class="grid h-1 grid-cols-{$page.data.form.length} my-4 gap-1"
	>
		{#each $page.data.initial as _, index}
			<div class="col-start-{index + 1} {index === 0 ? 'bg-white' : 'w-0'}"></div>
		{/each}
	</div>
	<div
		class="flex h-full w-full snap-x snap-mandatory overflow-x-scroll"
		bind:this={sliderContainer}
	>
		<slot />
	</div>
</div>
