<script lang="ts">
	import { onMount, type ComponentType } from 'svelte';
	import gsap from 'gsap';
	import GlassCard from '../card/glassCard.svelte';

	export let classNames: string = '';
	export let components: ComponentType[] = [];

	let activeStep = 0;
	let isAnimating = false;
	let tl: gsap.core.Timeline;

	// when activeStep changes, we recompute indexRange
	$: activeStep && console.log('activeStep', activeStep);

	const animateSteps = (direction: 'up' | 'down') => {
		const prev = document.querySelector(`[data-step-id="${activeStep - 1}"]`);
		const active = document.querySelector(`[data-step-id="${activeStep}"]`);
		const next = document.querySelector(`[data-step-id="${activeStep + 1}"]`);
		if (active) {
			isAnimating = true;
			if (next && direction === 'up' && activeStep < components.length) {
				activeStep = activeStep + 1;
			}
			if (prev && direction === 'down' && activeStep > 0) {
				activeStep = activeStep - 1;
			}
			isAnimating = false;
		}
	};

	onMount(() => {
		let yDown: number | null = null;
		let yUp: number | null = null;
		tl = gsap.timeline();
		const handleTouchStart = (event: TouchEvent) => (yDown = event.touches[0].clientY);
		const handleTouchMove = (event: TouchEvent) => {
			yUp = event.touches[0].clientY;
			if (!yDown || !yUp || isAnimating === true) return;
			const yDiff = yDown - yUp;
			console.log(yDiff);
			if (yDiff > 0.5) {
				animateSteps('up'); // Swiped up (show next step)
			} else {
				animateSteps('down'); // Swiped down (show previous step)
			}
			yDown = null;
		};
		// Detect swipe gestures
		document.addEventListener('touchstart', handleTouchStart, false);
		document.addEventListener('touchmove', handleTouchMove, false);
	});
</script>

<div class="grid h-full w-full grid-cols-1 {classNames}">
	{#each components as component, index}
		<div
			data-step-id={index}
			class="p col-start-1 row-start-1 h-full w-full self-center justify-self-center overflow-hidden p-2 {index !==
			activeStep
				? 'hidden'
				: ''}"
		>
			<GlassCard classNames="h-full w-full">
				<svelte:component this={component} />
			</GlassCard>
		</div>
	{/each}
</div>
