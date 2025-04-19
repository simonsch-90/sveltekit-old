<script lang="ts">
	import { onMount } from 'svelte';
	import { gsap } from 'gsap/dist/gsap';
</script>

<div class="flex snap-x snap-mandatory space-x-2 overflow-x-auto">
	<div class="aspect-[4/1] min-w-full flex-shrink-0 snap-center bg-black">
		<span>Looks like you should do some grocery shopping today?</span>
	</div>

	<div class="aspect-[4/1] min-w-full flex-shrink-0 snap-center bg-black">
		<span>Test</span>
	</div>

	<div class="aspect-[4/1] min-w-full flex-shrink-0 snap-center bg-black">
		<span>Tester ewrew rew r</span>
	</div>
</div>

<div class="p-4">
	<h1 class="mb-2">Today</h1>
	<div class="aspect-[4/4] w-full bg-cyan-500"></div>
</div>
<div class="p-4">
	<h1 class="mb-2">In the next days</h1>
	<div class="grid w-full grid-cols-3 gap-2">
		<div class="aspect-[3/4] bg-cyan-500"></div>
		<div class="aspect-[3/4] bg-orange-500"></div>
		<div class="aspect-[3/4] bg-green-500"></div>
	</div>
</div>
<div class="p-4">
	<div class="mb-2 grid grid-cols-2">
		<h1 class="col-start-1">Current popular</h1>
		<span class="col-start-2 place-self-end">More</span>
	</div>

	<div class="grid w-full grid-cols-3 gap-2">
		<div class="aspect-[3/4] bg-cyan-500"></div>
		<div class="aspect-[3/4] bg-orange-500"></div>
		<div class="aspect-[3/4] bg-green-500"></div>
	</div>
</div>
<div class="p-4">
	<div class="mb-2 grid grid-cols-2">
		<h1 class="col-start-1">New</h1>
		<span class="col-start-2 place-self-end">More</span>
	</div>

	<div class="grid w-full grid-cols-3 gap-2">
		<div class="aspect-[3/4] bg-cyan-500"></div>
		<div class="aspect-[3/4] bg-orange-500"></div>
		<div class="aspect-[3/4] bg-green-500"></div>
	</div>
</div>

<style>
</style>
