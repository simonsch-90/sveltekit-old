import { S3Client } from '@aws-sdk/client-s3';
import type { AwsCredentialIdentity, Provider } from '@aws-sdk/types';
import { type AWSClientCollection, Region } from '..';

const s3Clients: AWSClientCollection<S3Client> = {};

export const getS3Client = (input?: {
	accountId?: string;
	region?: Region;
	credentials?: AwsCredentialIdentity | Provider<AwsCredentialIdentity>;
}) => {
	const { region, credentials, accountId } = input || {};

	const clientKey = accountId ? accountId : 'default';
	const clientRegions = region || process.env.AWS_REGION || Region.us;

	/** Check if we already initialized a client for this account and region */
	const existingS3Client = s3Clients[clientKey]?.[clientRegions];

	/** If we already initialized a client return it */
	if (existingS3Client) return existingS3Client;

	/** Init a new s3 client if necessary */
	const newS3Client = new S3Client({
		region: region || process.env.AWS_REGION || Region.us,
		credentials,
	});

	/** Keep initialized clients in collection */
	s3Clients[clientKey] = {
		...s3Clients[clientKey],
		[clientRegions]: newS3Client,
	};
	return newS3Client;
};
