export const load = async (event) => {
	return {
		...event.data,
		similarIngredients: [
			{
				id: '0001',
				name: 'Bell Pepper',
				description: 'A nice big round pepper.',
				s3Key: '/images/ingredient/uuid',
			},
			{
				id: '3456',
				name: 'Chili Pepper',
				s3Key: '/images/ingredient/uuid',
			},
			{
				id: '0357',
				name: 'Exotic-Pepper',
				description: 'Usually not found very often in supermarkets, grow it yourself.',
				s3Key: '/images/ingredient/uuid',
			},
			{
				id: '0676',
				name: 'Green Pepper',
				description: 'A beautiful green pepper.',
				s3Key: '/images/tooingredientls/uuid',
			},
			{
				id: '0657',
				name: 'Red Pepper',
				description: 'A shiny red pepper.',
				s3Key: '/images/ingredient/uuid',
			},
		],
	};
};
