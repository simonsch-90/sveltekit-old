export const load = async (event) => {
	return {
		...event.data,
		similarTools: [
			{
				id: '0001',
				name: 'Pan',
				description: 'A pan is a normal kitchen tool used to pan frie stuff',
				s3Key: '/images/tools/uuid',
			},
			{
				id: '3456',
				name: 'Wok',
				s3Key: '/images/tools/uuid',
			},
			{
				id: '0357',
				name: 'Crepe-Pan',
				description: 'A pan especially useful for distributing crepe batter',
				s3Key: '/images/tools/uuid',
			},
			{
				id: '0676',
				name: 'Non-Stick-Pan',
				description: 'A non stick pan usually only heated medium or medium-low',
				s3Key: '/images/tools/uuid',
			},
			{
				id: '0657',
				name: 'Steel-Pan',
				description: 'A pan is a normal kitchen tool used to pan frie stuff',
				s3Key: '/images/tools/uuid',
			},
		],
	};
};
