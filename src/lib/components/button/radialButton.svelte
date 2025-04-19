<script lang="ts">
	export let classNames: string = '';
</script>

<button
	class="gradient-border relative aspect-square rounded-full bg-opacity-25 p-2 outline-none backdrop-blur {classNames}"
>
	<slot />
</button>

<style>
	.gradient-border {
		inset: 0;
		border-radius: 9999px;
		padding: 1px;
		background: linear-gradient(
			165deg,
			rgba(0, 0, 0, 0.2) 0%,
			rgb(102, 102, 102, 0.3) 35%,
			rgb(210, 210, 210, 0.3) 85%,
			rgba(230, 230, 230, 0.4) 100%
		);
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		z-index: -1;
	}
</style>
