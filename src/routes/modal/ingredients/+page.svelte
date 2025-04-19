<script lang="ts">
	import { UploadSolid } from 'flowbite-svelte-icons';
	import { page } from '$app/stores';
	import Upload from '$lib/components/dialog/image/upload.svelte';
	import { superForm } from 'sveltekit-superforms';
	import { navigateBack } from '$lib/components/util';
	import ImageUpload from '$lib/components/image/imageUpload.svelte';

	export let data;
	const { form, errors, constraints, posted, message, enhance } = superForm(data.form);

	const searchedIngredient = $page.url.searchParams.get('searchedIngredient')?.trim();
	const similarIngredients = $page.data.similarIngredients;

	let dialogVisible: boolean = false;
	let base64IngredientImage: string | ArrayBuffer | null;
	let base64CroppedIngredientImage: string;

	$: if ($posted && $message === '200') navigateBack();
</script>

{#if dialogVisible}
	<Upload
		base64Image={base64IngredientImage}
		aspectRatio={{ width: 1, height: 1 }}
		bind:dialogVisible
		bind:base64CroppedImage={base64CroppedIngredientImage}
	/>
{/if}

<div class="flex h-full w-full flex-col content-normal items-stretch justify-between p-4">
	{#if searchedIngredient}
		<h1 class="w-full">
			Nothing found for {searchedIngredient}? Add a new ingredient to the ingredient library:
		</h1>
	{:else}
		<h1 class="w-full">Add a new ingredient to the ingredient library:</h1>
	{/if}
	<form class="flex h-full w-full flex-col" method="POST" use:enhance enctype="multipart/form-data">
		<div class="flex flex-col">
			<h2 class="py-4">Give your ingredient a name and a icon:</h2>
			<div class="flex flex-row items-center justify-items-center space-x-4">
				<ImageUpload
					classNames="w-1/3"
					base64ResultImage={base64CroppedIngredientImage}
					onLoaded={(base64ToolImages) => {
						base64IngredientImage = base64ToolImages[0];
						dialogVisible = true;
					}}><UploadSolid slot="uploadIcon" class="h-full w-full p-4"></UploadSolid></ImageUpload
				>
				<input class="h-12 w-full rounded-md" type="text" name="name" id="name" />
			</div>
		</div>
		<div class="flex h-full w-full flex-col">
			<h2 class="py-4">Describe the new ingredient:</h2>
			<textarea class="h-full w-full resize-none rounded-md" name="description" id="description" />
		</div>
		{#if similarIngredients}
			<div class="flex h-full w-full flex-col">
				<h2 class="py-4">Similar ingredients found:</h2>
				<div
					class="scrollbar-hide flex h-full w-full snap-x snap-mandatory flex-row flex-nowrap space-x-4 overflow-x-scroll"
				>
					{#each similarIngredients as { name, description }, index}
						<div
							class="flex w-1/3 flex-shrink-0 snap-start snap-always flex-col items-center justify-items-center {index ===
							0
								? 'ml-4'
								: ''} "
						>
							<img class="aspect-square w-full object-cover" alt="" src="/images/cat.jpeg" />
							<span>{name}</span>
						</div>
					{/each}
				</div>
			</div>
		{/if}
		<div class="flex h-12 w-full flex-shrink-0 justify-evenly gap-4">
			<button class="h-full grow bg-slate-600 p-4" type="submit">Save</button>
		</div>
	</form>
</div>

<style>
	/* For Webkit-based browsers (Chrome, Safari and Opera) */
	.scrollbar-hide::-webkit-scrollbar {
		display: none;
	}

	/* For IE, Edge and Firefox */
	.scrollbar-hide {
		-ms-overflow-style: none; /* IE and Edge */
		scrollbar-width: none; /* Firefox */
	}
</style>
