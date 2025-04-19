<script lang="ts">
	import { onMount } from 'svelte';
	import BorderCard from '../card/borderCard.svelte';

	export let classNames: string = '';
	export let placeholder: string = '';

	let isEditMode = false;
	let charCount = 0;
	let textarea: HTMLTextAreaElement;

	const toogleEditMode = () => (isEditMode = !isEditMode);

	function handleInput(event: Event) {
		charCount = (event.target as HTMLTextAreaElement).value.length;
	}

	onMount(() => {
		charCount = textarea.value.length;
	});
</script>

<BorderCard
	classNames="relative flex w-full flex-col rounded-md bg-slate-200 bg-opacity-10 p-2 outline-none backdrop-blur {classNames}"
	isDent={true}
>
	<textarea
		bind:this={textarea}
		class="h-full w-full resize-none rounded-sm border-none bg-transparent p-0 text-slate-200 outline-none ring-0 placeholder:text-slate-200 focus:ring-0"
		{placeholder}
		on:focus={toogleEditMode}
		on:blur={toogleEditMode}
		on:input={handleInput}
	></textarea>
	<div class="flex w-full place-content-end text-xs text-slate-200 opacity-75">
		{charCount} characters
	</div>
</BorderCard>
