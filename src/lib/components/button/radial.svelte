<script lang="ts">
	export let classNames: string = '';
</script>

<div class="relative aspect-square rounded-full outline-none {classNames}">
	<div class="absolute h-full w-full p-2">
		<div class="h-full w-full rounded-full backdrop-blur"></div>
	</div>
	<div class="absolute h-full w-full p-2">
		<div class="gradient-border h-full w-full"></div>
	</div>
	<div class="absolute h-full w-full p-[0.65rem]">
		<div class="gradient-border-invert h-full w-full"></div>
	</div>
</div>

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
	.gradient-border-invert {
		inset: 0;
		border-radius: 9999px;
		padding: 1px;
		background: linear-gradient(
			165deg,
			rgba(230, 230, 230, 0.4) 0%,
			rgb(210, 210, 210, 0.3) 15%,
			rgb(102, 102, 102, 0.3) 65%,
			rgba(0, 0, 0, 0.2) 100%
		);
		mask:
			linear-gradient(#fff 0 0) content-box,
			linear-gradient(#fff 0 0);
		-webkit-mask-composite: xor;
		mask-composite: exclude;
		z-index: -1;
	}
</style>
