import { StackContext, Table } from 'sst/constructs';

const userTable = ({ stack }: StackContext) =>
	new Table(stack, 'users', {
		fields: {
			pk: 'string',
			sk: 'string',
			GSI1PK: 'string',
			GSI1SK: 'string',
		},
		primaryIndex: { partitionKey: 'pk', sortKey: 'sk' },
		globalIndexes: { GSI1: { partitionKey: 'GSI1PK', sortKey: 'GSI1SK' } },
		timeToLiveAttribute: 'expires',
		cdk: {
			table: {
				tableName: 'users',
			},
		},
	});

const postTable = ({ stack }: StackContext) =>
	new Table(stack, 'posts', {
		fields: {
			id: 'string',
			title: 'string',
			body: 'string',
			userId: 'string',
			tags: 'string',
			reactions: 'number',
		},
		primaryIndex: { partitionKey: 'id' },
	});

export { userTable, postTable };
