import { AutoScalingClient } from '@aws-sdk/client-auto-scaling';
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { type AWSClientCollection, Region } from '..';

const autoScalingClients: AWSClientCollection<AutoScalingClient> = {};

/** @public */
export const getAutoScalingClient = (input?: {
	accountId?: string;
	region?: Region;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
}) => {
	const { region, credentials, accountId } = input || {};

	const clientKey = accountId ? accountId : 'default';
	const clientRegions = region || process.env.AWS_REGION || Region.us;

	/** Check if we already initialized a client for this account and region */
	const existingAutoScalingClient = autoScalingClients[clientKey]?.[clientRegions];

	/** If we already initialized a client return it */
	if (existingAutoScalingClient) return existingAutoScalingClient;

	/** Init a new sfn client if necessary */
	const newAutoScalingClient = new AutoScalingClient({
		region: region || process.env.AWS_REGION || Region.us,
		credentials,
	});

	/** Keep initialized clients in collection */
	autoScalingClients[clientKey] = {
		...autoScalingClients[clientKey],
		[clientRegions]: newAutoScalingClient,
	};
	return newAutoScalingClient;
};
