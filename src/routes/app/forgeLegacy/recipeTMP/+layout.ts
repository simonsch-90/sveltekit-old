export const load = async () => {
	return {
		initial: [
			{
				title: `Let's start with some basics:`,
				questions: [
					{
						title: 'How is the recipe called?',
						name: 'title',
					},
					{
						title: 'Describe your recipe',
						name: 'description',
					},
				],
			},
			{
				title: `Where did you find the recipe:`,
				questions: [
					{
						title: 'Add a source',
						name: 'source',
					},
				],
			},
			{
				title: `Upload some photos of your meal`,
				questions: [
					{
						title: 'Add an image',
						name: 'image',
					},
				],
			},
		],
	};
};
