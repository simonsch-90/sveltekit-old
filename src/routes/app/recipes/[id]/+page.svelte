<script>
	import { onMount } from 'svelte';
	import gsap from 'gsap';
	import { ChevronRightSolid } from 'flowbite-svelte-icons';

	let isAnimating = false;
	let page = 0;
	let activePage = 0; // Initial active page

	const paths = {
		step1: {
			unfilled: 'M 0 100 V 100 Q 50 100 100 100 V 100 z',
			inBetween: {
				curve1: 'M 0 100 V 50 Q 50 0 100 50 V 100 z',
				curve2: 'M 0 100 V 50 Q 50 100 100 50 V 100 z',
			},
			filled: 'M 0 100 V 0 Q 50 0 100 0 V 100 z',
		},
		step2: {
			filled: 'M 0 0 V 100 Q 50 100 100 100 V 0 z',
			inBetween: {
				curve1: 'M 0 0 V 50 Q 50 0 100 50 V 0 z',
				curve2: 'M 0 0 V 50 Q 50 100 100 50 V 0 z',
			},
			unfilled: 'M 0 0 V 0 Q 50 0 100 0 V 0 z',
		},
	};

	let overlayPath = {
		current: null,
	};

	onMount(() => {
		overlayPath.current = document.querySelector('.overlay__path');

		// Detect swipe gestures
		document.addEventListener('touchstart', handleTouchStart, false);
		document.addEventListener('touchmove', handleTouchMove, false);

		let xDown = null;
		let yDown = null;

		function handleTouchStart(evt) {
			xDown = evt.touches[0].clientX;
			yDown = evt.touches[0].clientY;
		}

		function handleTouchMove(evt) {
			if (!xDown || !yDown) {
				return;
			}

			let xUp = evt.touches[0].clientX;
			let yUp = evt.touches[0].clientY;

			let xDiff = xDown - xUp;
			let yDiff = yDown - yUp;

			if (Math.abs(xDiff) > Math.abs(yDiff)) {
				// Horizontal swipe, you can add logic here if needed
			} else {
				// Vertical swipe
				if (yDiff > 0) {
					reveal();
				} else {
					unreveal();
				}
			}

			xDown = null;
			yDown = null;
		}
	});

	const reveal = () => {
		if (isAnimating) return;
		isAnimating = true;
		page += 1;

		gsap
			.timeline({
				onComplete: () => (isAnimating = false),
			})
			.set(overlayPath.current, {
				attr: { d: paths.step1.unfilled },
			})
			.to(
				overlayPath.current,
				{
					duration: 0.8,
					ease: 'power4.in',
					attr: { d: paths.step1.inBetween.curve1 },
				},
				0
			)
			.to(overlayPath.current, {
				duration: 0.2,
				ease: 'power1',
				attr: { d: paths.step1.filled },
				onComplete: () => switchPages(),
			})
			.set(overlayPath.current, {
				attr: { d: paths.step2.filled },
			})
			.to(overlayPath.current, {
				duration: 0.2,
				ease: 'sine.in',
				attr: { d: paths.step2.inBetween.curve1 },
			})
			.to(overlayPath.current, {
				duration: 1,
				ease: 'power4',
				attr: { d: paths.step2.unfilled },
			});
	};

	const switchPages = () => {
		const pageToHide = document.querySelector(`[data-id="${activePage}"]`);
		const pageToShow = document.querySelector(`[data-id="${page}"]`);
		if (pageToHide && pageToShow) {
			pageToHide?.classList.add('hidden');
			pageToShow?.classList.remove('hidden');
			activePage = page;
		}
	};

	const unreveal = () => {
		if (isAnimating || page === 0) return;
		isAnimating = true;
		page = page -= 1;

		gsap
			.timeline({
				onComplete: () => (isAnimating = false),
			})
			.set(overlayPath.current, {
				attr: { d: paths.step2.unfilled },
			})
			.to(
				overlayPath.current,
				{
					duration: 0.8,
					ease: 'power4.in',
					attr: { d: paths.step2.inBetween.curve2 },
				},
				0
			)
			.to(overlayPath.current, {
				duration: 0.2,
				ease: 'power1',
				attr: { d: paths.step2.filled },
				onComplete: () => switchPages(),
			})
			.set(overlayPath.current, {
				attr: { d: paths.step1.filled },
			})
			.to(overlayPath.current, {
				duration: 0.2,
				ease: 'sine.in',
				attr: { d: paths.step1.inBetween.curve2 },
			})
			.to(overlayPath.current, {
				duration: 1,
				ease: 'power4',
				attr: { d: paths.step1.unfilled },
			});
	};
</script>

<div class="frame grid h-full w-full">
	<svg
		class="overlay z-50 col-span-full row-span-full grid h-full min-h-0 w-full fill-gray-900"
		bind:this={overlayPath}
		width="100%"
		height="100%"
		viewBox="0 0 100 100"
		preserveAspectRatio="none"
	>
		<path
			class="overlay__path"
			vector-effect="non-scaling-stroke"
			d="M 0 100 V 100 Q 50 100 100 100 V 100 z"
		/>
	</svg>
	<div class="col-span-full row-span-full grid h-full min-h-0 grid-rows-1 overflow-auto">
		<div data-id="0" class="col-span-full row-span-full grid h-full p-2">
			<div class="col-span-full row-span-full grid h-full min-h-0">
				<img
					alt=""
					src="/images/food1 (2).jpg"
					class="col-span-full row-span-full h-full rounded-lg object-cover shadow-lg shadow-black"
				/>
				<div
					class="z-10 col-span-full row-span-full h-full rounded-lg bg-gradient-to-t from-black from-15% to-transparent to-40% opacity-80"
				></div>
			</div>
			<div
				class="z-40 col-span-full row-span-full grid min-h-0 grid-flow-row grid-cols-4 grid-rows-4"
			>
				<div class="col-start-4 row-span-2 row-start-2 grid min-h-0 grid-flow-row grid-rows-3">
					<div class="row-start-2 flex justify-end">
						<ChevronRightSolid class="h-16 w-16 drop-shadow-lg" />
					</div>
				</div>
				<div class="col-span-full col-start-1 row-start-4 grid min-h-0 grid-rows-4">
					<div class="row-start-1 flex place-items-center">
						<h1>Fried Chicken Tenders</h1>
					</div>
					<span
						class="row-span-2 row-start-2 inline-block max-h-16 overflow-hidden text-ellipsis text-pretty"
					>
						Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
						invidunt ut labore et dolore magna aliquyam erat,liquyam erat,liquyam erat,
					</span>
					<div class="row-start-4 flex max-h-16 min-h-0 pb-4">
						<button class="h-16 w-16 self-center" type="button">
							<img alt="" src="/images/cat.jpeg" class="h-12 w-12 rounded-full object-cover" />
						</button>
					</div>
				</div>
			</div>
		</div>
		<div data-id="1" class="col-span-full row-span-full grid hidden h-full p-2">
			<div class="col-span-full row-span-full grid h-full min-h-0">
				<img
					alt=""
					src="/images/food1 (3).jpg"
					class="col-span-full row-span-full h-full rounded-lg object-cover shadow-lg shadow-black"
				/>
				<div
					class="z-10 col-span-full row-span-full h-full rounded-lg bg-gradient-to-t from-black from-15% to-transparent to-40% opacity-80"
				></div>
			</div>
			<div
				class="z-40 col-span-full row-span-full grid min-h-0 grid-flow-row grid-cols-4 grid-rows-4"
			>
				<div class="col-start-4 row-span-2 row-start-2 grid min-h-0 grid-flow-row grid-rows-3">
					<div class="row-start-2 flex justify-end">
						<ChevronRightSolid class="h-16 w-16 drop-shadow-lg" />
					</div>
				</div>
				<div class="col-span-full col-start-1 row-start-4 grid min-h-0 grid-rows-4">
					<div class="row-start-1 flex place-items-center">
						<h1>Fried Chicken Tenders</h1>
					</div>
					<span
						class="row-span-2 row-start-2 inline-block max-h-16 overflow-hidden text-ellipsis text-pretty"
					>
						Lorem ipsum dolor sit amet, consetetur sadipscing elitr, sed diam nonumy eirmod tempor
						invidunt ut labore et dolore magna aliquyam erat,liquyam erat,liquyam erat,
					</span>
					<div class="row-start-4 flex max-h-16 min-h-0 pb-4">
						<button class="h-16 w-16 self-center" type="button">
							<img alt="" src="/images/cat.jpeg" class="h-12 w-12 rounded-full object-cover" />
						</button>
					</div>
				</div>
			</div>
		</div>
	</div>
</div>
