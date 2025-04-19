<script lang="ts">
	export let classNames: string = '';
	export let isDent: boolean = false;
</script>

<div class="{isDent ? 'gradient-border-dent' : 'gradient-border'} {classNames}">
	<slot />
</div>

<style>
	.gradient-border::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 0.375rem;
		padding: 1px;
		background: linear-gradient(
			155deg,
			rgba(255, 255, 255, 1) 0%,
			rgba(255, 255, 255, 0.5) 35%,
			rgba(255, 255, 255, 0.2) 55%,
			rgba(255, 255, 255, 0.1) 75%
		);
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		z-index: -1;
	}
	.gradient-border-dent::before {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 0.375rem;
		padding: 1px;
		background: linear-gradient(
			155deg,
			rgba(255, 255, 255, 0.1) 0%,
			rgba(255, 255, 255, 0.2) 45%,
			rgba(255, 255, 255, 0.5) 60%,
			rgba(255, 255, 255, 1) 100%
		);
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		z-index: -1;
	}
</style>
