<script lang="ts">
	export let classNames: string = '';
</script>

<div class="gradient-border {classNames}">
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
			164deg,
			rgb(255, 255, 255) 0%,
			rgba(255, 255, 255, 0.3) 35%,
			rgba(255, 255, 255, 0) 40%,
			rgba(255, 255, 255, 0) 80%,
			rgba(255, 255, 255, 0.3) 85%,
			rgb(255, 255, 255) 100%
		);
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		z-index: -1;
	}
</style>
