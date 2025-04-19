<script lang="ts">
	import Header from '$lib/components/layout/header.svelte';
	import type { CropArea } from '$lib/types';
	import ImageCrop from '../../imageCrop.svelte';
	import { getCroppedImg } from './util';
	import Container from '$lib/components/layout/container.svelte';
	import Footer from '$lib/components/layout/footer.svelte';

	export let base64Image;
	export let base64CroppedImage: string;
	export let aspectRatio;
	export let dialogVisible = false;
	export let crop = { x: 0, y: 0 };
	export let zoom = 1;

	let croppedImageBlob: Blob | null;

	const previewCrop = async (e: { detail: { pixels: CropArea } }) => {
		croppedImageBlob = await getCroppedImg(base64Image, e.detail.pixels);
	};

	const cancelCrop = () => {
		dialogVisible = false;
	};

	const saveCrop = () => {
		if (croppedImageBlob) {
			base64CroppedImage = URL.createObjectURL(croppedImageBlob);
			dialogVisible = false;
		}
	};
</script>

{#if dialogVisible}
	<Container classNames="bg-gray-900 w-full items-center justify-center" zIndex={110}>
		<Header
			classNames="bg-gray-900"
			onClose={cancelCrop}
			zIndex={110}
			headerMode="dialog"
			headerTitle="Crop your image:"
		></Header>
		<div class="flex h-full w-full flex-col content-normal items-stretch justify-between">
			<span class="w-full bg-gray-900 p-4" style="z-index: 1"
				>You can move and zoom using the tool below to define a part of your image.</span
			>
			<ImageCrop
				classNames="text-gray-900 opacity-80"
				image={base64Image}
				bind:crop
				bind:zoom
				on:cropcomplete={previewCrop}
				{aspectRatio}
			/>
			<div
				class="flex h-12 w-full flex-shrink-0 justify-evenly gap-4 bg-gray-900"
				style="z-index: 110"
			>
				<button class="h-full grow bg-slate-600" on:click={saveCrop}>Done</button>
			</div>
		</div>
		<Footer classNames="bg-gray-900" zIndex={110} footerMode="empty"></Footer>
	</Container>
{/if}
