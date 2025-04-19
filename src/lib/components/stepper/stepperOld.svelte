<script lang="ts">
	export let classNames: string = '';
	export let maxSteps: number = 3;
	export let steps: [{}, {}, {}, {}];

	export let activeStep: number = 0;
	let maxStepsArray = new Array(maxSteps);

	// Checking for even numbers to determine if a node needs to be rendered
	const isStepNode = (stepIndex: number) => stepIndex % 2 === 0;
</script>

<div id="progress" class="grid h-full w-full grid-cols-{maxStepsArray.length} {classNames}">
	{#each maxStepsArray as step, index}
		<div
			class="relative col-span-1 row-span-1 row-start-1 h-full w-full col-start-{index +
				1} flex items-center justify-center self-center"
		>
			<div class="absolute grid h-full w-full grid-cols-2">
				<div
					class="col-span-1 col-start-1 row-span-1 row-start-1 flex h-1 w-full self-center bg-slate-200 bg-opacity-15 backdrop-blur"
				></div>
				<div
					class="col-span-1 col-start-2 row-span-1 row-start-1 flex h-1 w-full self-center bg-slate-200 bg-opacity-15 backdrop-blur"
				></div>
			</div>
			<div class="absolute flex aspect-square h-6 self-center rounded-full">
				<div class="h-full w-full rounded-full bg-slate-200 bg-opacity-15 backdrop-blur"></div>
			</div>
		</div>
	{/each}
</div>

<style>
	.test {
		clip-path: url('#circle');
	}
</style>
