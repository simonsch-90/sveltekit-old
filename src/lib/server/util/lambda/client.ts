import { LambdaClient } from '@aws-sdk/client-lambda';
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { type AWSClientCollection, Region, getValidatedEnv, assume } from '..';

const lambdaClients: AWSClientCollection<LambdaClient> = {};

export const getLambdaClient = (input?: {
	accountId?: string;
	region?: Region;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
}) => {
	const { region, credentials, accountId } = input || {};

	const clientKey = accountId ? accountId : 'default';
	const clientRegions = region || process.env.AWS_REGION || Region.us;

	/** Check if we already initialized a client for this account and region */
	const existingLambdaClient = lambdaClients[clientKey]?.[clientRegions];

	/** If we already initialized a client return it */
	if (existingLambdaClient) return existingLambdaClient;

	/** Init a new lambda client if necessary */
	const newLambdaClient = new LambdaClient({
		region: region || process.env.AWS_REGION || Region.us,
		credentials,
	});

	/** Keep initialized clients in collection */
	lambdaClients[clientKey] = {
		...lambdaClients[clientKey],
		[clientRegions]: newLambdaClient,
	};
	return newLambdaClient;
};

/**
 * Creates a lambda client assuming the cross account role
 * for invoking lambda functions
 */
export const getMLLambdaClient = async (input: { region?: Region }) => {
	const { region } = input;
	const { ML_ACCOUNT_ID } = getValidatedEnv(['ML_ACCOUNT_ID']);
	const credentials = await assume(
		`arn:aws:iam::${ML_ACCOUNT_ID}:role/MLNeuraverseCrossAccountAccessRole`,
		'MLNeuraverseCrossAccountAccessSession'
	);
	return getLambdaClient({ region, credentials });
};
