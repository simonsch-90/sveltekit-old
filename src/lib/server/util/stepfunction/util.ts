import {
	DescribeExecutionCommand,
	SFNClient,
	SendTaskFailureCommand,
	SendTaskSuccessCommand,
	StartExecutionCommand,
} from '@aws-sdk/client-sfn';
import { STSClient } from '@aws-sdk/client-sts';
import { Region, getCurrentAccountId } from '..';
import { getSFNClient, type SFNClientConfig } from '.';

/** Type used for Orchestrator StepFunction integration, where the step function injects a generated taskToken. */
export type TaskToken = {
	event: { body: { taskToken: string } };
};

/**
 * Makes state machine arn using the current user and current region.
 * @param name state machine name.
 * @param stsClient optional securityTokenService client
 * @returns state machine arn
 */
export const getStateMachineArn = async ({
	name,
	region,
	stsClient,
}: {
	name: string;
	region: Region;
	stsClient?: STSClient;
}) => {
	// Gets current account id async
	const accountId = await getCurrentAccountId(stsClient);
	// Concatenates the given information and returns aws arn for the given state machine.
	return `arn:aws:states:${region}:${accountId}:stateMachine:${name}`;
};

/**
 * Starts the given state machine for provided name.
 * @param input.stateMachineName name of the state machine
 * @param input.payload for starting state machine
 * @param input.stateMachineExecutionName defines name of execution of state machine
 * @param input.sfnClient optional step functions client
 * @returns execution result
 */
export const startStateMachineByName = async (input: {
	stateMachineName: string;
	payload: Record<string, unknown>;
	stateMachineExecutionName?: string;
	sfnClient?: SFNClient;
	region?: Region;
}) => {
	const { stateMachineName, payload, stateMachineExecutionName, sfnClient, region } = input;

	const client = sfnClient || getSFNClient();

	// Makes state machine arn.
	const stateMachineArn = await getStateMachineArn({
		name: stateMachineName,
		region: region ?? ((await client.config.region()) as Region),
	});
	// Starts state machine.
	const response = await client.send(
		new StartExecutionCommand({
			stateMachineArn,
			name: stateMachineExecutionName,
			input: JSON.stringify(payload),
		})
	);
	// Gets execution information.
	const execution = await client.send(
		new DescribeExecutionCommand({ executionArn: response.executionArn })
	);
	// Returns execution result.
	return execution;
};

/**
 * Starts the given state machine for provided arn.
 * @param input.stateMachineArn arn of state machine
 * @param input.payload for starting state machine
 * @param input.stateMachineExecutionName defines name of execution of state machine
 * @param input.sfnClient optional step functions client
 * @returns execution result
 */
export const startStateMachineByArn = async (input: {
	stateMachineArn: string;
	payload: Record<string, unknown>;
	stateMachineExecutionName?: string;
	sfnClient?: SFNClient;
}) => {
	const { stateMachineArn, payload, stateMachineExecutionName, sfnClient } = input;
	const client = sfnClient || getSFNClient();
	// Starts state machine.
	const response = await client.send(
		new StartExecutionCommand({
			stateMachineArn,
			name: stateMachineExecutionName,
			input: JSON.stringify(payload),
		})
	);
	// Gets execution information.
	const execution = await client.send(
		new DescribeExecutionCommand({ executionArn: response.executionArn })
	);
	// Returns execution result.
	return execution;
};

/** Notify a step function that the async task was successful
 * @param {string} taskToken - The unique token for the task.
 * @param {T} output - The return value of the task. This value will be used in the next state of the step function.
 * @param {SFNClientConfig} config - (Optional) The configuration settings for the AWS Step Functions service client.
 */
export const sendTaskSuccess = async <T>(taskToken: string, output: T, config?: SFNClientConfig) =>
	getSFNClient(config).send(
		new SendTaskSuccessCommand({
			taskToken,
			output: JSON.stringify(output),
		})
	);

/** Notify a step function that the async task failed
 * @param {string} taskToken - The unique token for the task.
 * @param {string} error - (Optional) Information about the error that occured
 * @param {string} cause - (Optional) The reason the task failed
 * @param {SFNClientConfig} config - (Optional) The configuration settings for the AWS Step Functions service client.
 */
export const sendTaskFailure = async (
	taskToken: string,
	error?: string,
	cause?: string,
	config?: SFNClientConfig
) =>
	getSFNClient(config).send(
		new SendTaskFailureCommand({
			taskToken,
			error,
			cause,
		})
	);
