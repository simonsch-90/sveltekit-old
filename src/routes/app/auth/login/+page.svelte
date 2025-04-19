<script lang="ts">
	import { signIn, signOut } from '@auth/sveltekit/client';
	import { page } from '$app/stores';

	let email = '';

	const handleEmailSignIn = (callbackUrl: string) => signIn('email', { email, callbackUrl });

	const handleGoogleSignIn = async (callbackUrl: string) => signIn('google', { callbackUrl });

	const handleSignOut = () => signOut();
</script>

<div>
	{#if !$page.data.session}
		<form on:submit={() => handleEmailSignIn($page.url.searchParams.get('authOrigin') ?? '/')}>
			<input name="email" type="email" bind:value={email} />
			<button>Continue</button>
		</form>

		<button on:click={() => handleGoogleSignIn($page.url.searchParams.get('authOrigin') ?? '/')}>
			Continue with Google
		</button>
	{/if}

	{#if $page.data.session}
		<div>
			<button on:click={handleSignOut}>Sign out</button>
		</div>
	{/if}
</div>
