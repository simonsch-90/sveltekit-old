<script lang="ts">
	import { Flip } from 'gsap/dist/Flip';
	import { gsap } from 'gsap/dist/gsap';
	import { onMount } from 'svelte';
	import { afterNavigate, beforeNavigate } from '$app/navigation';
	gsap.registerPlugin(Flip);
	let state: Flip.FlipState;

	beforeNavigate(() => {
		state = Flip.getState('.title');
		console.log('state', state);
	});

	afterNavigate(() => {
		Flip.from(state, {
			targets: '.title',
			duration: 1.0,
			scale: true,
			ease: 'ease-out',
		});
	});
</script>

<slot />
