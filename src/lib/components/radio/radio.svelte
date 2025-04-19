<script lang="ts">
	import BorderCard from '../card/borderCard.svelte';

	export let classNames: string = '';
	export let formEntryName: string;
	export let radioOptions: {
		value: string;
		name: string;
	}[];
	export let radioSelected: number = 0;
</script>

<BorderCard
	classNames="flex h-full w-full flex-row items-center justify-center rounded-md bg-slate-200 bg-opacity-10 backdrop-blur shadow-md outline-none {classNames}"
>
	{#each radioOptions as { value, name }, index}
		{#if index === 0}
			<div class="h-full flex-auto outline-none {classNames}">
				<input
					type="radio"
					id={value}
					checked={radioSelected === index ? true : false}
					name={formEntryName}
					{value}
					class="hidden"
				/>
				<label
					for={value}
					class="flex h-full w-full flex-col items-center justify-center text-center"
				>
					{name}
				</label>
			</div>
		{:else if index === radioOptions.length - 1}
			<div class="border-y-1 h-full flex-auto outline-none {classNames} border-l-[1px]">
				<input
					type="radio"
					id={value}
					checked={radioSelected === index ? true : false}
					name={formEntryName}
					{value}
					class="hidden"
				/>
				<label
					for={value}
					class="flex h-full w-full flex-col items-center justify-center text-center"
				>
					{name}
				</label>
			</div>
		{:else}
			<div class="h-full flex-auto outline-none {classNames} border-l-[1px]">
				<input
					type="radio"
					id={value}
					checked={radioSelected === index ? true : false}
					name={formEntryName}
					{value}
					class="hidden"
				/>
				<label
					for={value}
					class="flex h-full w-full flex-col items-center justify-center text-center"
				>
					{name}
				</label>
			</div>
		{/if}
	{/each}
</BorderCard>

<style>
	/* Change border color when radio is checked */
	input[type='radio']:checked + label {
		background-color: rgba(226, 232, 240, 0.25);
	}
</style>
