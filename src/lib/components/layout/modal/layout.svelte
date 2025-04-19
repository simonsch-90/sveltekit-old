<script>
	import Header from '$lib/components/layout/header.svelte';
	import { navigateBack } from '$lib/components/util';
	import Container from '../container.svelte';
</script>

<Container>
	<Header onClose={navigateBack} headerMode="dialog"></Header>
	<div
		class="flex h-full w-full flex-1 grow flex-col content-normal items-stretch justify-between overflow-auto"
	>
		<slot />
	</div>
</Container>
