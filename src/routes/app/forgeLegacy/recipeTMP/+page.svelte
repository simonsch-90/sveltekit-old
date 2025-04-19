<script lang="ts">
	import { enhance } from '$app/forms';


	import { ShareAllSolid } from 'flowbite-svelte-icons';

	export let data;

</script>

<form class="h-full w-full p-4" method="POST" use:enhance>
	<section class="flex h-full w-full flex-col justify-center gap-4">
		<div class="flex flex-col justify-center gap-2">
			<h1>Let's start with some basics</h1>
			<div>
				<input
					class="w-full rounded border bg-slate-800 focus:border-sky-500"
					type="text"
					placeholder="Give your recipe a title"
				/>
			</div>
		</div>

		<div class="flex flex-col justify-center gap-4">
			<h1>Wanna keep it private for now?</h1>
			<div class="grid w-full grid-cols-2 gap-4">
				<input type="radio" id="private" checked name="privacy" value="private" class="hidden" />
				<label
					for="private"
					class="flex aspect-square flex-col items-center justify-center rounded-lg border border-gray-300 text-center"
				>
					<ShareAllSolid class="h-16 w-16"></ShareAllSolid>
					<span>Private</span>
				</label>

				<input type="radio" id="public" name="privacy" value="public" class="hidden" />
				<label
					for="public"
					class="flex aspect-square flex-col items-center justify-center rounded-lg border border-gray-300 text-center"
				>
					<ShareAllSolid class="h-16 w-16"></ShareAllSolid>
					<span>Public</span>
				</label>
			</div>
		</div>
	</section>
</form>

<style>
	input[type='radio']:checked + label {
		border-color: #4f46e5; /* Change border color when radio is checked */
	}
</style>
