<script lang="ts">
	import Layout from '$lib/components/layout/modal/layout.svelte';
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
