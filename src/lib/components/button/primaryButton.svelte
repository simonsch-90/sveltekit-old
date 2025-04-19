<script lang="ts">
	import Button from './button.svelte';

	export let classNames: string = '';
</script>

<Button classNames="bg-opacity-25 {classNames}">
	<slot />
</Button>
