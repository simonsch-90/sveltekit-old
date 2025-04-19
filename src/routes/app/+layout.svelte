<script lang="ts">
	import Layout from '$lib/components/layout/app/layout.svelte';
	import '/src/app.pcss';
</script>

<body>
	<main class="main container">
		<Layout>
			<slot />
		</Layout>
	</main>
</body>

<style>
</style>
