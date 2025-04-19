<script>
	export let classNames = '';
</script>

<div
	class="absolute left-0 top-0 flex h-full w-full flex-col content-normal items-stretch justify-between text-gray-300 {classNames}"
>
	<slot />
</div>
