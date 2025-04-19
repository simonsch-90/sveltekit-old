import {
	AutoScalingClient,
	DescribeAutoScalingGroupsCommand,
	UpdateAutoScalingGroupCommand,
} from '@aws-sdk/client-auto-scaling';
import { log, sleep, waitForAgent } from '..';
import { getAutoScalingClient } from '.';

/**
 * Returns true if auto scaling group instances are up and running.
 * @param autoScalingGroupName auto scaling group's name
 * @param autoScalingClient optional autoscaling client
 * @returns
 * @public
 */
export const areInstancesUp = async (
	autoScalingGroupName: string,
	autoScalingClient: AutoScalingClient = getAutoScalingClient()
) => {
	// Gets auto scaling group info.
	const response = await autoScalingClient.send(
		new DescribeAutoScalingGroupsCommand({
			AutoScalingGroupNames: [autoScalingGroupName],
		})
	);

	const instances = response.AutoScalingGroups?.[0]?.Instances;
	// Logs instances in output.
	log(areInstancesUp, !!instances?.length, instances);
	// Normally there is one result. Returns false as there is no autoscaling group found.
	if (!response.AutoScalingGroups || response.AutoScalingGroups.length <= 0) return false;
	// Finds one healthy instance.
	const healthy = instances?.find((e) => e.HealthStatus == 'Healthy');
	// Returns true if a healthy instance is found.
	return !!healthy;
};

/**
 * Waits for auto scaling group's instances to get up and running.
 * @param autoScalingGroupName auto scaling group's name
 * @param maxTimout max timeout value, default is 3 minutes
 * @param autoScalingClient optional autoscaling client
 */
export const waitForInstances = async (
	autoScalingGroupName: string,
	maxTimout = 3 * 60,
	autoScalingClient: AutoScalingClient = getAutoScalingClient()
) => {
	// Sets ready flag to false
	let ready = false;
	// Continues as long as it is not ready, we call this inside lambda.
	// So it is safe
	while (!ready && maxTimout > 0) {
		maxTimout -= 5;
		await sleep(5);
		ready = await areInstancesUp(autoScalingGroupName, autoScalingClient);
	}
};

/**
 * Scales group up and runs an instance.
 * @param autoScalingGroupName auto scale group name
 * @param cluster if set function will wait for ecs agent to be connected
 * @param awaitInstances function will check and wait until instances are up and running
 * @param autoScalingClient optional autoscaling client
 * @public
 */
export const scaleUp = async (
	autoScalingGroupName: string,
	cluster?: string,
	awaitInstances: boolean = false,
	autoScalingClient: AutoScalingClient = getAutoScalingClient()
) => {
	// Scales auto scaling group up, so one instance is going to get instantiated.
	await autoScalingClient.send(
		new UpdateAutoScalingGroupCommand({
			AutoScalingGroupName: autoScalingGroupName,
			MinSize: 1,
			MaxSize: 1,
			DesiredCapacity: 1,
		})
	);

	// Waits for auto scaling group to get ready
	if (awaitInstances === true) await waitForInstances(autoScalingGroupName);
	// If there is cluster name provided, waits for container agent to get connected.
	if (cluster) await waitForAgent(cluster);
};

/**
 * Scales group down and terminates instances.
 * Sets min, max and desired capacity to 0, it consequences to terminate the running instance.
 * @param autoScalingGroupName auto scale group name.
 * @param autoScalingClient optional autoscaling client
 * @public
 */
export const scaleDown = async (
	autoScalingGroupName: string,
	autoScalingClient: AutoScalingClient = getAutoScalingClient()
) =>
	autoScalingClient.send(
		new UpdateAutoScalingGroupCommand({
			AutoScalingGroupName: autoScalingGroupName,
			MinSize: 0,
			MaxSize: 0,
			DesiredCapacity: 0,
		})
	);
