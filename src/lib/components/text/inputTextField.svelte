<script lang="ts">
	import InputText from './inputText.svelte';
	export let classNames: string = '';
	export let disableBorder: boolean = false;
	export let placeholder: string = '';
</script>

<InputText
	classNames="bg-slate-200 bg-opacity-10 backdrop-blur {classNames}"
	{disableBorder}
	{placeholder}
></InputText>
