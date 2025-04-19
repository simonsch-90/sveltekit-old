import { AttributeValue } from '@aws-sdk/client-dynamodb';
import {
	DynamoDBDocumentClient,
	GetCommand,
	DeleteCommand,
	UpdateCommand,
	ScanCommand,
	QueryCommand,
	BatchGetCommand,
	BatchWriteCommand,
	PutCommand,
	type BatchGetCommandOutput,
	type BatchWriteCommandOutput,
	type DeleteCommandInput,
	type PutCommandInput,
	type UpdateCommandInput,
} from '@aws-sdk/lib-dynamodb';
import { unmarshall as awsunmarshall } from '@aws-sdk/util-dynamodb';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc.js';
import { throwError, logError, log, backOffExecution, chunk } from '..';
import { getDocumentDbClient } from './client';
import type {
	ClientBatchWriteRequest,
	ClientWriteRequest,
	ClientBatchReadRequest,
	QueryInput,
	GetItemInput,
	ScanInput,
} from '.';

// eslint-disable-next-line import/no-named-as-default-member
dayjs.extend(utc);

/**
 * Unmarshalls database entity into article type
 * @param image received by dynamoDb stream
 * @returns valid article type
 */
export const unmarshall = <TOutput>(
	...images: Array<{
		[key: string]: AttributeValue;
	}>
) => images.map((image) => awsunmarshall(image) as TOutput);

/** Generates the ProjectionExpression from an array of keys to project  */
export const getProjectionExpression = <T, K extends keyof T = keyof T>(
	options: GetItemInput<K> | QueryInput<K> | undefined
): string | undefined => {
	return options?.ProjectionExpression
		? options.ProjectionExpression.map((k) => `#${k.toString()}`).join(',')
		: undefined;
};

/** Adds all keys from the projection expression as ExpressionAttributeNames  */
export const getExpressionAttributeNames = <T, K extends keyof T = keyof T>(
	options?: GetItemInput<K> | QueryInput<K>
): Record<string, string> | undefined => {
	if (!options) return;
	const { ProjectionExpression, ExpressionAttributeNames } = options;
	return ProjectionExpression || ExpressionAttributeNames
		? {
				...options?.ProjectionExpression?.reduce(
					(acc, k) => ({
						...acc,
						[`#${k.toString()}`]: k,
					}),
					{}
				),
				...ExpressionAttributeNames,
			}
		: undefined;
};

/**
 * Wrapper function for dynamodb put operation
 * @param input.tableName where to put the item
 * @param input.item which should be put into db
 * @param input.options for the put command input
 * @param input.documentClient optional documentclient which could be used instead of default one
 */
export const putItem = async (input: {
	tableName: string;
	item: PutCommandInput['Item'];
	options?: Omit<PutCommandInput, 'TableName' | 'Item'>;
	documentClient?: DynamoDBDocumentClient;
}) => {
	const { tableName, item, options, documentClient } = input;
	const client = documentClient || getDocumentDbClient();
	return client.send(
		new PutCommand({
			TableName: tableName,
			Item: {
				...item,
			},
			...options,
		})
	);
};

/** Thrown in getItem when no item is found and failIfItemNotFound is true */
export class NotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = 'NotFoundError';
	}
}
export type GetItemProps<K> = {
	tableName: string;
	key: Record<string, string | number>;
	options?: GetItemInput<K>;
	failIfItemNotFound?: boolean;
	documentClient?: DynamoDBDocumentClient;
};
/**
 * Wrapper function for dynamodb get operation
 * @param input.tableName where to get the item
 * @param input.key of the item which should be get from db
 * @param input.options for the get command input
 * @param input.failIfItemNotFound determines if code should throw an error if item not found
 * @param input.documentClient optional documentclient which could be used instead of default one
 * @returns typed item in case it is found in db
 */
export const getItem = async <T, K extends keyof T = keyof T>(
	input: GetItemProps<K>
): Promise<Pick<T, K>> => {
	const { tableName, key, options, failIfItemNotFound = true, documentClient } = input;
	const client = documentClient || getDocumentDbClient();
	const response = await client.send(
		new GetCommand({
			TableName: tableName,
			Key: key,
			...options,
			ProjectionExpression: getProjectionExpression<T>(options),
			ExpressionAttributeNames: getExpressionAttributeNames<T>(options),
		})
	);

	if (!response.Item && failIfItemNotFound !== false)
		throwError(getItem, `No Item found for key: ${JSON.stringify(key)}!`, NotFoundError);

	return response.Item as Pick<T, K>;
};

/**
 * Wrapper function for dynamodb delete operation
 * @param input.tableName where to delete the item
 * @param input.key of the item which should be deleted
 * @param input.documentClient optional documentclient which could be used instead of default one
 */
export const deleteItem = async (input: {
	tableName: string;
	key: DeleteCommandInput['Key'];
	documentClient?: DynamoDBDocumentClient;
	returnItem?: boolean;
}) => {
	const { tableName, key, documentClient, returnItem } = input;
	const client = documentClient || getDocumentDbClient();
	return client.send(
		new DeleteCommand({
			TableName: tableName,
			Key: key,
			ReturnValues: returnItem ? 'ALL_OLD' : 'NONE',
		})
	);
};

/**
 * Recursively builds a nested update expression for a DynamoDB UpdateItem operation.
 * This will only update leafs in an object instead of updating the whole object
 * @param {Record<string, unknown>} nestedInput - The nested input object.
 * @param {UpdateCommandInput} params - The update command input parameters.
 * @param {string} pathPrefix - The prefix for the path.
 * @param {string} [parent=''] - The parent path.
 */
const buildNestedUpdateExpression = (
	nestedInput: Record<string, unknown>,
	params: UpdateCommandInput,
	pathPrefix: string,
	parent = ''
) => {
	Object.entries(nestedInput).forEach(([nestedKey, value], index) => {
		const fullPath = pathPrefix + `.#${nestedKey}`;
		const fullName = parent + index + nestedKey;
		const prefix = params.UpdateExpression?.includes('set') ? ', ' : 'set ';

		if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
			buildNestedUpdateExpression(value as Record<string, unknown>, params, fullPath, fullName);
		} else {
			params.UpdateExpression += `${prefix}#${fullName} = :${fullName}`;
			params.ExpressionAttributeValues![`:${fullName}`] = value;
			params.ExpressionAttributeNames![`#${fullName}`] = fullPath;
		}
	});
};

/**
 * Builds an update expression for a DynamoDB UpdateItem operation.
 * @param {UpdateCommandInput} newParams - The new parameters for the update command.
 * @param {string} attr - The attribute to update.
 * @param {any} value - The new value for the attribute.
 * @param {string} prefix - The prefix for the update expression.
 */
const buildUpdateExpression = (
	newParams: UpdateCommandInput,
	attr: string,
	value: unknown,
	prefix: string
) => {
	if (attr === 'createdAt' || attr === 'createdBy') {
		newParams.UpdateExpression += `${prefix}#${attr} = if_not_exists(#${attr}, :${attr})`;
	} else {
		newParams.UpdateExpression += `${prefix}#${attr} = :${attr}`;
	}
	newParams.ExpressionAttributeValues![`:${attr}`] = value;
	newParams.ExpressionAttributeNames![`#${attr}`] = attr;
};

/**
 * Gets the update operation for a DynamoDB UpdateItem operation.
 * @param {T} input - The input object.
 * @param {Record<string, any> | undefined} key - The key for the item to update.
 * @param {UpdateCommandInput} params - The update command input parameters.
 * @param {boolean} [nested=false] - Whether the update operation is nested. Nested updates only update leafs.
 * @returns {UpdateCommandInput} - The update command input for the operation.
 */
export const getUpdateOperation = <T extends Record<string, unknown>>(
	input: T,
	key: Record<string, unknown> | undefined,
	params: UpdateCommandInput,
	nested?: boolean
): UpdateCommandInput => {
	// Deep clone the params to prevent mutation
	const newParams = structuredClone(params);
	// The UpdateExpression is the string defining the update to perform. If it's not defined, set it to an empty string.
	newParams.UpdateExpression = newParams.UpdateExpression || '';
	newParams.ExpressionAttributeValues = newParams.ExpressionAttributeValues || {};
	newParams.ExpressionAttributeNames = newParams.ExpressionAttributeNames || {};
	// The prefix is used to create a chain of operations and must begin with set:  set x = 1, y = 2, ...
	let prefix = newParams.UpdateExpression.includes('set') ? ', ' : 'set ';

	// Iterate over each property in the input object
	Object.keys(input).forEach((k) => {
		const attribute = k as keyof T;
		const value = input[attribute];
		// If the attribute is a string (excluding the key attribute) and has a defined value...
		if (
			typeof attribute === 'string' &&
			key &&
			!Object.keys(key).includes(attribute) &&
			value !== undefined
		) {
			const attr = String(attribute);
			// If nested updates are permitted and the value is an object that is not an array, then recursively build a nested update expression.
			if (nested && typeof value === 'object' && !Array.isArray(value)) {
				buildNestedUpdateExpression(value as Record<string, unknown>, newParams, `#${attribute}`);
			} else {
				// Otherwise, build an update expression for this attribute and value, and append it to the existing UpdateExpression.
				buildUpdateExpression(newParams, attr, value, prefix);
				// Once the first 'set' operation is complete, prefix further 'set' operations with a comma.
				prefix = ', ';
			}
		}
	});

	return newParams;
};

type UpdateInputWithDefaultAttributes = {
	createdAt?: string;
	updatedAt?: string;
	requestOrigin?: string | null;
};

export type UpdateItemInput<T extends Record<string, unknown>> = {
	tableName: string;
	key: UpdateCommandInput['Key'];
	item?: T;
	overrides?: Partial<UpdateCommandInput>;
	documentClient?: DynamoDBDocumentClient;
	/** Add createdAt and updatedAt fields with utc timestamp. Default: true  */
	timestamps?: boolean;
	/** Add requestOrigin from AWS_REGION. Default: true  */
	requestOrigin?: boolean;
	/**
	 * Perform a nested update that only sets the leaf properties of an object.
	 * @see https://docs.aws.amazon.com/amazondynamodb/latest/developerguide/Expressions.UpdateExpressions.html#Expressions.UpdateExpressions.SET.AddingNestedMapAttributes
	 */
	nested?: boolean;
};

/**
 * Wrapper for function for dynamic updates of dynamoDB items, only values passed are updated.
 * The operation ONLY supports updates via SET operator.
 * @param input.tableName where the item which should be updated is located
 * @param input.key of the item which should be updated
 * @param input.item params containing new values for the update
 * @param input.overrides the operation creates a dynamodb update command, overrides are used to override defined behaviour
 * @param input.documentClient optional documentclient which could be used instead of default one
 * @returns the item after successfull update operation
 */
export const updateItem = async <T extends Record<string, unknown>>(
	updateInput: UpdateItemInput<T>
) => {
	/** Todo - Suggestion use a new parameter 'additionals' in addtion to overrides */

	const { tableName, key, item, overrides, documentClient, requestOrigin, timestamps, nested } = {
		requestOrigin: false,
		timestamps: true,
		...updateInput,
	};

	const client = documentClient || getDocumentDbClient();
	/** Update command input */
	let params: UpdateCommandInput = {
		TableName: tableName,
		Key: key,
		ExpressionAttributeValues: {},
		ExpressionAttributeNames: {},
		UpdateExpression: '',
		ReturnValues: 'UPDATED_NEW',
		...overrides,
	};

	/** Iterate through each property of the input item which should be updated and build udpdate expression for db call*/
	if (item) {
		const input = { ...item };

		// Add request origin to filter subscription events
		if (requestOrigin)
			(input as UpdateInputWithDefaultAttributes).requestOrigin = process.env.AWS_REGION;
		// Add timestamps
		if (timestamps) {
			(input as UpdateInputWithDefaultAttributes).createdAt = dayjs().utc().toISOString();
			(input as UpdateInputWithDefaultAttributes).updatedAt = dayjs().utc().toISOString();
		}
		params = getUpdateOperation<T>(input, key, params, nested);
	}

	const updateResponse = await client.send(new UpdateCommand(params));
	return { ...key, ...updateResponse.Attributes };
};

export type Optionals<T, K extends keyof T> = {
	callback?: (items?: Pick<T, K>[]) => Promise<void>;
	filterItems?: (items?: Pick<T, K>[]) => Promise<Pick<T, K>[]>;
	documentClient?: DynamoDBDocumentClient;
};

/**
 * Scans database and paginates through all pages to receive all data
 * @param input.params as input for scancommand
 * @param input.options.callback optional function which gets executed for each scanned page
 * @param input.options.documentClient optional documentclient which could be used instead of default one
 * @returns a typed array containing all data available
 */
export const scanAll = async <T extends Record<string, unknown>, K extends keyof T = keyof T>(
	params: ScanInput<K>,
	optionals?: Optionals<T, K>
): Promise<{ items: Pick<T, K>[]; lastEvaluatedKey?: Record<string, unknown> }> => {
	const client = optionals?.documentClient || getDocumentDbClient();
	/** Scan page */
	const data = await client.send(
		new ScanCommand({
			Limit: params.MaxLimit,
			...params,
			ProjectionExpression: getProjectionExpression<T>(params),
			ExpressionAttributeNames: getExpressionAttributeNames<T>(params),
		})
	);
	const items = (data.Items as Pick<T, K>[]) ?? [];

	/** Execute callback on page */
	if (optionals?.callback) await optionals.callback(items);

	/** Execute item filter on page */
	const filteredItems = optionals?.filterItems ? await optionals.filterItems(items) : items;

	/** If we hit the maxLimit we gathered enough items and can return them */
	if (params.MaxLimit && filteredItems.length >= params.MaxLimit)
		return {
			items: filteredItems,
			lastEvaluatedKey: data.LastEvaluatedKey,
		};
	/** If we receive LastEvaluatedKey we need to scan next page to receive all items */
	if (data.LastEvaluatedKey) {
		const nextScan = await scanAll<T, K>(
			{
				...params,
				MaxLimit: params.MaxLimit ? params.MaxLimit - filteredItems.length : undefined,
				ExclusiveStartKey: data.LastEvaluatedKey,
			},
			{ ...optionals, documentClient: client }
		);
		return {
			items: [...filteredItems, ...nextScan.items],
			lastEvaluatedKey: nextScan.lastEvaluatedKey,
		};
	}

	return { items: filteredItems };
};

/**
 * Queries database and paginates through all pages to receive all data
 * @param input.params as input for querycommand
 * @param input.options.callback optional function which gets executed for each queried page
 * @param input.options.documentClient optional documentclient which could be used instead of default one
 * @returns a typed array containing all data available
 */
export const queryAll = async <T extends Record<string, unknown>, K extends keyof T = keyof T>(
	params: QueryInput<K>,
	optionals?: Optionals<T, K>
): Promise<{ items: Pick<T, K>[]; lastEvaluatedKey?: Record<string, unknown> }> => {
	const client = optionals?.documentClient || getDocumentDbClient();
	/** Query page */
	const data = await client.send(
		new QueryCommand({
			Limit: params.MaxLimit,
			...params,
			ProjectionExpression: getProjectionExpression<T>(params),
			ExpressionAttributeNames: getExpressionAttributeNames<T>(params),
		})
	);
	const items = (data.Items ?? []) as Pick<T, K>[];

	/** Execute callback on page */
	if (optionals?.callback) await optionals.callback(items);

	/** Execute item filter on page */
	const filteredItems = optionals?.filterItems ? await optionals.filterItems(items) : items;

	/** If we hit the maxLimit we gathered enough items and can return them */
	if (params.MaxLimit && filteredItems.length >= params.MaxLimit)
		return {
			items: filteredItems,
			lastEvaluatedKey: data.LastEvaluatedKey,
		};
	/** If we receive LastEvaluatedKey we need to query next page to receive all items */
	if (data.LastEvaluatedKey) {
		const nextQuery = await queryAll<T, K>(
			{
				...params,
				MaxLimit: params.MaxLimit ? params.MaxLimit - filteredItems.length : undefined,
				ExclusiveStartKey: data.LastEvaluatedKey,
			},
			{ ...optionals, documentClient: client }
		);
		return {
			items: [...filteredItems, ...nextQuery.items],
			lastEvaluatedKey: nextQuery.lastEvaluatedKey,
		};
	}

	return { items: filteredItems };
};

export const PARTITION_PLACEHOLDER = '%part%';
/**
 * This function queries a DynamoDB table for all partitions in parallel.
 * It replaces the PARTITION_PLACEHOLDER (%part%) in the ExpressionAttributeValue with each partition id and queries for each partition.
 * @param params - The parameters object for the DynamoDB.Query API method.
 * One ExpressionAttributeValue used in the KeyConditionExpression must include the %part% placeholder.
 * @param numberOfPartitions - The number of partitions to query.
 * @param optionals - Additional optional parameters for the DynamoDB.Query API method.
 * @returns A promise that resolves to an array of items from all queried partitions flattened into a single array.
 */
export const queryAllPartitions = async <
	T extends Record<string, unknown>,
	K extends keyof T = keyof T,
>(
	{ ExpressionAttributeValues, ...params }: QueryInput<K>,
	numberOfPartitions: number,
	optionals?: Optionals<T, K>
) => {
	const partitionedAttribute =
		ExpressionAttributeValues &&
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
		Object.entries(ExpressionAttributeValues).find(([_key, value]) =>
			value.includes(PARTITION_PLACEHOLDER)
		);
	if (!partitionedAttribute || !params.KeyConditionExpression?.includes(partitionedAttribute[0]))
		return throwError(
			queryAllPartitions,
			`One ExpressionAttributeValue used in the KeyConditionExpression must include ${PARTITION_PLACEHOLDER} to replace with partition id!`
		);

	const promises = [];
	// Query all partitions in parallel
	for (let i = 0; i <= numberOfPartitions; i++) {
		promises.push(
			queryAll<T, K>(
				{
					ExpressionAttributeValues: {
						...ExpressionAttributeValues,
						[partitionedAttribute[0]]: partitionedAttribute[1].replace(
							PARTITION_PLACEHOLDER,
							i.toString()
						),
					},
					...params,
				},
				optionals
			)
		);
	}
	// combine results
	return (await Promise.all(promises)).flat();
};

/**
 * Takes a write request map for a batch operation and creates batch sized request maps
 * @param writeRequests map containing all write requests
 * @param batchSize defines amount of requests per map
 * @returns an array of batch write requests
 */
export const writeItemRequestBatcher = (
	writeRequests: ClientBatchWriteRequest,
	batchSize: number
) => {
	try {
		/** Iterate over each table key */
		return Object.entries(writeRequests).reduce((acc, [table, writes]) => {
			/** Build batches for each table */
			const batches = chunk(writes, batchSize).map((batch: unknown) => {
				return { [table]: batch } as ClientBatchWriteRequest;
			});
			/** Concat batch into array */
			return acc.concat(batches);
		}, [] as ClientBatchWriteRequest[]);
	} catch (error) {
		logError(writeItemRequestBatcher, { writeRequests, error });
		throw error;
	}
};

/**
 * Takes a write request map for a batch operation executes batches in parallel
 * @param input.writeRequests map containing all write requests
 * @param input.callback optional function which gets executed for each written batch
 * @param input.batchSize defines amount of requests per map (default = 25)
 * @param input.documentClient optional documentclient which could be used instead of default one
 * @returns an array of promises
 */
export const batchWriteParallel = (input: {
	writeRequests: ClientBatchWriteRequest;
	callback?: (batchWriteOutput: BatchWriteCommandOutput) => Promise<void>;
	batchSize?: number;
	documentClient?: DynamoDBDocumentClient;
}): Promise<BatchWriteCommandOutput[]> => {
	const { writeRequests, callback, batchSize, documentClient } = input;
	const client = documentClient || getDocumentDbClient();
	const batchSizeFinal = batchSize || 25;
	const batches = writeItemRequestBatcher(writeRequests, batchSizeFinal);
	const responses = batches.map(async (batch, index) => {
		const batchWriteOutput = await backOffExecution({
			functionName: batchWriteParallel.name,
			func: async () =>
				client.send(
					new BatchWriteCommand({
						RequestItems: batch,
						ReturnConsumedCapacity: 'INDEXES',
					})
				),
			requestBackOff: {
				jitter: 'full',
				startingDelay: 1000 * (index + 1),
				numOfAttempts: 5,
				errorCondition: (error: { name: string }) =>
					['ThrottlingException', 'ProvisionedThroughputExceededException'].some(
						(exceptionName) => error.name === exceptionName
					),
			},
		});

		/** Execute callback for each batch write */
		if (callback) await callback(batchWriteOutput);

		return batchWriteOutput;
	});
	return Promise.all(responses);
};

// This function calculates and returns the average size (in KB) of items in a batch of write requests.
const averageItemSizeAsKb = (writeRequests: ClientBatchWriteRequest) => {
	// Initialize a variable to store the total size of the write requests.
	let totalTableWriteRequestsSize = 0;

	// Convert the object of write requests into an array of key-value pairs.
	const writeRequestEntries = Object.entries(writeRequests);

	// Loop through the array of write requests.
	for (const [, writes] of writeRequestEntries) {
		// Convert each write request into a blob object and calculate its size.
		const blob = new Blob([JSON.stringify(writes)]);

		// Add the size of each blob (in KB) divided by the number of entries in the request to the total size.
		totalTableWriteRequestsSize += blob.size / 1024 / writes.length;
	}

	// Return the average size of the write requests by dividing the total size by the number of write requests.
	return totalTableWriteRequestsSize / writeRequestEntries.length;
};

/**
 * This function works as a load balancer for heavy write operations on dynamodb
 * it creates a number of bigger sequential batches, which themselves will be executed
 * as smaller parallel batches. The result is a very predictable load balanced write access
 * on dynamodb
 * @param input.writeRequests map containing all write requests
 * @param input.callback optional function which gets executed for each written batch
 * @param input.numberIndices defines amount of indices on a dynamodb table which determines final amount of wcu and so size of batches
 * @param input.wcuPerSecond amount of write capacity units per partition (default = 1000)
 * @param input.documentClient optional documentclient which could be used instead of default one
 * @returns an array of promises
 */
export const batchWriteSequential = async (input: {
	writeRequests: ClientBatchWriteRequest;
	callback?: (batchWriteOutput: BatchWriteCommandOutput) => Promise<void>;
	numberIndices?: number;
	wcuPerSecond?: number;
	documentClient?: DynamoDBDocumentClient;
}) => {
	const { writeRequests, callback, numberIndices, wcuPerSecond, documentClient } = input;
	const client = documentClient || getDocumentDbClient();
	const numberIndicesFinal = numberIndices || 1;
	const wcuPerSecondFinal = wcuPerSecond || 1000;
	const parallelBatchSize = 25;

	// We calculate the average item size to make sure we use the right amount of wcu
	const averageItemSize = averageItemSizeAsKb(writeRequests);

	// If average size bigger > 1 kb make sure to reduce amount of wcu used in batch
	const wcuItemSize = averageItemSize > 1 ? averageItemSize : 1;

	/** Create sequential batches */
	const sequentialBatches = writeItemRequestBatcher(
		writeRequests,
		wcuPerSecondFinal / numberIndicesFinal / wcuItemSize
	);

	for (const sequentialBatch of sequentialBatches) {
		/** For each sequential batch execute parallel batching */
		const batchWriteParallelResult = await batchWriteParallel({
			writeRequests: sequentialBatch,
			callback,
			batchSize: parallelBatchSize,
			documentClient: client,
		});

		/** For all parallel batch results build a flat map of unprocessed items */
		const unprocessedItems = batchWriteParallelResult.reduce((acc, item) => {
			if (item.UnprocessedItems) {
				Object.entries(item.UnprocessedItems).forEach(([table, items]) => {
					if (items) {
						if (acc[table]) {
							acc[table] = [...acc[table], ...items.filter((e): e is ClientWriteRequest => !!e)];
						} else {
							acc[table] = items as ClientWriteRequest[];
						}
					}
				});
			}
			return acc;
		}, {} as ClientBatchWriteRequest);

		/** Check if we have more then 0 items */
		if (unprocessedItems && Object.entries(unprocessedItems).length > 0) {
			log(batchWriteSequential, `Processing unprocessed`);
			if (process.env.DEBUG) log(batchWriteSequential, `Processing unprocessed`, unprocessedItems);

			/** Start backOff execution */
			await backOffExecution({
				functionName: batchWriteSequential.name,
				func: () =>
					batchWriteParallel({
						...input,
						writeRequests: unprocessedItems,
						batchSize: parallelBatchSize,
						documentClient: client,
					}),
				requestBackOff: {
					jitter: 'full',
					startingDelay: 2000,
					numOfAttempts: 5,
					errorCondition: (error: { name: string }) =>
						['ThrottlingException', 'ProvisionedThroughputExceededException'].some(
							(exceptionName) => error.name === exceptionName
						),
				},
			});
		}

		/** Timeout between sequential batches so wcu reset for next execution */
		await new Promise((resolve) => setTimeout(resolve, 1000));
	}
};

/**
 * Takes a read request map for a batch operation and creates batch sized request maps
 * @param readRequests map containing all read requests
 * @param batchSize defines amount of requests per map
 * @returns an array of batch read requests
 */
export const readItemRequestBatcher = (readRequests: ClientBatchReadRequest, batchSize: number) => {
	try {
		/** Iterate over each table key */
		return Object.entries(readRequests).reduce((acc, [table, reads]) => {
			/** Build batches for each table */
			const batches = chunk(reads.Keys, batchSize).map((batch: unknown) => {
				return { [table]: { Keys: batch } } as ClientBatchReadRequest;
			});
			/** Concat batch into array */
			return acc.concat(batches);
		}, [] as ClientBatchReadRequest[]);
	} catch (error) {
		logError(readItemRequestBatcher, { readRequests, error });
		throw error;
	}
};

/**
 * Takes an array of batchgetcommand results from parallel batch execution and creates an object with
 * keys to be reprocessed and result items
 * @param batchGetCommandOutputs array of results from parallel batch execution of batchget
 * @returns an object containing unprocessedKeys and result items
 */
export const readItemResultProcessor = <T>(batchGetCommandOutputs: BatchGetCommandOutput[]) => {
	const unprocessedKeys: ClientBatchReadRequest = {};
	let items: T[] = [];
	/** For all parallel batch results build a flat map of unprocessed keys and results */
	batchGetCommandOutputs.forEach((item) => {
		if (item.UnprocessedKeys) {
			Object.entries(item.UnprocessedKeys).forEach(([table, { Keys }]) => {
				if (Keys) {
					if (unprocessedKeys[table]?.Keys) {
						unprocessedKeys[table].Keys = [
							...unprocessedKeys[table].Keys,
							unprocessedKeys[table]?.Keys,
						];
					} else {
						unprocessedKeys[table] = {
							Keys,
						};
					}
				}
			});
		}
		if (item.Responses) {
			Object.entries(item.Responses).forEach(([_, itemResponses]) => {
				items = [...items, ...(itemResponses as T[])];
			});
		}
	});

	return { unprocessedKeys, items };
};

/**
 * Takes a read request map for a batch operation executes batches in parallel
 * @param input.readRequests map containing all read requests
 * @param input.callback optional function which gets executed for each written batch
 * @param input.batchSize defines amount of requests per map (default = 100)
 * @param input.documentClient optional documentclient which could be used instead of default one
 * @returns an array of promises
 */
export const batchRead = (input: {
	readRequests: ClientBatchReadRequest;
	callback?: (batchReadOutput: BatchGetCommandOutput) => Promise<void>;
	batchSize?: number;
	documentClient?: DynamoDBDocumentClient;
}) => {
	const { readRequests, callback, batchSize, documentClient } = input;
	const client = documentClient || getDocumentDbClient();
	const batchSizeFinal = batchSize || 100;
	const batches = readItemRequestBatcher(readRequests, batchSizeFinal);

	const responses = batches.map(async (batch) => {
		const batchGetOutput = await client.send(
			new BatchGetCommand({
				RequestItems: batch,
				ReturnConsumedCapacity: 'INDEXES',
			})
		);
		/** Execute callback for each batch write */
		if (callback) await callback(batchGetOutput);

		return batchGetOutput;
	});
	return Promise.all(responses);
};

/**
 * Executes batch read on one dynamodb table in parallel with defined batch size
 * @param input.tableName of dynamodb table which is target of batch read here
 * @param input.readRequests which should be read from database
 * @param input.callback optional function which gets executed for each read batch
 * @param input.batchSize which will determine how many items are queried in one batch (default = 100)
 * @param input.documentClient optional documentclient which could be used instead of default one
 * @returns array of typed items
 */
export const batchReadParallel = async <T>(input: {
	readRequests: ClientBatchReadRequest;
	callback?: (batchReadOutput: BatchGetCommandOutput) => Promise<void>;
	batchSize?: number;
	documentClient?: DynamoDBDocumentClient;
}): Promise<T[]> => {
	/** Execute parallel batching */
	const batchReadParallelResult = await batchRead(input);

	let finalItems: T[] = [];
	const { unprocessedKeys, items } = readItemResultProcessor<T>(batchReadParallelResult);
	finalItems = [...finalItems, ...items];

	/** Check if we have more then 0 keys */
	if (unprocessedKeys && Object.entries(unprocessedKeys).length > 0) {
		log(batchRead, `Processing unprocessed`);

		/** Start backOff execution */
		const unprocessedKeysResults = await backOffExecution({
			functionName: batchReadParallel.name,
			func: () =>
				batchRead({
					...input,
					readRequests: unprocessedKeys,
				}),
			requestBackOff: {
				jitter: 'full',
				startingDelay: 2000,
				numOfAttempts: 5,
				errorCondition: (error: any) => typeof error === 'object',
			},
		});

		const unprocessedResults = readItemResultProcessor<T>(unprocessedKeysResults);
		finalItems = [...finalItems, ...unprocessedResults.items];
	}
	return finalItems;
};

/**
 * This function works as a load balancer for heavy read operations on dynamodb
 * it creates a number of bigger sequential batches, which themselves will be executed
 * as smaller parallel batches. The result is a very predictable load balanced read access
 * on dynamodb
 * @param input.readRequests map containing all read requests
 * @param input.callback optional function which gets executed for each read batch
 * @param input.numberIndices defines amount of indices on a dynamodb table which determines final amount of rcu and so size of batches
 * @param input.wcuPerSecond amount of read capacity units per partition (default = 3000)
 * @param input.documentClient optional documentclient which could be used instead of default one
 * @returns an array of promises
 */
export const batchReadSequential = async <T>(input: {
	readRequests: ClientBatchReadRequest;
	callback?: (batchReadOutput: BatchGetCommandOutput) => Promise<void>;
	numberIndices?: number;
	rcuPerSecond?: number;
	documentClient?: DynamoDBDocumentClient;
}) => {
	const { readRequests, callback, numberIndices, rcuPerSecond, documentClient } = input;
	const client = documentClient || getDocumentDbClient();
	const numberIndicesFinal = numberIndices || 1;
	const rcuPerSecondFinal = rcuPerSecond || 1000;
	const parallelBatchSize = 100;

	/** Create sequential batches */
	const sequentialBatches = readItemRequestBatcher(
		readRequests,
		rcuPerSecondFinal / numberIndicesFinal
	);

	let finalItems: T[] = [];
	for (const sequentialBatch of sequentialBatches) {
		/** For each sequential batch execute parallel batching */
		const batchReadParallelResult = await batchRead({
			readRequests: sequentialBatch,
			callback,
			batchSize: parallelBatchSize,
			documentClient: client,
		});

		const { unprocessedKeys, items } = readItemResultProcessor<T>(batchReadParallelResult);
		finalItems = [...finalItems, ...items];
		/** Check if we have more then 0 keys */
		if (unprocessedKeys && Object.entries(unprocessedKeys).length > 0) {
			log(batchReadSequential, `Processing unprocessed`);
			/** Start backOff execution */
			const unprocessedKeysResults = await backOffExecution({
				functionName: batchReadSequential.name,
				func: () =>
					batchRead({
						...input,
						readRequests: unprocessedKeys,
						batchSize: parallelBatchSize,
						documentClient: client,
					}),
				requestBackOff: {
					jitter: 'full',
					startingDelay: 2000,
					numOfAttempts: 5,
					errorCondition: (error: any) => typeof error === 'object',
				},
			});

			const unprocessedResults = readItemResultProcessor<T>(unprocessedKeysResults);
			finalItems = [...finalItems, ...unprocessedResults.items];
		}

		/** Timeout between sequential batches so wcu reset for next execution */
		await new Promise((resolve) => setTimeout(resolve, 1000));
		return finalItems;
	}
};
