<script lang="ts">
	import Stepper from '$lib/components/stepper/stepper.svelte';
	import type { ComponentType, SvelteComponent } from 'svelte';
	import InitFormPart from './initFormPart.svelte';
	import ImageRefineFormPart from './imageRefineFormPart.svelte';
	import IngredientFormPart from './ingredientFormPart.svelte';
	import ToolFormPart from './toolFormPart.svelte';
	import StepsFormPart from './stepsFormPart.svelte';
	let components: ComponentType[] = [
		InitFormPart,
		ImageRefineFormPart,
		IngredientFormPart,
		ToolFormPart,
		StepsFormPart,
	];
</script>

<div class="flex h-screen flex-row items-center">
	<Stepper classNames="h-full w-full" {components}></Stepper>
</div>
