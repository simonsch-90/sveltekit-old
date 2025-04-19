<script lang="ts">
	import Button from './button.svelte';

	export let classNames: string = '';
</script>

<Button classNames="bg-opacity-5  {classNames}">
	<slot />
</Button>
