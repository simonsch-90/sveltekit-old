<script lang="ts">
	import PrimaryButton from '$lib/components/button/primaryButton.svelte';
	import Radial from '$lib/components/button/radial.svelte';
	import RadialButton from '$lib/components/button/radialButton.svelte';
	import SecondaryButton from '$lib/components/button/secondaryButton.svelte';
	import GlassCard from '$lib/components/card/glassCard.svelte';
	import InputText from '$lib/components/text/inputText.svelte';
	import InputTextArea from '$lib/components/text/inputTextArea.svelte';
	import InputTextField from '$lib/components/text/inputTextField.svelte';
</script>

<div class="flex h-full w-full flex-col items-center justify-center gap-4">
	<GlassCard classNames="h-2/3 w-2/3">
		<div class="flex h-full w-full flex-col items-center justify-center gap-4 p-4">
			<RadialButton classNames="w-16 h-16">Test</RadialButton>
			<InputTextField></InputTextField>
			<InputText></InputText>
			<InputTextArea></InputTextArea>

			<PrimaryButton classNames="w-full">Click Me</PrimaryButton>
			<SecondaryButton classNames="w-full">Click Me</SecondaryButton>
		</div>
	</GlassCard>
</div>

<style>
</style>
