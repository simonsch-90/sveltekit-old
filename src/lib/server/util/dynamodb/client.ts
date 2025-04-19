import { DynamoDBClient } from '@aws-sdk/client-dynamodb';
import { DynamoDBDocumentClient } from '@aws-sdk/lib-dynamodb';
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { type AWSClientCollection, Region, getValidatedEnv, assume } from '..';

const dynamoDbClients: AWSClientCollection<DynamoDBClient> = {};
const documentDbClients: AWSClientCollection<DynamoDBDocumentClient> = {};

export const getDynamoDbClient = (input?: {
	accounId?: string;
	region?: Region;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
	accountId?: string;
}) => {
	const { region, credentials, accountId } = input || {};

	const clientKey = accountId ? accountId : 'default';
	const clientRegions = region || process.env.AWS_REGION || Region.us;

	/** Check if we already initialized a client for this account and region */
	const existingDynamoDbClient = dynamoDbClients[clientKey]?.[clientRegions];

	/** If we already initialized a client return it */
	if (existingDynamoDbClient) return existingDynamoDbClient;

	/** Init a new dynamodb client if necessary */
	const newDynamoDbClient = new DynamoDBClient({
		region: region || process.env.AWS_REGION || Region.us,
		credentials,
	});

	/** Keep initialized clients in collection */
	dynamoDbClients[clientKey] = {
		...dynamoDbClients[clientKey],
		[clientRegions]: newDynamoDbClient,
	};
	return newDynamoDbClient;
};

export const getDocumentDbClient = (input?: {
	region?: Region;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
	accountId?: string;
}) => {
	const { region, credentials, accountId } = input || {};
	const clientKey = accountId ? accountId : 'default';
	const clientRegions = region || process.env.AWS_REGION || Region.us;

	/** Check if we already initialized a client for this account and region */
	const existingDocumentDbClient = documentDbClients[clientKey]?.[clientRegions];

	/** If we already initialized a client return it */
	if (existingDocumentDbClient) return existingDocumentDbClient;

	const dynamoDbClient = getDynamoDbClient({ region, credentials, accountId });
	/** Init a new dynamodb client if necessary */
	const newDocumentDbClient = DynamoDBDocumentClient.from(dynamoDbClient, {
		marshallOptions: {
			removeUndefinedValues: true,
		},
	});

	/** Keep initialized clients in collection */
	documentDbClients[clientKey] = {
		...documentDbClients[clientKey],
		[clientRegions]: newDocumentDbClient,
	};
	return newDocumentDbClient;
};

/**
 * Creates a dynamodb client assuming the cross account role
 * for accessing dynamodb tables
 */
export const getMLDynamoDbClient = async (input?: { region?: Region }) => {
	const { region } = input || {};
	const { ML_ACCOUNT_ID } = getValidatedEnv(['ML_ACCOUNT_ID']);
	const credentials = await assume(
		`arn:aws:iam::${ML_ACCOUNT_ID}:role/MLNeuraverseCrossAccountAccessRole`,
		'MLNeuraverseCrossAccountAccessSession'
	);
	return getDynamoDbClient({ region, credentials, accountId: ML_ACCOUNT_ID });
};

/**
 * Creates a document client assuming the cross account role
 * for accessing dynamodb tables
 */
export const getMLDocumentDbClient = async (input?: { region?: Region }) => {
	const { region } = input || {};
	const { ML_ACCOUNT_ID } = getValidatedEnv(['ML_ACCOUNT_ID']);
	const credentials = await assume(
		`arn:aws:iam::${ML_ACCOUNT_ID}:role/MLNeuraverseCrossAccountAccessRole`,
		'MLNeuraverseCrossAccountAccessSession'
	);
	return getDocumentDbClient({ region, credentials, accountId: ML_ACCOUNT_ID });
};
