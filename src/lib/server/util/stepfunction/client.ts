import { SFNClient } from '@aws-sdk/client-sfn';
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { type AWSClientCollection, Region } from '..';

const sfnClients: AWSClientCollection<SFNClient> = {};
export type SFNClientConfig = {
	accountId?: string;
	region?: Region;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
};
export const getSFNClient = (config?: SFNClientConfig) => {
	const { region, credentials, accountId } = config || {};

	const clientKey = accountId ? accountId : 'default';
	const clientRegions = region || process.env.AWS_REGION || Region.us;

	/** Check if we already initialized a client for this account and region */
	const existingSFNClient = sfnClients[clientKey]?.[clientRegions];

	/** If we already initialized a client return it */
	if (existingSFNClient) return existingSFNClient;

	/** Init a new sfn client if necessary */
	const newSFNClient = new SFNClient({
		region: region || process.env.AWS_REGION || Region.us,
		credentials,
	});

	/** Keep initialized clients in collection */
	sfnClients[clientKey] = {
		...sfnClients[clientKey],
		[clientRegions]: newSFNClient,
	};
	return newSFNClient;
};
