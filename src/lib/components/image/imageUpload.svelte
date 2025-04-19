<script lang="ts">
	type ImageSelectedEvent = Event & {
		currentTarget: EventTarget & HTMLInputElement;
	};

	export let onLoaded: (base64ImageList: string[]) => void = (base64ImageList) => {};
	export let base64ResultImage: string | undefined = undefined;
	export let base64ImageList: string[] = [];
	export let classNames: string = '';
	export let isMultiImageSelection: boolean = false;

	let toolImageInput: HTMLInputElement;

	const getBase64Image = (imageFile: Blob): Promise<string> => {
		return new Promise((resolve) => {
			// Initialize file reader
			const reader = new FileReader();
			reader.onload = function () {
				// Resolve promise
				resolve(reader.result as string);
			};
			// Parses image blob or file so data is accessible as base64 encoded string
			reader.readAsDataURL(imageFile);
		});
	};

	const onImageSelected = async (event: ImageSelectedEvent) => {
		// Check if we can access the event target which should be the input element
		if (!event.target) return;
		const inputElement = event.target as HTMLInputElement;

		// Extract file blobs from event target which is the input element
		const imageFileList = inputElement.files;

		// If no image blob list available return
		if (!imageFileList) return;

		// Iterate through the list and convert to data url
		base64ImageList = await Promise.all(
			Array.from(imageFileList).map(async (imageFile: Blob) => getBase64Image(imageFile))
		);

		// After we loaded all images call callback
		onLoaded(base64ImageList);
	};
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="flex aspect-square {classNames}"
	on:click={() => {
		toolImageInput.click();
	}}
>
	{#if !base64ResultImage}
		<slot name="uploadIcon" />
	{:else}
		<img class="h-full w-full rounded-md" alt="" src={base64ResultImage} />
	{/if}
</div>

{#if isMultiImageSelection}
	<input
		multiple
		style="display:none"
		type="file"
		name="file"
		id="file"
		accept="image/*"
		on:change={(event) => onImageSelected(event)}
		bind:this={toolImageInput}
	/>
{:else}
	<input
		style="display:none"
		type="file"
		name="file"
		id="file"
		accept="image/*"
		on:change={(event) => onImageSelected(event)}
		bind:this={toolImageInput}
	/>
{/if}

{#if base64ImageList}
	{#each base64ImageList as base64Image}
		<input style="display:none" name="image" value={base64Image} />
	{/each}
{/if}
