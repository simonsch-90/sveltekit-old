<script>
	import Radio from '$lib/components/radio/radio.svelte';
	import InputTextArea from '$lib/components/text/inputTextArea.svelte';
	import InputTextField from '$lib/components/text/inputTextField.svelte';
	import Text from '$lib/components/text/text.svelte';

	let radioOptions = [
		{
			value: 'private',
			name: 'Private',
		},
		{
			value: 'public',
			name: 'Public',
		},
	];
</script>

<div class="flex h-full w-full flex-col gap-4 p-4">
	<Text classNames="relative flex h-16 flex-col justify-center p-2">
		<span class="text-lg font-bold">What kind of recipe you want to create?</span>
	</Text>
	<div class="flex h-48 flex-col justify-center gap-4">
		<InputTextField classNames="h-16 w-full" placeholder="Give your recipe a title"
		></InputTextField>
		<InputTextArea classNames="h-32 w-full" placeholder="Small description"></InputTextArea>
	</div>
	<div class="flex h-24 flex-col justify-center gap-2">
		<span class="text-base">Wanna keep it private for now?</span>
		<Radio formEntryName="privacy" {radioOptions}></Radio>
	</div>
</div>
