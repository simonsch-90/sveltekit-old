<script lang="ts">
	import { page } from '$app/stores';
	import { ChevronLeftOutline, CloseSolid, SearchSolid } from 'flowbite-svelte-icons';
	import Dropdown from '$lib/components/dropdown/dropdown.svelte';
	export let onClose = () => {};
	export let classNames = '';
	export let zIndex = 100;
	export let headerMode: 'dialog' | 'default' = 'default';
	export let headerTitle = '';

	let headerDropdownVisible: boolean = false;
	const onHeaderDropdownClose = () => {
		headerDropdownVisible = false;
		document.body.removeEventListener('click', onHeaderDropdownClose);
	};
	const onHeaderDropdownClick = () => {
		if (headerDropdownVisible === true) {
			document.body.removeEventListener('click', onHeaderDropdownClose);
			headerDropdownVisible = false;
		} else if (headerDropdownVisible === false) {
			document.body.addEventListener('click', onHeaderDropdownClose);
			headerDropdownVisible = true;
		}
	};
</script>

<div class="grid h-12 w-full grid-cols-3 {classNames}" style="z-index: {zIndex}">
	{#if headerMode === 'default'}
		{#if $page.url.pathname !== '/app/home'}
			<div class="place-self-start self-center p-4">
				<ChevronLeftOutline class="outline-none" on:click={onClose}></ChevronLeftOutline>
			</div>
			<div class="place-self-center self-center">
				<a class="outline-none" href="/app/search"> <SearchSolid></SearchSolid></a>
			</div>
		{/if}
		<button
			class="col-start-3 place-self-end rounded-full"
			type="button"
			on:click|stopPropagation={onHeaderDropdownClick}
		>
			<img alt="" src="/images/cat.jpeg" class="h-12 w-12 rounded-full object-cover p-2" />
		</button>
		<div></div>
		<div class="place-self-end">
			<Dropdown
				bind:visible={headerDropdownVisible}
				items={[
					{ name: 'Profile', href: '/app/profile' },
					{ name: 'Settings', href: '/app/settings' },
					{ name: 'Contact', href: '/app/contacts' },
				]}
			>
				<div slot="header" class="px-4 py-2">
					<span class="block text-sm">Konrad Göt</span>
					<span class="block truncate text-sm font-medium">konradgöt@gmail.com</span>
				</div>
				<button slot="footer" type="button" class="w-full px-4 py-2 text-left text-sm font-medium"
					>Sign out</button
				>
			</Dropdown>
		</div>
	{/if}
	{#if headerMode === 'dialog'}
		{#if headerTitle.length > 0}
			<div class="col-start-2 place-self-center self-center">
				<span>{headerTitle}</span>
			</div>{/if}
		<CloseSolid class="col-start-3 h-12 w-12 place-self-end p-2 outline-none" on:click={onClose}
		></CloseSolid>
	{/if}
</div>
