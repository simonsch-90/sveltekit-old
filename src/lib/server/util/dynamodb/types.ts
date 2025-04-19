import type {
	DeleteRequest,
	KeysAndAttributes,
	PutRequest,
	WriteRequest,
} from '@aws-sdk/client-dynamodb';
import type { GetCommandInput, QueryCommandInput, ScanCommandInput } from '@aws-sdk/lib-dynamodb';
import type { NativeAttributeValue } from '@aws-sdk/util-dynamodb';
/**
 * The ProjectionExpression differs from dynamodb sdk spec to improve type safety.
 * Pass an array of properties to project.
 * ExpressionAttributeNames will automatically be added and do not need to be passed.
 **/
export type ProjectionExpression<K> = {
	ProjectionExpression?: K[];
};

export type GetItemInput<K> = Omit<GetCommandInput, 'TableName' | 'Key' | 'ProjectionExpression'> &
	ProjectionExpression<K>;

export type ScanQueryExt = {
	/** The maximum number of items to return.
	 * While Limit determines the items to evaluate, this ensures that at max X items are returned.
	 * Can also be used to increase efficiency to not keep searching for more items if the required item count is met. */
	MaxLimit?: number;
};

export type QueryInput<K> = Omit<QueryCommandInput, 'ProjectionExpression'> &
	ProjectionExpression<K> &
	ScanQueryExt;
export type ScanInput<K> = Omit<ScanCommandInput, 'ProjectionExpression'> &
	ProjectionExpression<K> &
	ScanQueryExt;

export type ClientWriteRequest = Omit<WriteRequest, 'PutRequest' | 'DeleteRequest'> & {
	PutRequest?: Omit<PutRequest, 'Item'> & {
		Item: Record<string, NativeAttributeValue>;
	};
	DeleteRequest?: Omit<DeleteRequest, 'Key'> & {
		Key: Record<string, NativeAttributeValue>;
	};
};
export type ClientBatchWriteRequest = Record<string, ClientWriteRequest[]>;

export type ClientReadRequest = Record<string, NativeAttributeValue>;
export type ClientBatchReadRequest = Record<
	string,
	Omit<KeysAndAttributes, 'Keys'> & {
		Keys: ClientReadRequest[];
	}
>;
