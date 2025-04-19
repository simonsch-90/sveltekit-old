<script lang="ts">
	import Header from '$lib/components/layout/header.svelte';
	import Container from '$lib/components/layout/container.svelte';
	import Footer from '$lib/components/layout/footer.svelte';
	import { PlusSolid, SearchSolid } from 'flowbite-svelte-icons';

	const toolList = [
		{
			id: '0001',
			name: 'Pan',
			description: 'A pan is a normal kitchen tool used to pan frie stuff',
			s3Key: '/images/tools/uuid',
		},
		{
			id: '3456',
			name: 'Wok',
			s3Key: '/images/tools/uuid',
		},
		{
			id: '0357',
			name: 'Crepe-Pan',
			description: 'A pan especially useful for distributing crepe batter',
			s3Key: '/images/tools/uuid',
		},
		{
			id: '0676',
			name: 'Non-Stick-Pan',
			description: 'A non stick pan usually only heated medium or medium-low',
			s3Key: '/images/tools/uuid',
		},
		{
			id: '0657',
			name: 'Steel-Pan',
			description: 'A pan is a normal kitchen tool used to pan frie stuff',
			s3Key: '/images/tools/uuid',
		},
	];
	let searchToolList = [...toolList];
	let selectedToolIndex: string;
	export let dialogVisible = false;
	export let selectedTool;

	const onToolSearch = (
		event: Event & {
			currentTarget: EventTarget & HTMLInputElement;
		}
	) => {
		if (!event.currentTarget.value || event.currentTarget.value.trim().length === 0)
			searchToolList = toolList;
		searchToolList = toolList.filter((tool) =>
			tool.name.toLowerCase().includes(event.currentTarget.value.toLowerCase())
		);
	};
	const cancelToolSelection = () => {
		dialogVisible = false;
	};

	const saveToolSelection = () => {
		selectedTool = toolList.find(({ id }) => id === selectedToolIndex);
		dialogVisible = false;
	};
</script>

{#if dialogVisible}
	<Container classNames="bg-gray-900 w-full items-center justify-center" zIndex={110}>
		<Header
			classNames="bg-gray-900"
			onClose={cancelToolSelection}
			zIndex={110}
			headerMode="dialog"
			headerTitle="Find your tool:"
		></Header>
		<div class="flex h-full w-full flex-col content-normal items-stretch justify-between">
			<div class="flex h-full flex-col p-4">
				<div class="flex h-16 w-full flex-row border">
					<div class="flex grow flex-row gap-4 pl-4">
						<SearchSolid class="aspect-square h-full"></SearchSolid>
						<input
							class="h-full w-full content-center bg-transparent text-start"
							placeholder="Add another tool"
							on:input={(event) => onToolSearch(event)}
						/>
					</div>
					<a href="/modal/tools" class="aspect-square w-16 p-4">
						<PlusSolid class="h-full w-full"></PlusSolid>
					</a>
				</div>
				<div class="flex h-full w-full flex-col border">
					<div class="grid w-full grow auto-rows-min grid-cols-3 gap-4 p-4">
						{#each searchToolList as { name, id }}
							<!-- svelte-ignore a11y-no-static-element-interactions -->
							<!-- svelte-ignore a11y-click-events-have-key-events -->
							<div
								class="{selectedToolIndex === id ? 'border-4 border-cyan-600' : ''} aspect-square"
								on:click={() => (selectedToolIndex = id)}
							>
								<img class="aspect-square w-full object-cover" alt="" src="/images/cat.jpeg" />
								<span>{name}</span>
							</div>
						{/each}
					</div>
				</div>
			</div>
			<div
				class="flex h-12 w-full flex-shrink-0 justify-evenly gap-4 bg-gray-900"
				style="z-index: 110"
			>
				<button class="h-full grow bg-slate-600" on:click={saveToolSelection}>Done</button>
			</div>
		</div>
		<Footer classNames="bg-gray-900" zIndex={110} footerMode="empty"></Footer>
	</Container>
{/if}
