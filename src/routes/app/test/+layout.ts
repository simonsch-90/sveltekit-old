export const load = async () => {
	return {
		upcomingRecipes: [
			{
				id: '0',
				name: 'Stir Fry',
			},
			{
				id: '1',
				name: 'Chicken Sandwich',
			},
			{
				id: '2',
				name: 'French Soup',
			},
		], // Tomorrow you will eat
		recentRecipes: [
			{
				id: '3',
				name: 'Mac and Cheese',
			},
			{
				id: '4',
				name: 'Pasta al Arrabiata',
			},
			{
				id: '2',
				name: 'Caesar Salad',
			},
		], // New in the app
		popularRecipes: [
			{
				id: '5',
				name: 'Fried Chicken Tenders',
			},
			{
				id: '6',
				name: 'Broccoli cheddar soup',
			},
			{
				id: '7',
				name: 'Grandmas Pancakes Deluxe',
			},
		], // Many likes
	};
};
