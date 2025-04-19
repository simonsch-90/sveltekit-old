<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import { superForm } from 'sveltekit-superforms';
	import { ShareAllSolid } from 'flowbite-svelte-icons';
	import { getCroppedImg } from './util';
	import ImageCrop from '$lib/components/imageCrop.svelte';

	export let data;
	const { form, errors, constraints, message, enhance } = superForm(data.form);

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
</script>

<form class="h-full w-full p-4" method="POST" use:enhance>
	<section>
		{#if !image}
			<input
				type="file"
				accept=".jpg, .jpeg, .png"
				on:change={(e) => onFileSelected(e)}
				bind:this={fileinput}
			/>
		{:else}
			<ImageCrop {image} bind:crop bind:zoom on:cropcomplete={previewCrop} aspect={3 / 4} />
		{/if}
	</section>
	<section class="flex h-full w-full flex-col justify-center gap-4">
		<div class="flex flex-col justify-center gap-2">
			<h1>Let's start with some basics</h1>
			<div>
				<input
					class="w-full rounded border bg-slate-800 focus:border-sky-500"
					type="text"
					placeholder="Give your recipe a title"
				/>
			</div>
		</div>

		<div class="flex flex-col justify-center gap-4">
			<h1>Wanna keep it private for now?</h1>
			<div class="grid w-full grid-cols-2 gap-4">
				<input type="radio" id="private" checked name="privacy" value="private" class="hidden" />
				<label
					for="private"
					class="flex aspect-square flex-col items-center justify-center rounded-lg border border-gray-300 text-center"
				>
					<ShareAllSolid class="h-16 w-16"></ShareAllSolid>
					<span>Private</span>
				</label>

				<input type="radio" id="public" name="privacy" value="public" class="hidden" />
				<label
					for="public"
					class="flex aspect-square flex-col items-center justify-center rounded-lg border border-gray-300 text-center"
				>
					<ShareAllSolid class="h-16 w-16"></ShareAllSolid>
					<span>Public</span>
				</label>
			</div>
		</div>
	</section>
</form>

<style>
	input[type='radio']:checked + label {
		border-color: #4f46e5; /* Change border color when radio is checked */
	}
</style>
