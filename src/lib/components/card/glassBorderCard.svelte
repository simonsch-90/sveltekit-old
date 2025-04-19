<script lang="ts">
	import BorderCard from './borderCard.svelte';

	export let classNames: string = '';
</script>

<div class="relative flex justify-center overflow-hidden rounded-md {classNames}">
	<div id="gradient" class="absolute h-full w-full"></div>

	<div
		class="absolute h-full w-full rounded-md bg-slate-200 bg-opacity-5 shadow-xl backdrop-blur"
	></div>
	<BorderCard classNames="absolute h-full w-full z-10">
		<slot />
	</BorderCard>
</div>

<style>
	#gradient {
		background-image: linear-gradient(180deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.3) 100%),
			linear-gradient(90deg, rgba(0, 0, 0, 0) 50%, rgba(0, 0, 0, 0.3) 100%),
			radial-gradient(at 100% 100%, rgba(0, 0, 0, 0.7) 0px, transparent 50%),
			radial-gradient(at 0% 0%, rgba(255, 255, 255, 0.7) 0px, transparent 100%);
		mix-blend-mode: overlay;
	}
</style>
