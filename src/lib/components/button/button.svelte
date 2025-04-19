<script lang="ts">
	export let classNames: string = '';
</script>

<button
	class="gradient-border rounded-md bg-slate-200 p-2 shadow-md outline-none backdrop-blur {classNames}"
>
	<slot />
</button>

<style>
	.gradient-border::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 0.375rem;
		padding: 1px;
		background: linear-gradient(
			165deg,
			rgba(230, 230, 230, 1) 0%,
			rgb(210, 210, 210, 1) 35%,
			rgb(210, 210, 210, 1) 45%,
			rgba(0, 0, 0, 0) 55%
		);
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		z-index: -1;
	}
</style>
