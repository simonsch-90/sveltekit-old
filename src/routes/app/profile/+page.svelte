<script lang="ts">
	import { Alert } from 'flowbite-svelte';
	import type { PageData } from './$types';
	import { getCroppedImg } from './util';
	import ImageCrop from '$lib/components/imageCrop.svelte';

	export let data: PageData;

	let crop = { x: 0, y: 0 };
	let zoom = 1;
	let image: string;
	let fileinput: HTMLInputElement;
	let croppedImage: string | null;
	let croppedImageBlob: Blob | null;
	let uploadedImage: string | null;
	let type: string;
	let name: string;

	const onFileSelected = (e: any) => {
		console.log(e);
		let imageFile = e.target.files[0];
		name = imageFile.name;
		type = imageFile.type;
		let reader = new FileReader();
		reader.onload = (e) => {
			image = e.target.result;
		};
		reader.readAsDataURL(imageFile);
	};

	const previewCrop = async (e: any) => {
		croppedImageBlob = await getCroppedImg(image, e.detail.pixels);
		if (croppedImageBlob) {
			croppedImage = URL.createObjectURL(croppedImageBlob);
		}
	};

	const upload = async () => {
		if (croppedImageBlob) {
			const buffer = await croppedImageBlob.arrayBuffer();
			const image = await fetch(data.url, {
				body: buffer,
				method: 'PUT',
				headers: {
					'Content-Type': type,
					'Content-Disposition': `attachment; filename="${name}"`,
				},
			});

			uploadedImage = image.url.split('?')[0];
			console.log(uploadedImage);
		}
	};
</script>

<h1>PROFILE</h1>
<div class="p-8">
	<Alert>
		<span class="font-medium">Info alert!</span>
		Change a few things up and try submitting again.
	</Alert>
</div>
{#if !image}
	<input
		type="file"
		accept=".jpg, .jpeg, .png"
		on:change={(e) => onFileSelected(e)}
		bind:this={fileinput}
	/>
{:else}
	<div class="pic-wrapper">
		<ImageCrop {image} bind:crop bind:zoom on:cropcomplete={previewCrop} aspect={1} />
	</div>
	<h2>Preview</h2>
	<div class="pic-wrapper">
		<img src={croppedImage} alt="Cropped profile" />
	</div>
	<button type="button" on:click={upload}>Upload</button>
	{#if uploadedImage}
		<h2>Uploaded image</h2>

		<div class="pic-wrapper">
			<img src={uploadedImage} alt="Uploaded profile" />
		</div>
	{/if}
{/if}

<style>
	.pic-wrapper {
		position: relative;
		width: 300px;
		height: 300px;
	}
</style>
