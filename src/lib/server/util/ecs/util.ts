import {
	DescribeContainerInstancesCommand,
	DescribeTaskDefinitionCommand,
	ECSClient,
	ListContainerInstancesCommand,
} from '@aws-sdk/client-ecs';
import { STSClient } from '@aws-sdk/client-sts';
import { sleep, log, getValidatedEnv, getCurrentAccountId } from '..';
import { getECSClient } from '.';

/**
 * Return true when container agents are connected to the given cluster.
 * @param cluster cluster name
 * @param ecsClient optional ecs client
 * @returns agent connectivity flag
 */
export const isAgentConnected = async (cluster: string, ecsClient: ECSClient = getECSClient()) => {
	// List container instances inside the given cluster.
	await ecsClient.send(
		new ListContainerInstancesCommand({
			cluster,
		})
	);
	const response = await ecsClient.send(
		new ListContainerInstancesCommand({
			cluster,
		})
	);
	// Collects container instance names.
	const containerInstances = response.containerInstanceArns?.map((e) => e);
	// Checks that there are container instances available. There is no container found, returns false.
	if (!containerInstances || containerInstances.length <= 0) return false;
	// Fetches instances information.
	const instances = await ecsClient.send(
		new DescribeContainerInstancesCommand({
			cluster,
			containerInstances,
		})
	);

	// Finds first connected agent.
	const connected = instances.containerInstances?.find((e) => e.agentConnected);
	// Returns true if there is a connected agent.
	return !!connected;
};

/**
 * Waits for agents to get connected to the given cluster.
 * @param cluster cluster name
 * @param ecsClient optional ecs client
 */
export const waitForAgent = async (cluster: string, ecsClient: ECSClient = getECSClient()) => {
	// Sets connected flag to false.
	let connected = false;
	// Repeats process as long as connected flag is false.
	while (!connected) {
		// Sleeps for 5 seconds, to reduce hits.
		await sleep(5);
		// Updates connected flag with the result of connected agent quering.
		connected = await isAgentConnected(cluster, ecsClient);
		// Outputs information for tracing.
		log(waitForAgent, `Cluster [${cluster}] is ready? [${connected}]`);
	}
};

/**
 * Makes ecs cluster arn using the current user and current region.
 * @param name state machine name.
 * @param stsClient optional securityTokenService client
 * @returns state machine arn
 */
export const getECSClusterArn = async (name: string, stsClient?: STSClient) => {
	const { AWS_REGION } = getValidatedEnv(['AWS_REGION']);
	// Gets current account idasync
	const accountId = await getCurrentAccountId(stsClient);
	// Concats the given information and returns aws arn for the given cluster.
	return `arn:aws:ecs:${AWS_REGION}:${accountId}:cluster/${name}`;
};

/**
 * Makes task definition arn using service client and current region.
 * @param name task definition name.
 * @param ecsClient optional ecs client
 * @returns task arn
 */
export const getECSTaskDefinition = async (name: string, ecsClient: ECSClient = getECSClient()) => {
	const response = await ecsClient.send(
		new DescribeTaskDefinitionCommand({
			taskDefinition: name,
		})
	);
	return response.taskDefinition;
};
