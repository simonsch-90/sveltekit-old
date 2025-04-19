import { STSClient } from '@aws-sdk/client-sts';
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { type AWSClientCollection, Region } from '..';

const stsClients: AWSClientCollection<STSClient> = {};

export const getSTSClient = (input?: {
	accountId?: string;
	region?: Region;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
}) => {
	const { region, credentials, accountId } = input || {};

	const clientKey = accountId ? accountId : 'default';
	const clientRegions = region || process.env.AWS_REGION || Region.us;

	/** Check if we already initialized a client for this account and region */
	const existingSTSClient = stsClients[clientKey]?.[clientRegions];

	/** If we already initialized a client return it */
	if (existingSTSClient) return existingSTSClient;

	/** Init a new sts client if necessary */
	const newSTSClient = new STSClient({
		region: region || process.env.AWS_REGION || Region.us,
		credentials,
	});

	/** Keep initialized clients in collection */
	stsClients[clientKey] = {
		...stsClients[clientKey],
		[clientRegions]: newSTSClient,
	};
	return newSTSClient;
};
