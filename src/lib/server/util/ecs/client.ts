import { ECSClient } from '@aws-sdk/client-ecs';
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { type AWSClientCollection, Region } from '..';

const ecsClients: AWSClientCollection<ECSClient> = {};

export const getECSClient = (input?: {
	accountId?: string;
	region?: Region;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
}) => {
	const { region, credentials, accountId } = input || {};

	const clientKey = accountId ? accountId : 'default';
	const clientRegions = region || process.env.AWS_REGION || Region.us;

	/** Check if we already initialized a client for this account and region */
	const existingECSClient = ecsClients[clientKey]?.[clientRegions];

	/** If we already initialized a client return it */
	if (existingECSClient) return existingECSClient;

	/** Init a new ecs client if necessary */
	const newECSClient = new ECSClient({
		region: region || process.env.AWS_REGION || Region.us,
		credentials,
	});

	/** Keep initialized clients in collection */
	ecsClients[clientKey] = {
		...ecsClients[clientKey],
		[clientRegions]: newECSClient,
	};
	return newECSClient;
};
