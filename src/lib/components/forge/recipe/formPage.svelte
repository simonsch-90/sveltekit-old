<script lang="ts">
	import FormPageElement from './formPageElement.svelte';

	export let data: {
		title: string;
		questions: {
			input: string;
			title: string;
			name: string;
		}[];
	};

	/** Specifies a custom class name for the button. */
	let className = '';
	export { className as class };
</script>

<div class="h-1/3 w-full snap-center snap-always {className} bg-red-700">
	{#each data.questions as { title, name }}
		<FormPageElement {title} {name} />
	{/each}
</div>
