import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Bucket } from 'sst/node/bucket';
import type { PageServerLoad } from '../../$types';

export const load = (async ({ locals }) => {
	const session = await locals.getSession();
	const command = new PutObjectCommand({
		ACL: 'public-read',
		Key: session?.user?.expires ?? 'HIHI',
		Bucket: Bucket.filebucket.bucketName,
		ContentType: 'image/jpeg',
	});
	const url = await getSignedUrl(new S3Client({}), command);

	return { url };
}) satisfies PageServerLoad;
