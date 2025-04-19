import { CloudFormationClient } from '@aws-sdk/client-cloudformation';
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { type AWSClientCollection, Region } from '..';

const cloudFormationClients: AWSClientCollection<CloudFormationClient> = {};

/** @public */
export const getCloudFormationClient = (input?: {
	accountId?: string;
	region?: Region;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
}) => {
	const { region, credentials, accountId } = input || {};

	const clientKey = accountId ? accountId : 'default';
	const clientRegions = region || process.env.AWS_REGION || Region.us;

	/** Check if we already initialized a client for this account and region */
	const existingCloudFormationClient = cloudFormationClients[clientKey]?.[clientRegions];

	/** If we already initialized a client return it */
	if (existingCloudFormationClient) return existingCloudFormationClient;

	/** Init a new sfn client if necessary */
	const newCloudFormationClients = new CloudFormationClient({
		region: region || process.env.AWS_REGION || Region.us,
		credentials,
	});

	/** Keep initialized clients in collection */
	cloudFormationClients[clientKey] = {
		...cloudFormationClients[clientKey],
		[clientRegions]: newCloudFormationClients,
	};
	return newCloudFormationClients;
};
