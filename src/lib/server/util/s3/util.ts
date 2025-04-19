import {
	DeleteObjectCommand,
	DeleteObjectsCommand,
	GetObjectCommand,
	PutObjectCommand,
	S3Client,
} from '@aws-sdk/client-s3';
import type { PutObjectRequest } from '@aws-sdk/client-s3';
import { Upload } from '@aws-sdk/lib-storage';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getS3Client, throwError } from '..';

/**
 * Function for uploading buffers, blobs, or streams as multipart uploads where possible
 * @param input.bucketName the bucket used as destination for upload
 * @param input.bucketKey determines exact location of file in s3 bucket
 * @param input.body of the file uploaded to s3
 * @param input.s3Client optional s3Client used to perform upload
 */
export const uploadFile = (input: {
	bucketName: string;
	bucketKey: string;
	body: PutObjectRequest['Body'] | string | Uint8Array | Buffer;
	s3Client?: S3Client;
}) => {
	const { bucketName, bucketKey, body, s3Client } = input;
	const uploadToS3Done = new Upload({
		client: s3Client ?? getS3Client(),
		params: { Bucket: bucketName, Key: bucketKey, Body: body },
		queueSize: 4, // optional concurrency configuration
		partSize: 1024 * 1024 * 5, // optional size of each part, in bytes, at least 5MB
	});
	return uploadToS3Done.done();
};

export type GetFileInput = {
	bucketName: string;
	bucketKey: string;
	s3Client?: S3Client;
};

/**
 * Function for getting a file from s3
 * @param input.bucketName the bucket containing the file requested
 * @param input.bucketKey determines exact location of file in s3 bucket
 * @param input.s3Client optional s3Client used to perform download
 */
export const getFile = async (input: GetFileInput) => {
	const { bucketName, bucketKey, s3Client } = input;
	const client = s3Client ?? getS3Client();
	const command = new GetObjectCommand({
		Bucket: bucketName,
		Key: bucketKey,
	});
	const response = await client.send(command);

	return { body: response.Body, contentType: response.ContentType };
};

/**
 * Function for deleting a specific file in s3
 * @param input.bucketName the bucket used as destination for deletion
 * @param input.bucketKey determines exact location of file in s3 bucket
 * @param input.s3Client optional s3Client used to perform deletion
 */
export const deleteFile = async (input: {
	bucketName: string;
	bucketKey: string;
	s3Client?: S3Client;
}) => {
	const { bucketName, bucketKey, s3Client } = input;
	const client = s3Client ?? getS3Client();
	const command = new DeleteObjectCommand({
		Bucket: bucketName,
		Key: bucketKey,
	});
	await client.send(command);
};

/**
 * Function for deleting a batch of files in s3
 * @param input.bucketName the bucket used as destination for batch deletion
 * @param input.bucketKeys determines exact location of all files in s3 bucket
 * @param input.s3Client optional s3Client used to perform batch deletion
 */
export const batchDeleteFiles = async (input: {
	bucketName: string;
	bucketKeys: string[];
	s3Client?: S3Client;
}) => {
	const { bucketName, bucketKeys, s3Client } = input;
	const client = s3Client ?? getS3Client();
	const command = new DeleteObjectsCommand({
		Bucket: bucketName,
		Delete: {
			Objects: bucketKeys.map((key) => ({ Key: key })),
		},
	});
	await client.send(command);
};

/**
 * Function for creating a signed upload url which expires after a defined amount of time
 * @param input.bucketName the bucket used as destination for upload
 * @param input.bucketKey determines exact location of file in s3 bucket
 * @param input.expiration optional parameter determines number of seconds before the presigned URL expires (default = 600 seconds)
 * @param input.s3Client optional s3Client used to perform upload
 */
export const getSignedUploadUrl = async (input: {
	bucketName: string;
	bucketKey: string;
	expiration?: number;
	s3Client?: S3Client;
}) => {
	const { bucketName, bucketKey, expiration, s3Client } = input;
	const expiresIn = expiration ?? 600;
	const client = s3Client ?? getS3Client();
	const command = new PutObjectCommand({
		Bucket: bucketName,
		Key: bucketKey,
	});
	const uploadURL = await getSignedUrl(client, command, { expiresIn });
	return { uploadURL, bucketKey };
};

/**
 * Function for creating a signed url for downloading a file which expires after a defined amount of time
 * @param input.bucketName the bucket containing the file requested
 * @param input.bucketKey determines exact location of file in s3 bucket
 * @param input.expiration optional parameter determines number of seconds before the presigned URL expires (default = 600 seconds)
 * @param input.s3Client optional s3Client used to perform download
 * @returns signed url of the file and its bucketKey
 */
export const getSignedGetUrl = async (input: {
	bucketName: string;
	bucketKey: string;
	expiration?: number;
	s3Client?: S3Client;
}) => {
	const { bucketName, bucketKey, expiration, s3Client } = input;
	const expiresIn = expiration ?? 600;
	const client = s3Client ?? getS3Client();
	const command = new GetObjectCommand({
		Bucket: bucketName,
		Key: bucketKey,
	});
	const uploadURL = await getSignedUrl(client, command, { expiresIn });
	return { uploadURL, bucketKey };
};

/** Get a json object from S3 */
export const getS3Object = async <T>(input: GetFileInput) => {
	const { body } = await getFile(input);
	if (!body) return throwError(getS3Object, `Body is undefined!`);
	return JSON.parse(await body.transformToString()) as T;
};
