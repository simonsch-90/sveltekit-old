<script lang="ts">
	export let name: string;
	export let href: string;
</script>

<li>
	<a {href} type="button" class="w-full px-4 py-2 text-left text-sm font-medium">{name}</a>
</li>
