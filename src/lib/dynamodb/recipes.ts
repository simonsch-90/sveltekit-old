import { putItem } from './util';

export type CreateRecipeInput = {
	pk1: string;
	sk1: string;
};

export type UpdateRecipeInput = {
	pk1: string;
	sk1: string;
};

export type DeleteRecipeInput = {
	pk1: string;
	sk1: string;
};
export type GetRecipeInput = {
	pk1: string;
	sk1: string;
};
export type ListRecipesInput = {
	pk1: string;
	sk1: string;
};

export type Recipe = {
	pk1: string;
	sk1: string;
};

export const createRecipe = (input: CreateRecipeInput) =>
	putItem({
		tableName: 'recipes',
		item: input,
	});

export const updateRecipe = () => {};
export const deleteRecipe = () => {};
export const getRecipe = () => {};
export const listRecipes = () => {};
