import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Bucket } from 'sst/node/bucket';
import type { PageServerLoad } from './$types';

export const load = (async (event) => {
	const { params } = event;
	const command = new PutObjectCommand({
		ACL: 'public-read',
		Key: crypto.randomUUID(),
		Bucket: Bucket.filebucket.bucketName,
	});
	const url = await getSignedUrl(new S3Client({}), command);
	return { ...params, url };
}) satisfies PageServerLoad;
