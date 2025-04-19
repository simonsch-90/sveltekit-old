import { SESClient } from '@aws-sdk/client-ses';
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { type AWSClientCollection, Region, getValidatedEnv, assume } from '..';

const sesClients: AWSClientCollection<SESClient> = {};

export const getSESClient = (input?: {
	accountId?: string;
	region?: Region;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
}) => {
	const { region, credentials, accountId } = input || {};

	const clientKey = accountId ? accountId : 'default';
	const clientRegions = region || process.env.AWS_REGION || Region.us;

	/** Check if we already initialized a client for this account and region */
	const existingSESClient = sesClients[clientKey]?.[clientRegions];

	/** If we already initialized a client return it */
	if (existingSESClient) return existingSESClient;

	/** Init a new ses client if necessary */
	const newSESClient = new SESClient({
		region: region || process.env.AWS_REGION || Region.us,
		credentials,
	});

	/** Keep initialized clients in collection */
	sesClients[clientKey] = {
		...sesClients[clientKey],
		[clientRegions]: newSESClient,
	};
	return newSESClient;
};

/**
 * Creates a ses client assuming the cross account role
 * for accessing AWS Simple Email Service
 */
export const getMLSESClient = async (input: { region?: Region }) => {
	const { region } = input;
	const { ML_ACCOUNT_ID } = getValidatedEnv(['ML_ACCOUNT_ID']);
	const credentials = await assume(
		`arn:aws:iam::${ML_ACCOUNT_ID}:role/MLNeuraverseCrossAccountAccessRole`,
		'MLNeuraverseCrossAccountAccessSession'
	);
	return getSESClient({ region, credentials });
};
