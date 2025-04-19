<script lang="ts">
	import { browser } from '$app/environment';
	import {
		type Gradient,
		getToday,
		getWeek,
		setGradientColor,
		nextWeek,
		generateSeededRandomNumbers,
		mapArrayToDiagonalArray,
	} from '$lib/client';
	import dayjs from 'dayjs';
	import { onMount, tick } from 'svelte';
	import gsap from 'gsap';

	/**
	 * Seasonal gradient
	 * background: rgb(8,69,112);
background: linear-gradient(90deg, rgba(8,69,112,1) 0%, rgba(38,176,117,1) 8.33%, rgba(38,100,45,1) 16.66%, rgba(128,194,65,1) 25%, rgba(155,165,56,1) 33.33%, rgba(252,211,63,1) 41.66%, rgba(229,146,44,1) 50%, rgba(255,132,29,1) 58.33%, rgba(248,133,75,1) 66.66%, rgba(178,66,47,1) 75%, rgba(136,19,24,1) 83.33%, rgba(29,145,186,1) 91.66%, rgba(8,69,112,1) 100%);
	*/

	/**
 * background: rgb(16,105,136);
background: linear-gradient(90deg, rgba(16,105,136,1) 0%, rgba(128,194,65,1) 25%, rgba(255,132,29,1) 50%, rgba(136,19,24,1) 75%, rgba(16,105,136,1) 100%);
*/
	const gradient: Gradient = [
		{ percent: 0, color: '#109187' },
		{ percent: 25, color: '#80c241' },
		{ percent: 50, color: '#ff841d' },
		{ percent: 75, color: '#881318' },
		{ percent: 100, color: '#109187' },
	];
	const gridTiles = Array.from({ length: 14 }, (_, index) => index);
	const gridTileArray = mapArrayToDiagonalArray(
		[
			{ row: 1, col: 1, index: 0 },
			{ row: 1, col: 2, index: 1 },
			{ row: 1, col: 3, index: 2 },
			{ row: 2, col: 1, index: 3 },
			{ row: 2, col: 2, index: 4 },
			{ row: 2, col: 3, index: 5 },
			{ row: 2, col: 4, index: 6 },
			{ row: 3, col: 1, index: 7 },
			{ row: 3, col: 2, index: 8 },
			{ row: 3, col: 3, index: 9 },
			{ row: 3, col: 4, index: 10 },
			{ row: 4, col: 2, index: 11 },
			{ row: 4, col: 3, index: 12 },
			{ row: 4, col: 4, index: 13 },
		],
		4
	);
	console.log('gridTileArray', JSON.stringify(gridTileArray));
	const today = getToday();

	let gradientElement: HTMLElement;

	let thisWeek = getWeek(today);
	console.log('thisWeek', JSON.stringify(thisWeek.weekDays));
	let randomNumbers: number[];
	const updateTiles = () => {
		const seedString = `${thisWeek.weekDays[0].date}#${
			thisWeek.weekDays[thisWeek.weekDays.length - 1].date
		}`;
		randomNumbers = generateSeededRandomNumbers(seedString);
		console.log('randomNumbers', randomNumbers);

		// Reactivity for calendar tiles
		gridTiles.forEach((tileNumber) => {
			const calendarTile = document.getElementById(`calendar-tile-${tileNumber}`);
			const calendarTileBox = document.getElementById(`calendar-tile-box-${tileNumber}`);
			const calendarTileBorderVertical = document.getElementById(
				`calendar-tile-border-vertical-${tileNumber}`
			);
			const calendarTileBorderHorizontal = document.getElementById(
				`calendar-tile-border-horizontal-${tileNumber}`
			);
			if (
				calendarTile &&
				calendarTileBox &&
				calendarTileBorderVertical &&
				calendarTileBorderHorizontal
			) {
				const isNumberIncluded = randomNumbers.includes(tileNumber);
				if (isNumberIncluded) {
					calendarTileBox.classList.remove('hidden');
					calendarTileBorderVertical.classList.remove('hidden');
					calendarTileBorderHorizontal.classList.remove('hidden');
				} else {
					calendarTileBox.classList.add('hidden');
					calendarTileBorderVertical.classList.add('hidden');
					calendarTileBorderHorizontal.classList.add('hidden');
				}
			}
		});
	};
	// animation
	let tl: gsap.core.Timeline;

	const init = () => {
		if (document) {
			const lines = {
				vertical: Array.from(document.querySelectorAll('.border-vertical')).reverse(),
				horizontal: document.querySelectorAll('.border-horizontal'),
			};
			const cells = document.querySelectorAll('.calendar-tile');
			gsap.set(lines.horizontal, {
				scaleX: 0,
				transformOrigin: '0% 50%',
			});
			gsap.set(lines.vertical, {
				scaleY: 0,
				transformOrigin: '50% 0%',
			});
			gsap.set(cells, {
				scale: 0,
			});

			tl = gsap
				.timeline({
					paused: true,
					//onStart: () => picker.classList.remove('hidden'),
					//onReverseComplete: () => picker.classList.add('hidden'),
					defaults: {
						duration: 1.5,
						ease: 'power2.inOut',
					},
				})
				.addLabel('start', 'start')
				.to(
					cells,
					{
						duration: 2.8,
						ease: 'power4',
						scale: 1,
						stagger: { each: 0.08, grid: 'auto', from: 'random' },
					},
					'start'
				)
				.addLabel('lines', 'start+=0.2')
				.to(
					lines.horizontal,
					{
						scaleX: 1,
						stagger: { each: 0.02, grid: 'auto', from: 'random' },
						delay: parseFloat((Math.random() * 0.2).toFixed(2)),
					},
					'lines'
				)
				.to(
					lines.vertical,
					{
						scaleY: 1,
						stagger: { each: 0.02, grid: 'auto', from: 'random' },
						delay: parseFloat((Math.random() * 0.2).toFixed(2)),
					},
					'lines'
				);

			tl.timeScale(1.5).play();
		}
	};

	const setTileWrapperSize = () => {
		const calendarTiles = document.querySelectorAll('.calendar-tile');

		calendarTiles.forEach((calendarTile) => {
			if (calendarTile) {
				const calendarTileBox = calendarTile.querySelectorAll('.calendar-tile-box')[0];
				if (calendarTileBox) {
					const { width, height } = calendarTile.getBoundingClientRect();
					if (width > 0 && height > 0) {
						calendarTileBox.style.width = `${width}px`;
						calendarTileBox.style.height = `${height}px`;
					}
				}
			}
		});
	};

	onMount(async () => {
		setGradientColor(thisWeek.calendarWeek, 0, dayjs().isoWeeksInYear(), gradient, gradientElement);
		// Use tick to wait for the DOM to update
		await tick();
		updateTiles();
		setTileWrapperSize();
		init();
	});

	$: if (thisWeek != null && gradientElement) {
		setGradientColor(thisWeek.calendarWeek, 0, dayjs().isoWeeksInYear(), gradient, gradientElement);
		updateTiles();
		setTileWrapperSize();
		init();
	}
</script>

<div class="flex h-full flex-col">
	<div class=" text-white">
		<button
			on:click={() => {
				if (tl)
					tl.call(
						() => {
							thisWeek = nextWeek(thisWeek);
						},
						undefined,
						0
					)
						.timeScale(3)
						.reverse();
			}}>TEST</button
		>
		<h1 class="mb-4 rounded-md p-4 text-2xl font-bold">
			Calendar week: {thisWeek.calendarWeek}
		</h1>
	</div>

	<!-- Main Content -->
	<div class="flex-1">
		<div
			bind:this={gradientElement}
			class="flex h-full w-full items-center justify-center overflow-clip"
		>
			{#if randomNumbers}
				<div
					class="grid aspect-square h-fit w-full rotate-45 grid-cols-4 grid-rows-4 gap-2 p-4 md:p-16"
				>
					{#each gridTileArray as gridTile}
						{#if randomNumbers.indexOf(gridTile.index) !== -1}
							<div
								id="calendar-tile-{gridTile.index}"
								class="calendar-tile z-10 grid aspect-square grid-cols-1 grid-rows-1 overflow-clip rounded col-start-{gridTile.col} row-start-{gridTile.row}"
							>
								<div
									id="calendar-tile-box-{gridTile.index}"
									class="calendar-tile-box z-1 absolute grid -rotate-45 grid-cols-1 grid-rows-1 place-items-center items-center self-center justify-self-center"
								>
									{randomNumbers.indexOf(gridTile.index)}

									<div
										class="z-10 col-start-1 row-start-1 flex h-full w-full items-center justify-center bg-slate-500 text-center"
									>
										{dayjs(thisWeek.weekDays[randomNumbers.indexOf(gridTile.index)]?.date).format(
											'dd'
										)}
										{dayjs(thisWeek.weekDays[randomNumbers.indexOf(gridTile.index)]?.date).format(
											'DD/MM/YYYY'
										)}
									</div>
								</div>
								<div
									id="calendar-tile-border-vertical-{gridTile.index}"
									class="border-vertical z-20 col-start-1 row-start-1 aspect-square rounded border-x-2 border-solid border-white"
								></div>
								<div
									id="calendar-tile-border-horizontal-{gridTile.index}"
									class="border-horizontal z-20 col-start-1 row-start-1 aspect-square rounded border-y-2 border-solid border-white"
								></div>
							</div>
						{/if}
					{/each}
				</div>
			{/if}
		</div>
	</div>
</div>

<style>
</style>
