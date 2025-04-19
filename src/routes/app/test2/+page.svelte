<script lang="ts">
	import { onMount } from 'svelte';
	import type { PageData } from './$types';
	import html2canvas from 'html2canvas';
	export let data: PageData;

	const aspectRatio = 3 / 4;

	const height = 3000;
	const width = height * aspectRatio;

	// Function to capture the content of the div
	const captureDivContent = async () => {
		const divToCapture: HTMLElement | null = document.getElementById('aspect-div');
		const textHeader: HTMLElement | null = document.getElementById('text-header');

		if (divToCapture && textHeader) {
			divToCapture.style.width = `${width}px`; // Set the desired width
			divToCapture.style.height = `${height}px`; // Set the desired height
			const scaleFactor = Math.min(width, height);

			// Calculate scale factor for the text
			textHeader.style.fontSize = `${scaleFactor}%`;
			// Position the aspect-div off-screen
			divToCapture.style.position = 'absolute';
			divToCapture.style.top = '-9999px';
			divToCapture.style.left = '-9999px';
			// Use html2canvas to capture the content of the div
			const canvasDataUrl = await html2canvas(divToCapture, {
				width,
				height,
				scale: 1, // Set scale to 1 to prevent scaling
				useCORS: true, // Enable CORS to allow images from different origins
				allowTaint: true, // Allow images to be loaded even if they violate CORS
			}).then((canvas) => canvas.toDataURL());

			// Convert the canvas data URL to Blob
			const blob = await (await fetch(canvasDataUrl)).blob();

			// Create a file from Blob
			const file = new File([blob], 'captured_content.jpg', { type: 'image/jpeg' });

			// Trigger download
			saveAs(file);

			// Reset aspect-div to its original size or any other default size

			// Reset the position of the aspect-div
			divToCapture.style.position = '';
			divToCapture.style.top = '';
			divToCapture.style.left = ''; // Reset text scale
		}
	};

	// Function to trigger download
	const saveAs = (file: File) => {
		const url = URL.createObjectURL(file);
		const link = document.createElement('a');
		link.href = url;
		link.download = file.name;
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	};
	onMount(() => {
		const divToCapture: HTMLElement | null = document.getElementById('aspect-div');
		const textHeader: HTMLElement | null = document.getElementById('text-header');

		if (divToCapture && textHeader) {
			const scaleFactor = Math.min(divToCapture.offsetWidth, divToCapture.offsetHeight);

			// Apply scale factor to the text
			textHeader.style.fontSize = `${scaleFactor}%`;
		}
	});
</script>

<div class="block h-full">
	<div class="flex h-full w-full flex-col items-center justify-center">
		<div
			id="aspect-div"
			class="aspect-div aspect-[3/4] h-2/3 bg-cover bg-center"
			style="background-image: url('/images/cat.jpeg');"
		>
			<div class="grid h-full w-full grid-cols-1 grid-rows-5">
				<div
					class="z-10 col-span-full row-span-full h-full bg-gradient-to-t from-black from-15% to-transparent to-40% opacity-80"
				></div>
				<div class="z-30 col-span-full row-span-1 row-start-1 bg-slate-500">
					<span id="text-header" class="origin-top-left">TEST</span>
				</div>
			</div>
		</div>
		<button on:click={captureDivContent}>Click</button>
	</div>
</div>
