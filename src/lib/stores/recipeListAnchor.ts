import { writable } from 'svelte/store';

const createRecipeListAnchor = (recipeId: number) => {
	const { subscribe, set, update } = writable(recipeId);

	const inc = () => {
		update((count) => count + 1);
	};

	const dec = () => {
		update((count) => count - 1);
	};

	const reset = () => {
		set(0);
	};
	const udpate = (count: number) => {
		set(count);
	};

	return { subscribe, inc, dec, udpate, reset };
};

export const recipeListAnchor = createRecipeListAnchor(0);
