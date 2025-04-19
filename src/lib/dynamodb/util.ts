import type { DynamoDBDocumentClient, PutCommandInput } from '@aws-sdk/lib-dynamodb';
import dayjs from 'dayjs';
import {
	putItem as putItemCore,
	updateItem as updateItemCore,
	type UpdateItemInput,
} from '@dynamodb';

export const updateItem = async <T extends Record<string, unknown>>({
	tableName,
	key,
	item,
	overrides,
	documentClient,
}: UpdateItemInput<T>) => {
	return updateItemCore<T>({
		tableName,
		key,
		item,
		overrides: {
			ConditionExpression: 'attribute_exists(pk1)',
			...overrides,
		},
		documentClient,
		nested: false,
	});
};

/**
 * Put item to db setting requestOrigin
 */
export const putItem = async ({
	tableName,
	item,
	options,
	documentClient,
}: {
	tableName: string;
	item: PutCommandInput['Item'];
	options?: Omit<PutCommandInput, 'TableName' | 'Item'>;
	documentClient?: DynamoDBDocumentClient;
}) =>
	putItemCore({
		tableName,
		item: {
			createdAt: dayjs().toISOString(),
			updatedAt: dayjs().toISOString(),
			...item,
		},
		options,
		documentClient,
	});
