<script lang="ts">
	import { page } from '$app/stores';
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

{#if $page.data.session}
	<span>
		<small>Signed in as</small>
		<br />
		<strong>
			{$page.data.session.user?.email ?? $page.data.session.user?.name}
		</strong>
	</span>

	<a href="/app/auth/signout" class="button" data-sveltekit-preload-data="off"> Sign out </a>
{:else}
	<span class="notSignedInText"> You are not signed in </span>

	<a href="/app/auth/signin" class="buttonPrimary" data-sveltekit-preload-data="off"> Sign in </a>
{/if}

<style>
</style>
