import { fail, type Actions, redirect } from '@sveltejs/kit';
import { zfd } from 'zod-form-data';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	return {};
};

export const actions: Actions = {
	createRecipe: async ({ request }) => {
		const formData = await request.formData();
		const recipeSchema = zfd.formData({
			title: zfd.text(),
			description: zfd.text(),
			sources: zfd.
		});

		const result = recipeSchema.safeParse(formData);

		if (!result.success)
			return fail(400, {
				data: Object.fromEntries(formData),
				error: result.error.flatten().fieldErrors,
			});

		throw redirect(303, '/forge/recipe');
	},
};
