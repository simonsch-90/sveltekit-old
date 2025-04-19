<script lang="ts">
	import { onMount } from 'svelte';
	import gsap from 'gsap';

	export let classNames: string = '';
	const visibleSteps = 3;
	const totalSteps = 5;

	let activeStep = 0;
	let yDown: number | null = null;
	let isAnimating = false;
	let indexRange: number[] = [];
	let tl: gsap.core.Timeline;

	const updateIndexRange = () => {
		if (visibleSteps < 3) {
			throw new Error('Range must be at least 3');
		}

		let result = [];
		let halfRange = Math.floor(visibleSteps / 2);
		let start, end;

		if (activeStep < halfRange) {
			// If the index is less than half of the range
			start = 0;
			end = Math.min(visibleSteps, totalSteps);
		} else if (activeStep >= totalSteps - halfRange) {
			// If the index is close to the end of the total range
			start = Math.max(totalSteps - visibleSteps, 0);
			end = totalSteps;
		} else {
			if (visibleSteps % 2 === 0) {
				// If the range is even
				start = activeStep - halfRange;
				end = activeStep + halfRange;
			} else {
				// If the range is odd
				start = activeStep - halfRange;
				end = activeStep + halfRange + 1;
			}
		}

		for (let i = start; i < end; i++) {
			result.push(i);
		}

		indexRange = result;
		console.log('indexRange', indexRange);
	};
	// when activeStep changes, we recompute indexRange
	$: activeStep && updateIndexRange();
	$: activeStep && console.log('activeStep', activeStep);

	const handleTouchStart = (event: TouchEvent) => (yDown = event.touches[0].clientY);
	const handleTouchMove = (event: TouchEvent) => {
		let yUp = event.touches[0].clientY;
		if (!yDown || !yUp) return;

		let yDiff = yDown - yUp;
		if (isAnimating === false) {
			isAnimating = true;
			let nextStep = 0;
			if (yDiff > 0) {
				// Swiped up (show next step)
				console.log('Swiped up');

				nextStep = activeStep + 1;
			} else {
				// Swiped down (show previous step)
				nextStep = activeStep - 1;
			}
			if (nextStep >= 0 && nextStep < totalSteps) {
				console.log('activeStep', activeStep);
				console.log('nextStep', nextStep);
				const pre = document.querySelector(`.pre-step-${activeStep}`);
				const post = document.querySelector(`.post-step-${activeStep}`);

				const preNext = document.querySelector(`.pre-step-${nextStep}`);
				const postNext = document.querySelector(`.post-step-${nextStep}`);

				if (yDiff > 0) {
					// Swiping up (next step)
					if (post && preNext) {
						tl.to(post, { height: '100%', duration: 0.5 })
							.to(preNext, { height: '100%', duration: 0.5 })
							.eventCallback('onComplete', () => {
								activeStep = nextStep;
								isAnimating = false;
							});
					} else {
						isAnimating = false; // Reset in case elements are not found
					}
				} else if (yDiff < 0) {
					// Swiping down (previous step)
					if (pre && postNext) {
						tl.to(pre, { height: '0%', duration: 0.5 })
							.to(postNext, { height: '0%', duration: 0.5 })
							.eventCallback('onComplete', () => {
								activeStep = nextStep;
								isAnimating = false;
							});
					} else {
						isAnimating = false; // Reset in case elements are not found
					}
				}
			}

			isAnimating = false;

			yDown = null;
		}
	};

	onMount(() => {
		tl = gsap.timeline({
			defaults: {
				ease: 'power2.inOut',
			},
		});
		updateIndexRange();
		// Detect swipe gestures
		document.addEventListener('touchstart', handleTouchStart, false);
		document.addEventListener('touchmove', handleTouchMove, false);
	});
</script>

<div class="absolute left-0 top-0 grid h-full w-8 grid-rows-{visibleSteps} grid-rows-1 pl-2">
	{#each indexRange as index, i}
		<div class="step-container relative row-start-{i + 1} col-span-1 row-span-1">
			<div class="absolute flex h-full w-full flex-col place-items-center">
				<!-- Pre step rendering -->
				<div class="relative w-1 flex-auto bg-transparent">
					{#if activeStep >= 0}
						<div class="absolute pre-step-{index} h-0 w-1 flex-auto bg-slate-200"></div>
						{#if index > 0}
							<div
								class="absolute h-full w-1 flex-auto bg-slate-200 bg-opacity-25 backdrop-blur"
							></div>
						{/if}
					{/if}
				</div>

				<!--Step indicator rendering -->
				{#if index === activeStep}
					<div
						class="step-{index} aspect-square w-full rounded-full border-2 border-slate-200 bg-slate-200 bg-opacity-25 p-1 backdrop-blur"
						data-step-id={index}
					>
						<div class="aspect-square w-full rounded-full bg-slate-200"></div>
					</div>
				{:else if index < activeStep}
					<div class="step-{index} aspect-square w-full rounded-full bg-slate-200"></div>
				{:else}
					<div
						class="step-{index} aspect-square w-full rounded-full bg-slate-200 opacity-25 backdrop-blur"
					></div>
				{/if}

				<!-- Post step rendering -->
				<div class="relative w-1 flex-auto bg-transparent">
					{#if activeStep < totalSteps}
						<div class="absolute post-step-{index} h-0 w-1 flex-auto bg-slate-200"></div>
						{#if activeStep < totalSteps - 1}
							<div
								class="absolute h-full w-1 flex-auto bg-slate-200 bg-opacity-25 backdrop-blur"
							></div>
						{/if}
					{/if}
				</div>
			</div>

			<div></div>
		</div>
	{/each}
</div>
