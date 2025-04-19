<script lang="ts">
	import Upload from '$lib/components/dialog/image/upload.svelte';
	import gsap from 'gsap';
	import { onMount } from 'svelte';
	import BorderCard from '$lib/components/card/borderCard.svelte';
	import ImageUpload from '$lib/components/image/imageUpload.svelte';
	import { ImageSolid, FileImageSolid } from 'flowbite-svelte-icons';
	import Text from '$lib/components/text/text.svelte';
	export let done: boolean = false;
	export let base64Images: string[] = [];

	let base64FinalImages: string | any[] = [];
	$: if (base64Images.length > 0)
		base64FinalImages = base64Images.map((base64Image) => ({
			base64Image,
			crop: { x: 0, y: 0 },
			zoom: 1,
		}));

	let activeIndex = 0;
	let thumbnailIndex = 0;
	let isAnimating = false;
	let dialogVisible: boolean = false;

	const getIndexOffset = (index: number, offset: number) =>
		index + offset >= 0
			? (index + offset) % base64FinalImages.length
			: (base64FinalImages.length + offset + index) % base64FinalImages.length;

	const animateImages = (direction: 'left' | 'right') => {
		const prev = document.querySelector(
			`[data-recipe-image-upload-id="${getIndexOffset(activeIndex, -1)}"]`
		);
		const active = document.querySelector(`[data-recipe-image-upload-id="${activeIndex}"]`);
		const next = document.querySelector(
			`[data-recipe-image-upload-id="${getIndexOffset(activeIndex, 1)}"]`
		);

		const tl = gsap.timeline({
			defaults: {
				ease: 'power2.inOut',
			},
		});
		if (prev && active && next) {
			isAnimating = true;
			if (direction === 'left') {
				tl.to(
					active,
					{ x: '-100%', scale: 0.75, duration: 0.5, opacity: 0.5, ease: 'power4.in' },
					0
				)
					.to(prev, { x: '-200%', scale: 0.75, duration: 0.5, opacity: 0.5, ease: 'power4.in' }, 0)
					.to(next, { x: '0%', scale: 1, duration: 0.5, opacity: 1, ease: 'power4.in' }, 0)
					.call(() => {
						activeIndex = activeIndex === base64FinalImages.length - 1 ? 0 : activeIndex + 1;
						isAnimating = false;
					});
			} else {
				tl.to(active, { x: '100%', scale: 0.75, duration: 0.5, opacity: 0.5, ease: 'power4.in' }, 0)
					.to(next, { x: '200%', scale: 0.75, duration: 0.5, opacity: 0.5, ease: 'power4.in' }, 0)
					.to(prev, { x: '0%', scale: 1, duration: 0.5, opacity: 1, ease: 'power4.in' }, 0)
					.call(() => {
						activeIndex = activeIndex === 0 ? base64FinalImages.length - 1 : activeIndex - 1;
						isAnimating = false;
					});
			}
		}
	};

	onMount(() => {
		let xDown: number | null = null;
		const handleTouchStart = (event: TouchEvent) => (xDown = event.touches[0].clientX);
		const handleTouchMove = (event: TouchEvent) => {
			let xUp = event.touches[0].clientX;
			if (!xDown || !xUp) return;

			let xDiff = xDown - xUp;
			if (isAnimating === false && dialogVisible === false) {
				if (xDiff > 0) {
					// Swiped left (show next image)
					animateImages('left');
				} else {
					// Swiped right (show previous image)
					animateImages('right');
				}
				xDown = null;
			}
		};
		// Detect swipe gestures
		document.addEventListener('touchstart', handleTouchStart, false);
		document.addEventListener('touchmove', handleTouchMove, false);
	});
</script>

{#if dialogVisible}
	<Upload
		base64Image={base64Images[activeIndex]}
		aspectRatio={{ width: 3, height: 4 }}
		bind:dialogVisible
		bind:base64CroppedImage={base64FinalImages[activeIndex].base64Image}
		bind:crop={base64FinalImages[activeIndex].crop}
		bind:zoom={base64FinalImages[activeIndex].zoom}
	/>
{/if}

{#if base64Images.length === 0}
	<div class="flex h-full w-full flex-col gap-4 p-4">
		<Text classNames="relative flex h-16 flex-col justify-center p-2">
			<span class="text-lg font-bold">Add some images for your recipes: </span>
		</Text>
		<BorderCard
			classNames="flex w-full flex-row items-center justify-center rounded-md bg-slate-200 bg-opacity-5 backdrop-blur shadow-md outline-none "
		>
			<ImageUpload
				onLoaded={(imgs) => {
					base64Images = imgs;
					done = true;
				}}
				isMultiImageSelection={true}
				><div slot="uploadIcon" class="grid h-full w-full grid-cols-2 grid-rows-2">
					<ImageSolid
						class="col-start-1 row-start-1 h-full w-full border-2 p-12 opacity-50 outline-none"
					></ImageSolid>
					<ImageSolid
						class="col-start-2 row-start-1 h-full w-full border-2 p-12 opacity-50 outline-none"
					></ImageSolid>
					<ImageSolid
						class="col-start-1 row-start-2 h-full w-full border-2 p-12 opacity-50 outline-none"
					></ImageSolid>
					<ImageSolid
						class="col-start-2 row-start-2 h-full w-full border-2 p-12 opacity-50 outline-none"
					></ImageSolid>
				</div></ImageUpload
			></BorderCard
		>
		<span class="text-base"
			>Make sure you take them at a good angle and with proper light conditions.</span
		>
	</div>
{:else if base64Images.length > 0}
	<div class="flex h-full w-full flex-col gap-4 p-4">
		<Text classNames="relative flex h-16 flex-col justify-center p-2">
			<span class="text-lg font-bold">Align images and pick a cover:</span>
		</Text>
		<div class="z-20 flex flex-col justify-center">
			<div class="grid scale-75 grid-cols-1">
				{#each base64FinalImages as { base64Image }, index}
					{#if index === getIndexOffset(activeIndex, -1)}
						<div
							data-recipe-image-upload-id={index}
							class="{thumbnailIndex === index
								? 'border-4 border-cyan-600'
								: ''} z-40 col-start-1 row-start-1 flex h-full w-full -translate-x-full scale-75 self-center justify-self-center overflow-hidden opacity-50"
						>
							<img class="aspect-[3/4] w-full object-cover" alt="" src={base64Image} />
						</div>
					{:else if index === activeIndex}
						<div
							data-recipe-image-upload-id={index}
							class="{thumbnailIndex === index
								? 'border-4 border-cyan-600'
								: ''} z-50 col-start-1 row-start-1 flex h-full w-full self-center justify-self-center overflow-hidden"
						>
							<img class="aspect-[3/4] w-full object-cover" alt="" src={base64Image} />
						</div>
					{:else if index === getIndexOffset(activeIndex, 1)}
						<div
							data-recipe-image-upload-id={index}
							class="{thumbnailIndex === index
								? 'border-4 border-cyan-600'
								: ''} z-40 col-start-1 row-start-1 flex h-full w-full translate-x-full scale-75 self-center justify-self-center overflow-hidden opacity-50"
						>
							<img class="aspect-[3/4] w-full object-cover" alt="" src={base64Image} />
						</div>
					{:else}
						<div
							data-recipe-image-upload-id={index}
							class="{thumbnailIndex === index
								? 'border-4 border-cyan-600'
								: ''} z-40 col-start-1 row-start-1 hidden h-full w-full self-center justify-self-center overflow-hidden"
						>
							<img class="aspect-[3/4] w-full object-cover" alt="" src={base64Image} />
						</div>
					{/if}
				{/each}
			</div>
		</div>
		<div class="z-20 flex flex-row justify-center gap-2">
			<button class="h-full w-full bg-slate-600" on:click={() => (dialogVisible = true)}
				>Align</button
			>
			<button class="h-full w-full bg-slate-600" on:click={() => (thumbnailIndex = activeIndex)}
				>Set thumbnail</button
			>
		</div>
	</div>
{/if}
