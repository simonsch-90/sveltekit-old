import { CloudWatchClient } from '@aws-sdk/client-cloudwatch';
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { type AWSClientCollection, Region } from '..';

const CloudwatchClients: AWSClientCollection<CloudWatchClient> = {};

export const getCloudwatchClient = (input?: {
	accountId?: string;
	region?: Region;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
}) => {
	const { region, credentials, accountId } = input || {};

	const clientKey = accountId ? accountId : 'default';
	const clientRegions = region || process.env.AWS_REGION || Region.us;

	/** Check if we already initialized a client for this account and region */
	const existingCloudwatchClient = CloudwatchClients[clientKey]?.[clientRegions];

	/** If we already initialized a client return it */
	if (existingCloudwatchClient) return existingCloudwatchClient;

	/** Init a new Cloudwatch client if necessary */
	const newCloudwatchClient = new CloudWatchClient({
		region: region || process.env.AWS_REGION || Region.us,
		credentials,
	});

	/** Keep initialized clients in collection */
	CloudwatchClients[clientKey] = {
		...CloudwatchClients[clientKey],
		[clientRegions]: newCloudwatchClient,
	};
	return newCloudwatchClient;
};
