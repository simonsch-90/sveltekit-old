<script>
	import Footer from '$lib/components/layout/footer.svelte';
	import Header from '$lib/components/layout/header.svelte';
	import { navigateBack } from '$lib/components/util';
</script>

<div
	class="absolute left-0 top-0 flex h-full w-full flex-col content-normal items-stretch justify-between text-gray-300"
>
	<Header onClose={navigateBack} headerMode="default"></Header>
	<div
		class="flex h-full w-full flex-1 grow flex-col content-normal items-stretch justify-between overflow-auto"
	>
		<div class="block h-full w-full"><slot /></div>
	</div>
	<Footer></Footer>
</div>
