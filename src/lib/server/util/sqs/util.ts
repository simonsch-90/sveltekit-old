import {
	ChangeMessageVisibilityCommand,
	DeleteMessageBatchCommand,
	SendMessageBatchCommand,
	SendMessageCommand,
} from '@aws-sdk/client-sqs';
import type { SendMessageBatchRequestEntry } from '@aws-sdk/client-sqs';
import { Region, chunk } from '..';
import { getSQSClient } from '.';

export type SQSBatchItems = Array<{ id: string; body: string }>;

/** Send multiple messages to sqs. Batches requests as needed. */
export const sendMessagesToSQS = async (
	queueUrl: string,
	messages: SQSBatchItems,
	region?: Region,
	sqsClient = getSQSClient({ region })
) => {
	const entries = messages.map<SendMessageBatchRequestEntry>((message) => ({
		Id: message.id,
		MessageBody: message.body,
	}));
	// Chunk messages in batches of 10 (max limit of SQS)
	const chunks = chunk(entries, 10);

	return Promise.all(
		chunks.map((batch) =>
			sqsClient.send(new SendMessageBatchCommand({ QueueUrl: queueUrl, Entries: batch }))
		)
	);
};

/** Send a single message to sqs. To send multiple messages use sendMessagesToSQS instead for better efficiency */
export const sendMessageToSQS = async <T extends Record<string, any>>(
	queueUrl: string,
	body: T,
	region?: Region,
	sqsClient = getSQSClient({ region })
) => {
	return sqsClient.send(
		new SendMessageCommand({
			QueueUrl: queueUrl,
			MessageBody: JSON.stringify(body),
		})
	);
};

export const deleteMessagesFromSQS = async (
	queueUrl: string,
	receiptHandles: string[],
	region?: Region,
	sqsClient = getSQSClient({ region })
) => {
	const entries = receiptHandles.map((handle, id) => ({
		Id: `${id}`,
		ReceiptHandle: handle,
	}));

	// Chunk messages in batches of 10 (max limit of SQS)
	const chunks = chunk(entries, 10);

	return Promise.all(
		chunks.map((batch) =>
			sqsClient.send(
				new DeleteMessageBatchCommand({
					QueueUrl: queueUrl,
					Entries: batch,
				})
			)
		)
	);
};

export const changeMessageVisibility = async (
	queueUrl: string,
	receiptHandle: string,
	visibilityTimeout: number,
	region?: Region,
	sqsClient = getSQSClient({ region })
) =>
	sqsClient.send(
		new ChangeMessageVisibilityCommand({
			QueueUrl: queueUrl,
			ReceiptHandle: receiptHandle,
			VisibilityTimeout: visibilityTimeout,
		})
	);
