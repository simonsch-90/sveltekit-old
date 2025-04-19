<script lang="ts">
	export let title: string;
	export let name: string;
</script>

<div class="w-full p-8">
	<h2>{title}</h2>
	<input class="w-full bg-slate-800" type="text" {name} />
</div>
