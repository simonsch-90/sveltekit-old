<script lang="ts">
	import { EditOutline } from 'flowbite-svelte-icons';
	import BorderCard from '../card/borderCard.svelte';

	export let classNames: string = '';
	export let disableBorder: boolean = false;
	export let placeholder: string = '';

	let isEditMode = false;

	const toogleEditMode = () => (isEditMode = !isEditMode);
</script>

{#if disableBorder}
	<div class="relative flex flex-row rounded-md {classNames} ">
		<input
			class="flex-auto rounded-md bg-transparent p-2 text-slate-200 outline-none placeholder:text-slate-200"
			{placeholder}
			on:focus={toogleEditMode}
			on:blur={toogleEditMode}
		/>
		<span class="aspect-square h-full p-2 text-slate-200">
			<EditOutline class="h-full w-full outline-none {!isEditMode ? 'opacity-100' : 'opacity-0'}"
			></EditOutline>
		</span>
	</div>
{:else}
	<BorderCard classNames="relative flex flex-row rounded-md {classNames}" isDent={true}>
		<input
			class="flex-auto rounded-md bg-transparent p-2 text-slate-200 outline-none placeholder:text-slate-200"
			{placeholder}
			on:focus={toogleEditMode}
			on:blur={toogleEditMode}
		/>
		<span class="flex aspect-square h-2/3 self-center p-2 text-slate-200">
			<EditOutline class="h-full w-full outline-none {!isEditMode ? 'opacity-100' : 'opacity-0'}"
			></EditOutline>
		</span>
	</BorderCard>
{/if}
