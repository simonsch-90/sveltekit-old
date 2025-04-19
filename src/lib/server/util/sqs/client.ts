import { SQSClient } from '@aws-sdk/client-sqs';
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { type AWSClientCollection, Region } from '..';

const sqsClients: AWSClientCollection<SQSClient> = {};

export const getSQSClient = (input?: {
	accountId?: string;
	region?: Region;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
}) => {
	const { region, credentials, accountId } = input || {};

	const clientKey = accountId ? accountId : 'default';
	const clientRegions = region || process.env.AWS_REGION || Region.us;

	/** Check if we already initialized a client for this account and region */
	const existingSQSClient = sqsClients[clientKey]?.[clientRegions];

	/** If we already initialized a client return it */
	if (existingSQSClient) return existingSQSClient;

	/** Init a new sqs client if necessary */
	const newSQSClient = new SQSClient({
		region: region || process.env.AWS_REGION || Region.us,
		credentials,
	});

	/** Keep initialized clients in collection */
	sqsClients[clientKey] = {
		...sqsClients[clientKey],
		[clientRegions]: newSQSClient,
	};
	return newSQSClient;
};
