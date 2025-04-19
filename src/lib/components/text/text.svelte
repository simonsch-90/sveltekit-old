<script lang="ts">
	import Border from '../card/border.svelte';
	export let classNames: string = '';
</script>

<Border classNames="z-10 {classNames}">
	<slot />
</Border>
