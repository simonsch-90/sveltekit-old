<script lang="ts">
	import { Textarea } from 'flowbite-svelte';
	import { PlusSolid } from 'flowbite-svelte-icons';
	let steps: {
		description: string;
	}[] = [];

	const addRecipeStep = () => {
		const stepTextArea = document.getElementById(`stepTextArea`) as HTMLTextAreaElement;
		if (stepTextArea && stepTextArea.value && stepTextArea.value.trim().length > 0) {
			steps = [...steps, { description: stepTextArea.value }];
			stepTextArea.value = '';
		}
	};
</script>

<div class="flex h-full w-full flex-col justify-between">
	<div class="z-20 flex flex-col justify-center">
		<h2>Now describe the single recipe steps:</h2>
	</div>
	<div class="z-20 flex grow flex-col justify-start">
		<div class="flex h-full w-full flex-col">
			{#each steps as { description }}
				<div class="flex h-16 w-full flex-row border">
					<div class="flex grow flex-row border">
						<span class="h-full w-full content-start text-start">{description}</span>
					</div>
				</div>
			{/each}
			<div class="flex h-16 w-full flex-row border">
				<div class="flex grow flex-row border">
					<Textarea id="stepTextArea" class="h-full w-full content-start text-start"
						>Add another ingredient</Textarea
					>
				</div>
				<div class="aspect-square w-16 border p-4" on:click={addRecipeStep}>
					<PlusSolid class="h-full w-full"></PlusSolid>
				</div>
			</div>
		</div>
	</div>

	<div class="z-20 flex flex-col justify-center justify-self-end">
		<button class="h-full grow bg-slate-600">Continue</button>
	</div>
</div>
